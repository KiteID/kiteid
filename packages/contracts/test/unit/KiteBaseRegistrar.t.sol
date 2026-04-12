// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteBaseRegistrar} from "../../src/interfaces/IKiteBaseRegistrar.sol";
import {KiteBaseRegistrar} from "../../src/registrar/KiteBaseRegistrar.sol";
import {KiteRegistry} from "../../src/registry/KiteRegistry.sol";
import {TestConstants} from "../helpers/TestConstants.sol";
import {Test} from "forge-std/Test.sol";

contract KiteBaseRegistrarTest is Test {
    KiteRegistry public registry;
    KiteBaseRegistrar public registrar;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public controller = makeAddr("controller");

    bytes32 public constant ROOT_NODE = bytes32(0);
    bytes32 public constant KITE_LABEL = keccak256("kite");
    bytes32 public kiteNode;

    uint256 public constant ALICE_ID = uint256(keccak256("alice"));
    uint256 public constant BOB_ID = uint256(keccak256("bob"));
    uint256 public constant ONE_YEAR = 365.25 days;

    function setUp() public {
        registry = new KiteRegistry();
        kiteNode = keccak256(abi.encodePacked(ROOT_NODE, KITE_LABEL));

        registrar = new KiteBaseRegistrar(registry, kiteNode);

        // Give registrar control of the .kite node
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, address(registrar));

        // Add controller
        registrar.addController(controller);
    }

    // ============ Deployment ============

    function test_name() public view {
        assertEq(registrar.name(), "KiteID");
    }

    function test_symbol() public view {
        assertEq(registrar.symbol(), "KITE");
    }

    function test_gracePeriod() public view {
        assertEq(registrar.GRACE_PERIOD(), 90 days);
    }

    function test_baseNode() public view {
        assertEq(registrar.baseNode(), kiteNode);
    }

    // ============ Controller Management ============

    function test_addController() public {
        address newController = makeAddr("newController");
        registrar.addController(newController);
        assertTrue(registrar.controllers(newController));
    }

    function test_addController_emitsEvent() public {
        address newController = makeAddr("newController");
        vm.expectEmit(true, false, false, false);
        emit IKiteBaseRegistrar.ControllerAdded(newController);
        registrar.addController(newController);
    }

    function test_removeController() public {
        registrar.removeController(controller);
        assertFalse(registrar.controllers(controller));
    }

    function test_addController_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        registrar.addController(alice);
    }

    // ============ Registration ============

    function test_register_basic() public {
        vm.prank(controller);
        uint256 expires = registrar.register(ALICE_ID, alice, ONE_YEAR);

        assertEq(registrar.ownerOf(ALICE_ID), alice);
        assertEq(expires, block.timestamp + ONE_YEAR);
        assertEq(registrar.nameExpires(ALICE_ID), expires);
    }

    function test_register_setsRegistryOwner() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Registry node owner = controller (caller), not the token owner
        // The controller is responsible for transferring registry ownership
        bytes32 aliceNode = keccak256(abi.encodePacked(kiteNode, bytes32(ALICE_ID)));
        assertEq(registry.owner(aliceNode), controller);
    }

    function test_register_emitsEvent() public {
        vm.prank(controller);
        vm.expectEmit(true, true, false, true);
        emit IKiteBaseRegistrar.NameRegistered(ALICE_ID, alice, block.timestamp + ONE_YEAR);
        registrar.register(ALICE_ID, alice, ONE_YEAR);
    }

    function test_register_notController() public {
        vm.prank(alice);
        vm.expectRevert(KiteBaseRegistrar.CallerNotController.selector);
        registrar.register(ALICE_ID, alice, ONE_YEAR);
    }

    function test_register_zeroAddress() public {
        vm.prank(controller);
        vm.expectRevert(KiteBaseRegistrar.InvalidOwner.selector);
        registrar.register(ALICE_ID, address(0), ONE_YEAR);
    }

    function test_register_durationTooShort() public {
        vm.prank(controller);
        vm.expectRevert(KiteBaseRegistrar.DurationTooShort.selector);
        registrar.register(ALICE_ID, alice, 27 days);
    }

    function test_register_notAvailable() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(KiteBaseRegistrar.NameNotAvailable.selector, ALICE_ID));
        registrar.register(ALICE_ID, bob, ONE_YEAR);
    }

    // ============ Expiry & Availability ============

    function test_available_unregistered() public view {
        assertTrue(registrar.available(ALICE_ID));
    }

    function test_available_registered() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);
        assertFalse(registrar.available(ALICE_ID));
    }

    function test_available_expired() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Warp past expiry + grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);
        assertTrue(registrar.available(ALICE_ID));
    }

    function test_available_inGracePeriod() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Warp past expiry but within grace period
        vm.warp(block.timestamp + ONE_YEAR + 45 days);
        assertFalse(registrar.available(ALICE_ID));
    }

    // ============ Renewal ============

    function test_renew_basic() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);
        uint256 originalExpiry = registrar.nameExpires(ALICE_ID);

        vm.prank(controller);
        uint256 newExpiry = registrar.renew(ALICE_ID, ONE_YEAR);

        assertEq(newExpiry, originalExpiry + ONE_YEAR);
    }

    function test_renew_emitsEvent() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);
        uint256 expectedExpiry = registrar.nameExpires(ALICE_ID) + ONE_YEAR;

        vm.prank(controller);
        vm.expectEmit(true, false, false, true);
        emit IKiteBaseRegistrar.NameRenewed(ALICE_ID, expectedExpiry);
        registrar.renew(ALICE_ID, ONE_YEAR);
    }

    function test_renew_inGracePeriod() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Warp to within grace period
        vm.warp(block.timestamp + ONE_YEAR + 30 days);

        vm.prank(controller);
        uint256 newExpiry = registrar.renew(ALICE_ID, ONE_YEAR);
        assertEq(newExpiry, block.timestamp + ONE_YEAR);
    }

    function test_renew_expired() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Warp past grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(KiteBaseRegistrar.NameExpired.selector, ALICE_ID));
        registrar.renew(ALICE_ID, ONE_YEAR);
    }

    function test_renew_durationTooShort() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        vm.prank(controller);
        vm.expectRevert(KiteBaseRegistrar.DurationTooShort.selector);
        registrar.renew(ALICE_ID, 27 days);
    }

    // ============ Reclaim ============

    function test_reclaim() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        vm.prank(alice);
        registrar.reclaim(ALICE_ID, bob);

        bytes32 aliceSubnode = keccak256(abi.encodePacked(kiteNode, bytes32(ALICE_ID)));
        assertEq(registry.owner(aliceSubnode), bob);
    }

    function test_reclaim_notOwner() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        vm.prank(bob);
        vm.expectRevert("KiteBaseRegistrar: not token owner");
        registrar.reclaim(ALICE_ID, bob);
    }

    // ============ Transfer Block ============

    function test_transfer_blockedAfterGracePeriod() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        // Warp past grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(KiteBaseRegistrar.NameExpired.selector, ALICE_ID));
        registrar.transferFrom(alice, bob, ALICE_ID);
    }

    function test_transfer_allowedBeforeExpiry() public {
        vm.prank(controller);
        registrar.register(ALICE_ID, alice, ONE_YEAR);

        vm.prank(alice);
        registrar.transferFrom(alice, bob, ALICE_ID);
        assertEq(registrar.ownerOf(ALICE_ID), bob);
    }

    // ============ Fuzz ============

    function testFuzz_register_duration(
        uint256 duration
    ) public {
        duration = bound(duration, 28 days, 3652.5 days);

        vm.prank(controller);
        uint256 expires = registrar.register(ALICE_ID, alice, duration);
        assertEq(expires, block.timestamp + duration);
        assertEq(registrar.ownerOf(ALICE_ID), alice);
    }

    // ============ Gas Benchmark ============

    function test_register_gasUsage() public {
        vm.prank(controller);
        uint256 gasBefore = gasleft();
        registrar.register(ALICE_ID, alice, ONE_YEAR);
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 120_000);
    }
}
