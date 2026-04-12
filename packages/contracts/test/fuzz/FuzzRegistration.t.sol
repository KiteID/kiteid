// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {KiteController} from "../../src/registrar/KiteController.sol";
import {StringUtils} from "../../src/utils/StringUtils.sol";
import {DeployHelper} from "../helpers/DeployHelper.sol";
import {Test} from "forge-std/Test.sol";

contract FuzzRegistrationTest is DeployHelper {
    using StringUtils for string;

    address public alice = makeAddr("alice");
    bytes32 public constant SECRET = keccak256("fuzz-secret");

    function setUp() public {
        _deployFullStack(address(this));
        vm.deal(alice, 100_000 ether);
    }

    /// @notice Fuzz test: any valid duration should register successfully
    function testFuzz_register_validDuration(
        uint256 duration
    ) public {
        duration = bound(duration, 28 days, 3652.5 days);
        string memory name = "fuzzname";
        bytes[] memory data = new bytes[](0);

        bytes32 commitment = controller.makeCommitment(name, alice, duration, SECRET, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        IPriceOracle.Price memory price = controller.rentPrice(name, duration);
        vm.prank(alice);
        controller.register{value: price.base + price.premium}(name, alice, duration, SECRET, address(0), data, false);

        uint256 tokenId = uint256(keccak256(bytes(name)));
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    /// @notice Fuzz test: pricing is always proportional to duration
    function testFuzz_pricing_proportional(
        uint256 duration
    ) public view {
        duration = bound(duration, 28 days, 3652.5 days);

        IPriceOracle.Price memory price = controller.rentPrice("alice", duration);
        // 5 KITE/year, so price should scale linearly
        uint256 expected = (5 ether * duration) / 365.25 days;
        assertApproxEqAbs(price.base, expected, 1); // rounding tolerance
    }

    /// @notice Fuzz test: commitment timing enforcement
    function testFuzz_commitTiming(
        uint256 waitTime
    ) public {
        waitTime = bound(waitTime, 0, 48 hours);
        string memory name = "timing";
        bytes[] memory data = new bytes[](0);

        bytes32 commitment = controller.makeCommitment(name, alice, 365 days, SECRET, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + waitTime);

        IPriceOracle.Price memory price = controller.rentPrice(name, 365 days);

        if (waitTime < 60) {
            // Too new
            vm.prank(alice);
            vm.expectRevert();
            controller.register{value: price.base + price.premium}(
                name, alice, 365 days, SECRET, address(0), data, false
            );
        } else if (waitTime > 24 hours) {
            // Too old
            vm.prank(alice);
            vm.expectRevert();
            controller.register{value: price.base + price.premium}(
                name, alice, 365 days, SECRET, address(0), data, false
            );
        } else {
            // Valid window
            vm.prank(alice);
            controller.register{value: price.base + price.premium}(
                name, alice, 365 days, SECRET, address(0), data, false
            );
            assertEq(registrar.ownerOf(uint256(keccak256(bytes(name)))), alice);
        }
    }
}
