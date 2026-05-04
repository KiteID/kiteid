// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {KiteWrapper} from "../src/wrapper/KiteWrapper.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Script, console} from "forge-std/Script.sol";

/// @title DeployWrapper
/// @notice Deploys KiteWrapper as UUPS proxy, initializes, and registers relayer as controller
contract DeployWrapper is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("RELAYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Phase 1 contracts (already deployed)
        address baseRegistrar = vm.envAddress("BASE_REGISTRAR_ADDRESS");
        // Relayer wallet is both owner and first controller
        address owner = deployer;

        console.log("Deployer/Relayer:", deployer);
        console.log("BaseRegistrar:", baseRegistrar);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerKey);

        // 1. Deploy implementation (empty constructor, disableInitializers)
        KiteWrapper impl = new KiteWrapper();
        console.log("KiteWrapper (impl):", address(impl));

        // 2. Encode initialize call
        bytes memory initData = abi.encodeCall(KiteWrapper.initialize, (IERC721(baseRegistrar), owner));

        // 3. Deploy UUPS proxy + initialize
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        KiteWrapper wrapper = KiteWrapper(address(proxy));
        console.log("KiteWrapper (proxy):", address(proxy));

        // 4. Register relayer wallet as controller
        wrapper.addController(deployer);
        console.log("Controller registered:", deployer);

        // 5. Verify
        bool isController = wrapper.controllers(deployer);
        require(isController, "Controller registration failed");
        console.log("Controller verified:", isController);

        vm.stopBroadcast();

        console.log("\n=== KiteWrapper Deployment Complete ===");
        console.log("Proxy (WRAPPER_ADDRESS):", address(proxy));
        console.log("Implementation:", address(impl));
        console.log("Owner:", owner);
        console.log("Controller:", deployer);
    }
}
