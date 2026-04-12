// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../../src/interfaces/IKiteRegistry.sol";
import {KiteRegistry} from "../../src/registry/KiteRegistry.sol";
import {KiteResolver} from "../../src/resolvers/KiteResolver.sol";
import {KiteReverseRegistrar} from "../../src/reverseRegistrar/KiteReverseRegistrar.sol";
import {Test} from "forge-std/Test.sol";

contract KiteReverseRegistrarTest is Test {
    KiteRegistry public registry;
    KiteResolver public resolver;
    KiteReverseRegistrar public reverseRegistrar;

    address public deployer = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    bytes32 public constant ROOT_NODE = bytes32(0);

    function setUp() public {
        registry = new KiteRegistry();
        resolver = new KiteResolver(IKiteRegistry(address(registry)));

        // Setup reverse node: root -> "reverse" -> "addr"
        bytes32 reverseNode = registry.setSubnodeOwner(ROOT_NODE, keccak256("reverse"), deployer);
        bytes32 addrReverseNode = registry.setSubnodeOwner(reverseNode, keccak256("addr"), deployer);

        reverseRegistrar = new KiteReverseRegistrar(IKiteRegistry(address(registry)), address(resolver));

        // Give reverse registrar control of addr.reverse
        registry.setOwner(addrReverseNode, address(reverseRegistrar));
    }

    // ============ claim ============

    function test_claim() public {
        vm.prank(alice);
        bytes32 node = reverseRegistrar.claim(alice);
        assertNotEq(node, bytes32(0));
        assertEq(registry.owner(node), alice);
    }

    function test_claim_differentOwner() public {
        vm.prank(alice);
        bytes32 node = reverseRegistrar.claim(bob);
        assertEq(registry.owner(node), bob);
    }

    // ============ node ============

    function test_node_deterministic() public view {
        bytes32 node1 = reverseRegistrar.node(address(0x1234));
        bytes32 node2 = reverseRegistrar.node(address(0x1234));
        assertEq(node1, node2);
    }

    function test_node_different_addresses() public view {
        bytes32 node1 = reverseRegistrar.node(address(0x1234));
        bytes32 node2 = reverseRegistrar.node(address(0x5678));
        assertNotEq(node1, node2);
    }

    // ============ setDefaultResolver ============

    function test_setDefaultResolver() public {
        address newResolver = makeAddr("newResolver");
        reverseRegistrar.setDefaultResolver(newResolver);
        assertEq(reverseRegistrar.defaultResolver(), newResolver);
    }

    function test_setDefaultResolver_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        reverseRegistrar.setDefaultResolver(alice);
    }

    // ============ Fuzz ============

    function testFuzz_node_neverReverts(
        address addr
    ) public view {
        reverseRegistrar.node(addr);
    }
}
