// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {KiteController} from "../src/registrar/KiteController.sol";
import {Script, console} from "forge-std/Script.sol";

/// @title Configure
/// @notice Post-deployment configuration: reserved names, etc.
contract Configure is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address controllerProxy = vm.envAddress("CONTROLLER_PROXY_ADDRESS");

        KiteController controller = KiteController(controllerProxy);

        vm.startBroadcast(deployerPrivateKey);

        // Reserve premium/sensitive names
        string[10] memory reserved =
            ["admin", "kite", "kiteid", "support", "help", "system", "official", "moderator", "governance", "treasury"];

        for (uint256 i; i < reserved.length; i++) {
            controller.setReservedName(reserved[i], true);
            console.log("Reserved:", reserved[i]);
        }

        vm.stopBroadcast();

        console.log("\nConfiguration complete!");
    }
}
