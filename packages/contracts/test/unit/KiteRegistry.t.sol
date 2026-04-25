// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../../src/interfaces/IKiteRegistry.sol";
import {KiteRegistry} from "../../src/registry/KiteRegistry.sol";
import {Test} from "forge-std/Test.sol";

contract KiteRegistryTest is Test {
    KiteRegistry public registry;

    address public deployer = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public operator = makeAddr("operator");
    address public resolver1 = makeAddr("resolver1");

    bytes32 public constant ROOT_NODE = bytes32(0);
    bytes32 public constant KITE_LABEL = keccak256("kite");
    bytes32 public kiteNode;

    function setUp() public {
        registry = new KiteRegistry();
        kiteNode = keccak256(abi.encodePacked(ROOT_NODE, KITE_LABEL));
    }

    // ============ Deployment ============

    function test_deployer_owns_root() public view {
        assertEq(registry.owner(ROOT_NODE), deployer);
    }

    function test_root_recordExists() public view {
        assertTrue(registry.recordExists(ROOT_NODE));
    }

    function test_nonexistent_record() public view {
        assertFalse(registry.recordExists(kiteNode));
    }

    // ============ setSubnodeOwner ============

    function test_setSubnodeOwner() public {
        bytes32 subnode = registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);
        assertEq(subnode, kiteNode);
        assertEq(registry.owner(kiteNode), alice);
    }

    function test_setSubnodeOwner_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit IKiteRegistry.NewOwner(ROOT_NODE, KITE_LABEL, alice);
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);
    }

    function test_setSubnodeOwner_unauthorized() public {
        vm.prank(alice);
        vm.expectRevert("KiteRegistry: not authorised");
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);
    }

    // ============ setSubnodeRecord ============

    function test_setSubnodeRecord() public {
        registry.setSubnodeRecord(ROOT_NODE, KITE_LABEL, alice, resolver1, 300);
        assertEq(registry.owner(kiteNode), alice);
        assertEq(registry.resolver(kiteNode), resolver1);
        assertEq(registry.ttl(kiteNode), 300);
    }

    // ============ setOwner ============

    function test_setOwner() public {
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);

        vm.prank(alice);
        registry.setOwner(kiteNode, bob);
        assertEq(registry.owner(kiteNode), bob);
    }

    function test_setOwner_emitsTransfer() public {
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit IKiteRegistry.Transfer(kiteNode, bob);
        registry.setOwner(kiteNode, bob);
    }

    function test_setOwner_unauthorized() public {
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);

        vm.prank(bob);
        vm.expectRevert("KiteRegistry: not authorised");
        registry.setOwner(kiteNode, bob);
    }

    // ============ setResolver ============

    function test_setResolver() public {
        registry.setResolver(ROOT_NODE, resolver1);
        assertEq(registry.resolver(ROOT_NODE), resolver1);
    }

    function test_setResolver_emitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit IKiteRegistry.NewResolver(ROOT_NODE, resolver1);
        registry.setResolver(ROOT_NODE, resolver1);
    }

    // ============ setTTL ============

    function test_setTTL() public {
        registry.setTTL(ROOT_NODE, 600);
        assertEq(registry.ttl(ROOT_NODE), 600);
    }

    function test_setTTL_emitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit IKiteRegistry.NewTTL(ROOT_NODE, 600);
        registry.setTTL(ROOT_NODE, 600);
    }

    // ============ setRecord ============

    function test_setRecord() public {
        registry.setRecord(ROOT_NODE, alice, resolver1, 300);
        assertEq(registry.owner(ROOT_NODE), alice);
        assertEq(registry.resolver(ROOT_NODE), resolver1);
        assertEq(registry.ttl(ROOT_NODE), 300);
    }

    // ============ Approval ============

    function test_setApprovalForAll() public {
        vm.prank(alice);
        registry.setApprovalForAll(operator, true);
        assertTrue(registry.isApprovedForAll(alice, operator));
    }

    function test_approval_allows_operations() public {
        registry.setSubnodeOwner(ROOT_NODE, KITE_LABEL, alice);

        vm.prank(alice);
        registry.setApprovalForAll(operator, true);

        vm.prank(operator);
        registry.setOwner(kiteNode, bob);
        assertEq(registry.owner(kiteNode), bob);
    }

    function test_revoke_approval() public {
        vm.prank(alice);
        registry.setApprovalForAll(operator, true);

        vm.prank(alice);
        registry.setApprovalForAll(operator, false);

        assertFalse(registry.isApprovedForAll(alice, operator));
    }

    function test_approval_emitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit IKiteRegistry.ApprovalForAll(alice, operator, true);
        registry.setApprovalForAll(operator, true);
    }

    // ============ Fuzz ============

    function testFuzz_setSubnodeOwner(
        bytes32 label,
        address owner_
    ) public {
        vm.assume(owner_ != address(0));
        bytes32 subnode = registry.setSubnodeOwner(ROOT_NODE, label, owner_);
        assertEq(registry.owner(subnode), owner_);
        assertTrue(registry.recordExists(subnode));
    }

    function testFuzz_ttl(
        uint64 ttlValue
    ) public {
        registry.setTTL(ROOT_NODE, ttlValue);
        assertEq(registry.ttl(ROOT_NODE), ttlValue);
    }
}
