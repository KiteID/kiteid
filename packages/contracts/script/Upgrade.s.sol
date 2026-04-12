// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {KiteController} from "../src/registrar/KiteController.sol";
import {Script, console} from "forge-std/Script.sol";

/// @title Upgrade
/// @notice UUPS upgrade script for KiteController
contract Upgrade is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address controllerProxy = vm.envAddress("CONTROLLER_PROXY_ADDRESS");

        console.log("Upgrading controller at:", controllerProxy);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        KiteController newImpl = new KiteController();
        console.log("New implementation:", address(newImpl));

        // Upgrade proxy
        KiteController controller = KiteController(controllerProxy);
        controller.upgradeToAndCall(address(newImpl), "");

        console.log("Upgrade complete!");

        vm.stopBroadcast();
    }
}
