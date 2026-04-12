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
}
