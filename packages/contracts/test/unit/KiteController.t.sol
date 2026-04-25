// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {KiteController} from "../../src/registrar/KiteController.sol";
import {DeployHelper} from "../helpers/DeployHelper.sol";
import {TestConstants} from "../helpers/TestConstants.sol";
import {Test} from "forge-std/Test.sol";

contract KiteControllerTest is DeployHelper {
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    bytes32 public constant SECRET = keccak256("test-secret");
    uint256 public constant ONE_YEAR = 365.25 days;

    function setUp() public {
        _deployFullStack(address(this));
        vm.deal(alice, 1000 ether);
        vm.deal(bob, 1000 ether);
    }

    // ============ Helpers ============

    function _commitAndWait(
        string memory name,
        address owner,
        uint256 duration,
        bytes32 secret
    ) internal returns (bytes32) {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment(name, owner, duration, secret, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);
        return commitment;
    }

    function _registerName(
        string memory name,
        address owner,
        uint256 duration
    ) internal {
        _commitAndWait(name, owner, duration, SECRET);
        IPriceOracle.Price memory price = controller.rentPrice(name, duration);
        uint256 totalPrice = price.base + price.premium;
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        controller.register{value: totalPrice}(name, owner, duration, SECRET, address(0), data, false);
    }

    // ============ Commit ============

    function test_commit() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        controller.commit(commitment);
        assertGt(controller.commitments(commitment), 0);
    }

    function test_commit_emitsEvent() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        vm.expectEmit(true, false, false, false);
        emit KiteController.CommitmentSubmitted(commitment);
        controller.commit(commitment);
    }

    // ============ Register ============

    function test_register_5char() public {
        _commitAndWait("alice", alice, ONE_YEAR, SECRET);

        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        uint256 totalPrice = price.base + price.premium;

        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        controller.register{value: totalPrice}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);

        uint256 tokenId = uint256(keccak256("alice"));
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_3char() public {
        _commitAndWait("abc", alice, ONE_YEAR, SECRET);

        IPriceOracle.Price memory price = controller.rentPrice("abc", ONE_YEAR);
        assertGt(price.base, 0);
        uint256 totalPrice = price.base + price.premium;

        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        controller.register{value: totalPrice}("abc", alice, ONE_YEAR, SECRET, address(0), data, false);

        uint256 tokenId = uint256(keccak256("abc"));
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_emitsEvent() public {
        _commitAndWait("alice", alice, ONE_YEAR, SECRET);
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        uint256 totalPrice = price.base + price.premium;

        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        vm.expectEmit(false, true, true, false);
        emit KiteController.NameRegistered("alice", keccak256("alice"), alice, totalPrice, 0, 0);
        controller.register{value: totalPrice}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_refundsExcess() public {
        _commitAndWait("alice", alice, ONE_YEAR, SECRET);
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        uint256 totalPrice = price.base + price.premium;

        uint256 balanceBefore = alice.balance;
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        controller.register{value: totalPrice + 1 ether}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);

        assertEq(alice.balance, balanceBefore - totalPrice);
    }

    // ============ Register — Failures ============

    function test_register_insufficientValue() public {
        _commitAndWait("alice", alice, ONE_YEAR, SECRET);
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 0}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_invalidName() public {
        _commitAndWait("ALICE", alice, ONE_YEAR, SECRET);
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("ALICE", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_tooShort() public {
        _commitAndWait("ab", alice, ONE_YEAR, SECRET);
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("ab", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_commitmentTooNew() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        controller.commit(commitment);
        // Don't wait — try immediately
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_commitmentTooOld() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 25 hours);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_commitmentNotFound() public {
        bytes[] memory data = new bytes[](0);
        vm.warp(block.timestamp + 61);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    function test_register_durationTooShort() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, 7 days, SECRET, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("alice", alice, 7 days, SECRET, address(0), data, false);
    }

    function test_register_nameNotAvailable() public {
        _registerName("alice", alice, ONE_YEAR);

        // Try to register same name
        bytes32 secret2 = keccak256("another-secret");
        _commitAndWait("alice", bob, ONE_YEAR, secret2);
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        bytes[] memory data = new bytes[](0);
        vm.prank(bob);
        vm.expectRevert();
        controller.register{value: price.base + price.premium}("alice", bob, ONE_YEAR, secret2, address(0), data, false);
    }

    function test_register_reservedName() public {
        controller.setReservedName("admin", true);
        _commitAndWait("admin", alice, ONE_YEAR, SECRET);
        bytes[] memory data = new bytes[](0);
        vm.prank(alice);
        vm.expectRevert();
        controller.register{value: 100 ether}("admin", alice, ONE_YEAR, SECRET, address(0), data, false);
    }

    // ============ Renew ============

    function test_renew() public {
        _registerName("alice", alice, ONE_YEAR);

        uint256 tokenId = uint256(keccak256("alice"));
        uint256 oldExpiry = registrar.nameExpires(tokenId);

        // Use generous amount since premium may apply
        vm.prank(alice);
        controller.renew{value: 200 ether}("alice", ONE_YEAR);

        assertGt(registrar.nameExpires(tokenId), oldExpiry);
    }

    function test_renew_emitsEvent() public {
        _registerName("alice", alice, ONE_YEAR);

        vm.prank(alice);
        vm.expectEmit(false, true, false, false);
        emit KiteController.NameRenewed("alice", keccak256("alice"), 0, 0);
        controller.renew{value: 200 ether}("alice", ONE_YEAR);
    }

    function test_renew_insufficientValue() public {
        _registerName("alice", alice, ONE_YEAR);
        vm.prank(alice);
        vm.expectRevert();
        controller.renew{value: 0}("alice", ONE_YEAR);
    }

    // ============ Available ============

    function test_available_true() public view {
        assertTrue(controller.available("alice"));
    }

    function test_available_false_registered() public {
        _registerName("alice", alice, ONE_YEAR);
        assertFalse(controller.available("alice"));
    }

    function test_available_false_invalid() public view {
        assertFalse(controller.available("ALICE"));
        assertFalse(controller.available("ab"));
        assertFalse(controller.available(""));
    }

    function test_available_false_reserved() public {
        controller.setReservedName("admin", true);
        assertFalse(controller.available("admin"));
    }

    // ============ Admin ============

    function test_withdraw() public {
        _registerName("alice", alice, ONE_YEAR);

        uint256 balance = address(controller).balance;
        assertGt(balance, 0);

        // Deploy to an EOA that can receive ETH
        address payable recipient = payable(makeAddr("recipient"));
        // Transfer ownership to recipient so withdraw goes there
        controller.transferOwnership(recipient);

        vm.prank(recipient);
        controller.withdraw();
        assertEq(recipient.balance, balance);
    }

    function test_withdraw_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        controller.withdraw();
    }

    function test_setReservedName() public {
        controller.setReservedName("admin", true);
        assertTrue(controller.isReserved("admin"));
    }

    function test_setReservedName_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        controller.setReservedName("admin", true);
    }

    // ============ Pricing ============

    function test_rentPrice_5char() public view {
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        // 5 KITE per year
        assertApproxEqAbs(price.base, 5 ether, 0.01 ether);
    }

    function test_rentPrice_3char() public view {
        IPriceOracle.Price memory price = controller.rentPrice("abc", ONE_YEAR);
        // 640 KITE per year
        assertApproxEqAbs(price.base, 640 ether, 0.01 ether);
    }

    function test_rentPrice_4char() public view {
        IPriceOracle.Price memory price = controller.rentPrice("test", ONE_YEAR);
        // 160 KITE per year
        assertApproxEqAbs(price.base, 160 ether, 0.01 ether);
    }

    // ============ Gas Benchmarks ============

    function test_commit_gasUsage() public {
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        uint256 gasBefore = gasleft();
        controller.commit(commitment);
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 50_000);
    }

    function test_register_5char_gasUsage() public {
        _commitAndWait("alice", alice, ONE_YEAR, SECRET);
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        uint256 totalPrice = price.base + price.premium;
        bytes[] memory data = new bytes[](0);

        vm.prank(alice);
        uint256 gasBefore = gasleft();
        controller.register{value: totalPrice}("alice", alice, ONE_YEAR, SECRET, address(0), data, false);
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 250_000);
    }

    function test_renew_gasUsage() public {
        _registerName("alice", alice, ONE_YEAR);

        vm.prank(alice);
        uint256 gasBefore = gasleft();
        controller.renew{value: 200 ether}("alice", ONE_YEAR);
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 100_000);
    }

    // ============ Regression: Finding 1 — Renewal must NOT charge premium ============

    function test_renew_noPremium_activeNames() public {
        _registerName("alice", alice, ONE_YEAR);

        // Get renewal price — should be base only, no premium
        IPriceOracle.Price memory renewPrice = controller.rentPrice("alice", ONE_YEAR);

        // For active name, renewal premium must be 0
        // (Before fix: oracle returned startPremium=100 KITE because
        //  future expires caused _premium() to return max)
        assertEq(renewPrice.premium, 0, "renewal must not charge premium");

        // Exact renewal cost = base only (~5 KITE for 5-char)
        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        controller.renew{value: renewPrice.base}("alice", ONE_YEAR);
        assertEq(alice.balance, balanceBefore - renewPrice.base, "only base charged");
    }

    function test_renew_noPremium_inGracePeriod() public {
        _registerName("alice", alice, ONE_YEAR);

        // Warp into grace period (expired but within 90 days)
        vm.warp(block.timestamp + ONE_YEAR + 45 days);

        // Renewal during grace: still no premium
        IPriceOracle.Price memory renewPrice = controller.rentPrice("alice", ONE_YEAR);
        assertEq(renewPrice.premium, 0, "grace period renewal must not charge premium");

        vm.prank(alice);
        controller.renew{value: renewPrice.base}("alice", ONE_YEAR);
    }

    // ============ Regression: Finding 2 — Re-registration must apply auction premium ============

    function test_reregistration_chargesPremium_inAuctionWindow() public {
        _registerName("alice", alice, ONE_YEAR);

        // Warp past expiry + grace + 1 second (auction just started)
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);
        assertTrue(controller.available("alice"), "name should be available");

        // Quote should include premium (Dutch auction just started)
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        assertGt(price.premium, 0, "re-registration must charge premium in auction window");
        // Premium should be close to startPremium (100 KITE) since only 1s elapsed
        assertGt(price.premium, 99 ether, "premium near startPremium at auction start");

        // Actually register — must pay premium
        bytes32 secret2 = keccak256("re-reg-secret");
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", bob, ONE_YEAR, secret2, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        // Re-query price after warp (premium decays slightly)
        IPriceOracle.Price memory price2 = controller.rentPrice("alice", ONE_YEAR);
        uint256 totalPrice = price2.base + price2.premium;

        vm.prank(bob);
        controller.register{value: totalPrice}("alice", bob, ONE_YEAR, secret2, address(0), data, false);
        assertEq(registrar.ownerOf(uint256(keccak256("alice"))), bob);
    }

    function test_reregistration_noPremium_afterAuctionEnds() public {
        _registerName("alice", alice, ONE_YEAR);

        // Warp past expiry + grace + full auction (14 days)
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 14 days + 1);
        assertTrue(controller.available("alice"), "name should be available");

        // Auction over: premium = 0
        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        assertEq(price.premium, 0, "no premium after auction ends");

        // Register at base price only
        bytes32 secret2 = keccak256("late-reg-secret");
        _commitAndWait("alice", bob, ONE_YEAR, secret2);
        bytes[] memory data = new bytes[](0);
        vm.prank(bob);
        controller.register{value: price.base}("alice", bob, ONE_YEAR, secret2, address(0), data, false);
        assertEq(registrar.ownerOf(uint256(keccak256("alice"))), bob);
    }

    function test_newRegistration_noPremium() public {
        // Brand new name (never registered) must have zero premium
        IPriceOracle.Price memory price = controller.rentPrice("brand", ONE_YEAR);
        assertEq(price.premium, 0, "new name must not have premium");
    }

    // ============ Regression: Finding 4 — Event emits correct baseCost + premium ============

    function test_register_event_correctPriceFields() public {
        _registerName("alice", alice, ONE_YEAR);

        // Expire and enter auction
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        bytes32 secret2 = keccak256("event-test-secret");
        bytes[] memory data = new bytes[](0);
        bytes32 commitment = controller.makeCommitment("alice", bob, ONE_YEAR, secret2, address(0), data, false);
        controller.commit(commitment);
        vm.warp(block.timestamp + 61);

        IPriceOracle.Price memory price = controller.rentPrice("alice", ONE_YEAR);
        assertGt(price.premium, 0, "should have premium");

        uint256 expectedExpires = block.timestamp + ONE_YEAR;

        // Expect event with SEPARATE baseCost and premium (not totalPrice, 0)
        vm.expectEmit(false, true, true, true);
        emit KiteController.NameRegistered("alice", keccak256("alice"), bob, price.base, price.premium, expectedExpires);
        vm.prank(bob);
        controller.register{value: price.base + price.premium}("alice", bob, ONE_YEAR, secret2, address(0), data, false);
    }
}
