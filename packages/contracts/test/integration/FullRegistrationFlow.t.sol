// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {KiteController} from "../../src/registrar/KiteController.sol";
import {StringUtils} from "../../src/utils/StringUtils.sol";
import {DeployHelper} from "../helpers/DeployHelper.sol";
import {Test} from "forge-std/Test.sol";

contract FullRegistrationFlowTest is DeployHelper {
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    bytes32 public constant SECRET = keccak256("integration-secret");
    uint256 public constant ONE_YEAR = 365.25 days;

    function setUp() public {
        _deployFullStack(address(this));
        vm.deal(alice, 10_000 ether);
        vm.deal(bob, 10_000 ether);
        vm.deal(charlie, 10_000 ether);
    }

    // ============ Full Registration Flow ============

    function test_fullFlow_commitRevealRegister() public {
        string memory name = "alice";
        bytes[] memory data = new bytes[](0);

        // 1. Commit
        bytes32 commitment = controller.makeCommitment(name, alice, ONE_YEAR, SECRET, address(0), data, false);
        vm.prank(alice);
        controller.commit(commitment);

        // 2. Wait for commitment age
        vm.warp(block.timestamp + 61);

        // 3. Register
        IPriceOracle.Price memory price = controller.rentPrice(name, ONE_YEAR);
        vm.prank(alice);
        controller.register{value: price.base + price.premium}(name, alice, ONE_YEAR, SECRET, address(0), data, false);

        // 4. Verify
        uint256 tokenId = uint256(keccak256(bytes(name)));
        assertEq(registrar.ownerOf(tokenId), alice);
        assertFalse(controller.available(name));
    }

    function test_fullFlow_registerWithResolver() public {
        string memory name = "bob";
        bytes[] memory data = new bytes[](1);
        data[0] = abi.encodeWithSignature("setAddr(bytes32,address)", StringUtils.namehash("bob"), bob);

        bytes32 commitment = controller.makeCommitment(name, bob, ONE_YEAR, SECRET, address(resolver), data, false);
        vm.prank(bob);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        IPriceOracle.Price memory price = controller.rentPrice(name, ONE_YEAR);
        vm.prank(bob);
        controller.register{value: price.base + price.premium}(
            name, bob, ONE_YEAR, SECRET, address(resolver), data, false
        );

        // Verify resolver is set
        bytes32 node = StringUtils.namehash("bob");
        assertEq(registry.resolver(node), address(resolver));
    }

    function test_fullFlow_renewal() public {
        // Register
        _register("alice", alice, ONE_YEAR);

        uint256 tokenId = uint256(keccak256(bytes("alice")));
        uint256 oldExpiry = registrar.nameExpires(tokenId);

        // Renew
        vm.prank(alice);
        controller.renew{value: 200 ether}("alice", ONE_YEAR);

        assertGt(registrar.nameExpires(tokenId), oldExpiry);
    }

    function test_fullFlow_transferAndReclaim() public {
        _register("alice", alice, ONE_YEAR);

        uint256 tokenId = uint256(keccak256(bytes("alice")));

        // Transfer NFT
        vm.prank(alice);
        registrar.transferFrom(alice, bob, tokenId);
        assertEq(registrar.ownerOf(tokenId), bob);

        // Bob reclaims registry ownership
        vm.prank(bob);
        registrar.reclaim(tokenId, bob);

        bytes32 aliceSubnode = keccak256(abi.encodePacked(kiteNode, bytes32(tokenId)));
        assertEq(registry.owner(aliceSubnode), bob);
    }

    function test_fullFlow_expiryAndReregistration() public {
        _register("alice", alice, ONE_YEAR);

        uint256 tokenId = uint256(keccak256(bytes("alice")));

        // Warp past expiry + grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);
        assertTrue(registrar.available(tokenId));

        // Bob can re-register
        _register("alice", bob, ONE_YEAR);
        assertEq(registrar.ownerOf(tokenId), bob);
    }

    function test_fullFlow_multipleNames() public {
        _register("alice", alice, ONE_YEAR);
        _register("bob", bob, ONE_YEAR);
        _register("charlie", charlie, ONE_YEAR);

        assertEq(registrar.ownerOf(uint256(keccak256(bytes("alice")))), alice);
        assertEq(registrar.ownerOf(uint256(keccak256(bytes("bob")))), bob);
        assertEq(registrar.ownerOf(uint256(keccak256(bytes("charlie")))), charlie);
    }

    function test_fullFlow_pricingTiers() public {
        // 3-char: 640 KITE/yr
        IPriceOracle.Price memory price3 = controller.rentPrice("abc", ONE_YEAR);
        assertApproxEqAbs(price3.base, 640 ether, 0.01 ether);

        // 4-char: 160 KITE/yr
        IPriceOracle.Price memory price4 = controller.rentPrice("test", ONE_YEAR);
        assertApproxEqAbs(price4.base, 160 ether, 0.01 ether);

        // 5+-char: 5 KITE/yr
        IPriceOracle.Price memory price5 = controller.rentPrice("alice", ONE_YEAR);
        assertApproxEqAbs(price5.base, 5 ether, 0.01 ether);
    }

    // ============ Helpers ============

    function _register(
        string memory name,
        address owner,
        uint256 duration
    ) internal {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment(name, owner, duration, SECRET, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        IPriceOracle.Price memory price = controller.rentPrice(name, duration);
        vm.prank(owner);
        controller.register{value: price.base + price.premium + 100 ether}(
            name, owner, duration, SECRET, address(0), data, false
        );
    }
}
