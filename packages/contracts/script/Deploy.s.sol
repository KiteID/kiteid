// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteBaseRegistrar} from "../src/interfaces/IKiteBaseRegistrar.sol";
import {IKiteRegistry} from "../src/interfaces/IKiteRegistry.sol";
import {IPriceOracle} from "../src/registrar/IPriceOracle.sol";
import {KiteBaseRegistrar} from "../src/registrar/KiteBaseRegistrar.sol";
import {KiteController} from "../src/registrar/KiteController.sol";
import {LinearPremiumPriceOracle} from "../src/registrar/LinearPremiumPriceOracle.sol";
import {KiteRegistry} from "../src/registry/KiteRegistry.sol";
import {KiteResolver} from "../src/resolvers/KiteResolver.sol";
import {KiteReverseRegistrar} from "../src/reverseRegistrar/KiteReverseRegistrar.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Script, console} from "forge-std/Script.sol";

/// @title Deploy
/// @notice Full V1 deployment script for KiteID contracts
contract Deploy is Script {
    bytes32 public constant ROOT_NODE = bytes32(0);
    bytes32 public constant KITE_LABEL = keccak256("kite");
    bytes32 public constant REVERSE_LABEL = keccak256("reverse");
    bytes32 public constant ADDR_LABEL = keccak256("addr");

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Registry
        KiteRegistry registry = new KiteRegistry();
        console.log("KiteRegistry:", address(registry));

        // 2. Deploy BaseRegistrar
        bytes32 kiteNode = keccak256(abi.encodePacked(ROOT_NODE, KITE_LABEL));
        KiteBaseRegistrar registrar = new KiteBaseRegistrar(IKiteRegistry(address(registry)), kiteNode);
        console.log("KiteBaseRegistrar:", address(registrar));

        // 3. Setup .kite node
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, address(registrar));

        // 4. Deploy Price Oracle (KITE denominated, 18 decimals)
        uint256[5] memory prices;
        prices[0] = 0; // 1 char reserved
        prices[1] = 0; // 2 char reserved
        prices[2] = 640 ether; // 3 char: 640 KITE/yr
        prices[3] = 160 ether; // 4 char: 160 KITE/yr
        prices[4] = 5 ether; // 5+ char: 5 KITE/yr
        LinearPremiumPriceOracle priceOracle = new LinearPremiumPriceOracle(prices, 100 ether);
        console.log("LinearPremiumPriceOracle:", address(priceOracle));

        // 5. Deploy Resolver
        KiteResolver resolver = new KiteResolver(IKiteRegistry(address(registry)));
        console.log("KiteResolver:", address(resolver));

        // 6. Setup reverse registrar
        bytes32 reverseNode = registry.setSubnodeOwner(ROOT_NODE, REVERSE_LABEL, deployer);
        bytes32 addrReverseNode = registry.setSubnodeOwner(reverseNode, ADDR_LABEL, deployer);
        KiteReverseRegistrar reverseRegistrar =
            new KiteReverseRegistrar(IKiteRegistry(address(registry)), address(resolver));
        registry.setOwner(addrReverseNode, address(reverseRegistrar));
        console.log("KiteReverseRegistrar:", address(reverseRegistrar));

        // 7. Deploy Controller (UUPS Proxy)
        KiteController controllerImpl = new KiteController();
        bytes memory initData = abi.encodeCall(
            KiteController.initialize,
            (
                IKiteBaseRegistrar(address(registrar)),
                IPriceOracle(address(priceOracle)),
                IKiteRegistry(address(registry)),
                address(reverseRegistrar),
                deployer
            )
        );
        ERC1967Proxy controllerProxy = new ERC1967Proxy(address(controllerImpl), initData);
        KiteController controller = KiteController(address(controllerProxy));
        console.log("KiteController (proxy):", address(controller));
        console.log("KiteController (impl):", address(controllerImpl));

        // 8. Wire up controller
        registrar.addController(address(controller));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Registry:", address(registry));
        console.log("Registrar:", address(registrar));
        console.log("Controller:", address(controller));
        console.log("Resolver:", address(resolver));
        console.log("PriceOracle:", address(priceOracle));
        console.log("ReverseRegistrar:", address(reverseRegistrar));
    }
}
