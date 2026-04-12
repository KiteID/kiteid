// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {KiteController} from "../../src/registrar/KiteController.sol";
import {KiteResolver} from "../../src/resolvers/KiteResolver.sol";
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

    // ============ Regression: Dutch Auction Integration ============

    function test_fullFlow_dutchAuctionPremiumDecays() public {
        _register("alice", alice, ONE_YEAR);

        uint256 tokenId = uint256(keccak256(bytes("alice")));
        uint256 oldExpiry = registrar.nameExpires(tokenId);

        // Warp past expiry + grace + 1 day into auction
        vm.warp(oldExpiry + 90 days + 1 days);
        assertTrue(registrar.available(tokenId));

        IPriceOracle.Price memory priceEarly = controller.rentPrice("alice", ONE_YEAR);
        assertGt(priceEarly.premium, 0, "premium > 0 early in auction");

        // Warp further: +7 days into auction (halfway)
        vm.warp(oldExpiry + 90 days + 7 days);
        IPriceOracle.Price memory priceMid = controller.rentPrice("alice", ONE_YEAR);
        assertLt(priceMid.premium, priceEarly.premium, "premium decays over time");

        // Warp past auction end
        vm.warp(oldExpiry + 90 days + 15 days);
        IPriceOracle.Price memory priceLate = controller.rentPrice("alice", ONE_YEAR);
        assertEq(priceLate.premium, 0, "premium is 0 after auction ends");

        // Can register at base price only
        bytes32 secret2 = keccak256("dutch-secret");
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", bob, ONE_YEAR, secret2, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        IPriceOracle.Price memory finalPrice = controller.rentPrice("alice", ONE_YEAR);
        vm.prank(bob);
        controller.register{value: finalPrice.base + finalPrice.premium}(
            "alice", bob, ONE_YEAR, secret2, address(0), data, false
        );
        assertEq(registrar.ownerOf(tokenId), bob);
    }

    function test_fullFlow_renewalCostIsBaseOnly() public {
        _register("alice", alice, ONE_YEAR);

        // Renewal cost = base only, never premium
        IPriceOracle.Price memory renewPrice = controller.rentPrice("alice", ONE_YEAR);
        // For active 5-char name: ~5 KITE/yr, 0 premium
        assertApproxEqAbs(renewPrice.base, 5 ether, 0.01 ether);
        assertEq(renewPrice.premium, 0, "renewal premium must be 0");

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        controller.renew{value: renewPrice.base}("alice", ONE_YEAR);
        assertEq(alice.balance, balanceBefore - renewPrice.base);
    }

    // ============ Reverse Record E2E ============

    function test_fullFlow_registerWithReverseRecord() public {
        string memory name = "alice";
        bytes[] memory data = new bytes[](0);

        // Commit
        bytes32 commitment = controller.makeCommitment(name, alice, ONE_YEAR, SECRET, address(resolver), data, true);
        vm.prank(alice);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        // Register with reverseRecord=true
        IPriceOracle.Price memory price = controller.rentPrice(name, ONE_YEAR);
        vm.prank(alice);
        controller.register{value: price.base + price.premium + 1 ether}(
            name, alice, ONE_YEAR, SECRET, address(resolver), data, true
        );

        // Verify forward registration
        uint256 tokenId = uint256(keccak256(bytes(name)));
        assertEq(registrar.ownerOf(tokenId), alice);

        // Verify reverse: registry.resolver(reverseNode) == defaultResolver
        bytes32 reverseNode = reverseRegistrar.node(alice);
        assertEq(registry.resolver(reverseNode), address(resolver), "reverse node resolver must be set");

        // Verify reverse: resolver.name(reverseNode) == "alice.kite"
        assertEq(resolver.name(reverseNode), "alice.kite", "reverse name must match");
    }

    function test_fullFlow_setNameDirectly() public {
        // Alice registers, then calls setName on reverse registrar
        _register("alice", alice, ONE_YEAR);

        vm.prank(alice);
        bytes32 reverseNode = reverseRegistrar.setName("alice.kite");

        // Verify resolver pointer
        assertEq(registry.resolver(reverseNode), address(resolver), "resolver must be set");

        // Verify name lookup
        assertEq(resolver.name(reverseNode), "alice.kite", "name must match");
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
