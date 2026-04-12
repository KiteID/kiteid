// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteBaseRegistrar} from "../../src/interfaces/IKiteBaseRegistrar.sol";
import {IKiteRegistry} from "../../src/interfaces/IKiteRegistry.sol";
import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {KiteBaseRegistrar} from "../../src/registrar/KiteBaseRegistrar.sol";
import {KiteController} from "../../src/registrar/KiteController.sol";
import {LinearPremiumPriceOracle} from "../../src/registrar/LinearPremiumPriceOracle.sol";
import {StablePriceOracle} from "../../src/registrar/StablePriceOracle.sol";
import {KiteRegistry} from "../../src/registry/KiteRegistry.sol";
import {KiteResolver} from "../../src/resolvers/KiteResolver.sol";
import {KiteReverseRegistrar} from "../../src/reverseRegistrar/KiteReverseRegistrar.sol";
import {TestConstants} from "./TestConstants.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Test} from "forge-std/Test.sol";

/// @title DeployHelper
/// @notice Full stack deploy helper for integration tests
abstract contract DeployHelper is Test {
    KiteRegistry public registry;
    KiteBaseRegistrar public registrar;
    KiteController public controller;
    KiteResolver public resolver;
    LinearPremiumPriceOracle public priceOracle;
    KiteReverseRegistrar public reverseRegistrar;

    bytes32 public constant ROOT_NODE = bytes32(0);
    bytes32 public constant KITE_LABEL = keccak256("kite");
    bytes32 public kiteNode;

    address public deployer;

    function _deployFullStack(
        address _deployer
    ) internal {
        deployer = _deployer;
        vm.startPrank(deployer);

        // 1. Deploy Registry
        registry = new KiteRegistry();
        kiteNode = keccak256(abi.encodePacked(ROOT_NODE, KITE_LABEL));

        // 2. Deploy BaseRegistrar
        registrar = new KiteBaseRegistrar(IKiteRegistry(address(registry)), kiteNode);

        // 3. Give registrar ownership of .kite node
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, address(registrar));

        // 4. Deploy Price Oracle
        uint256[5] memory prices;
        prices[0] = 0; // 1 char (unused)
        prices[1] = 0; // 2 char (unused)
        prices[2] = 640 ether; // 3 char
        prices[3] = 160 ether; // 4 char
        prices[4] = 5 ether; // 5+ char
        priceOracle = new LinearPremiumPriceOracle(prices, 100 ether);

        // 5. Deploy Resolver
        resolver = new KiteResolver(IKiteRegistry(address(registry)));

        // 6. Setup reverse namespace: root -> "reverse" -> "addr"
        bytes32 reverseNode = registry.setSubnodeOwner(ROOT_NODE, keccak256("reverse"), deployer);
        bytes32 addrReverseNode = registry.setSubnodeOwner(reverseNode, keccak256("addr"), deployer);
        reverseRegistrar = new KiteReverseRegistrar(IKiteRegistry(address(registry)), address(resolver));
        registry.setOwner(addrReverseNode, address(reverseRegistrar));

        // 7. Deploy Controller (UUPS proxy)
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
        ERC1967Proxy proxy = new ERC1967Proxy(address(controllerImpl), initData);
        controller = KiteController(address(proxy));

        // 8. Wire up controllers
        registrar.addController(address(controller));
        reverseRegistrar.addController(address(controller));

        vm.stopPrank();
    }
}
