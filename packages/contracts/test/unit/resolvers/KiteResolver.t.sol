// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IAddrResolver} from "../../../src/interfaces/IAddrResolver.sol";
import {IAddressResolver} from "../../../src/interfaces/IAddressResolver.sol";
import {IContentHashResolver} from "../../../src/interfaces/IContentHashResolver.sol";
import {IInterfaceResolver} from "../../../src/interfaces/IInterfaceResolver.sol";
import {IMulticallable} from "../../../src/interfaces/IMulticallable.sol";
import {INameResolver} from "../../../src/interfaces/INameResolver.sol";
import {ITextResolver} from "../../../src/interfaces/ITextResolver.sol";
import {KiteRegistry} from "../../../src/registry/KiteRegistry.sol";
import {KiteResolver} from "../../../src/resolvers/KiteResolver.sol";
import {Test} from "forge-std/Test.sol";

contract KiteResolverTest is Test {
    KiteRegistry public registry;
    KiteResolver public resolver;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    bytes32 public constant ROOT_NODE = bytes32(0);
    bytes32 public aliceNode;

    function setUp() public {
        registry = new KiteRegistry();
        resolver = new KiteResolver(registry);

        // Create a node for alice
        bytes32 kiteLabel = keccak256("kite");
        bytes32 kiteNode = registry.setSubnodeOwner(ROOT_NODE, kiteLabel, owner);
        bytes32 aliceLabel = keccak256("alice");
        aliceNode = registry.setSubnodeOwner(kiteNode, aliceLabel, alice);
    }

    // ============ AddrResolver ============

    function test_setAddr_eth() public {
        vm.prank(alice);
        resolver.setAddr(aliceNode, alice);
        assertEq(resolver.addr(aliceNode), alice);
    }

    function test_setAddr_multicoin() public {
        bytes memory btcAddr = hex"76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";
        vm.prank(alice);
        resolver.setAddr(aliceNode, 0, btcAddr); // coinType 0 = BTC
        assertEq(resolver.addr(aliceNode, 0), btcAddr);
    }

    function test_setAddr_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.setAddr(aliceNode, bob);
    }

    function test_setAddr_emitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit IAddrResolver.AddrChanged(aliceNode, alice);
        resolver.setAddr(aliceNode, alice);
    }

    function test_addr_returnsZero_whenNotSet() public view {
        assertEq(resolver.addr(aliceNode), address(0));
    }

    // ============ TextResolver ============

    function test_setText() public {
        vm.prank(alice);
        resolver.setText(aliceNode, "url", "https://alice.xyz");
        assertEq(resolver.text(aliceNode, "url"), "https://alice.xyz");
    }

    function test_setText_multiple() public {
        vm.prank(alice);
        resolver.setText(aliceNode, "url", "https://alice.xyz");
        vm.prank(alice);
        resolver.setText(aliceNode, "avatar", "ipfs://Qm...");
        assertEq(resolver.text(aliceNode, "url"), "https://alice.xyz");
        assertEq(resolver.text(aliceNode, "avatar"), "ipfs://Qm...");
    }

    function test_setText_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.setText(aliceNode, "url", "https://evil.com");
    }

    function test_text_empty_whenNotSet() public view {
        assertEq(resolver.text(aliceNode, "url"), "");
    }

    // ============ ContentHashResolver ============

    function test_setContenthash() public {
        bytes memory hash = hex"e3010170122029f2d17be6139079dc48696d1f582a8530eb9805b561eda517e22a892c7e3f1f";
        vm.prank(alice);
        resolver.setContenthash(aliceNode, hash);
        assertEq(resolver.contenthash(aliceNode), hash);
    }

    function test_setContenthash_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.setContenthash(aliceNode, hex"01");
    }

    function test_contenthash_empty_whenNotSet() public view {
        assertEq(resolver.contenthash(aliceNode), bytes(""));
    }

    // ============ NameResolver ============

    function test_setName() public {
        vm.prank(alice);
        resolver.setName(aliceNode, "alice.kite");
        assertEq(resolver.name(aliceNode), "alice.kite");
    }

    function test_setName_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.setName(aliceNode, "evil.kite");
    }

    // ============ InterfaceResolver ============

    function test_setInterface() public {
        address impl = makeAddr("impl");
        vm.prank(alice);
        resolver.setInterface(aliceNode, bytes4(0x12345678), impl);
        assertEq(resolver.interfaceImplementer(aliceNode, bytes4(0x12345678)), impl);
    }

    function test_setInterface_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.setInterface(aliceNode, bytes4(0x12345678), bob);
    }

    // ============ ClearRecords ============

    function test_clearRecords() public {
        vm.prank(alice);
        resolver.setAddr(aliceNode, alice);
        vm.prank(alice);
        resolver.setText(aliceNode, "url", "https://alice.xyz");

        vm.prank(alice);
        resolver.clearRecords(aliceNode);

        // All records should be cleared
        assertEq(resolver.addr(aliceNode), address(0));
        assertEq(resolver.text(aliceNode, "url"), "");
    }

    function test_clearRecords_incrementsVersion() public {
        uint64 v0 = resolver.recordVersions(aliceNode);

        vm.prank(alice);
        resolver.clearRecords(aliceNode);

        assertEq(resolver.recordVersions(aliceNode), v0 + 1);
    }

    function test_clearRecords_unauthorized() public {
        vm.prank(bob);
        vm.expectRevert();
        resolver.clearRecords(aliceNode);
    }

    // ============ Multicall ============

    function test_multicall() public {
        bytes[] memory data = new bytes[](2);
        data[0] = abi.encodeWithSignature("setAddr(bytes32,address)", aliceNode, alice);
        data[1] = abi.encodeCall(resolver.setText, (aliceNode, "url", "https://alice.xyz"));

        vm.prank(alice);
        resolver.multicall(data);

        assertEq(resolver.addr(aliceNode), alice);
        assertEq(resolver.text(aliceNode, "url"), "https://alice.xyz");
    }

    // ============ ERC-165 ============

    function test_supportsInterface_ERC165() public view {
        assertTrue(resolver.supportsInterface(0x01ffc9a7));
    }

    function test_supportsInterface_IAddrResolver() public view {
        assertTrue(resolver.supportsInterface(type(IAddrResolver).interfaceId));
    }

    function test_supportsInterface_ITextResolver() public view {
        assertTrue(resolver.supportsInterface(type(ITextResolver).interfaceId));
    }

    function test_supportsInterface_IContentHashResolver() public view {
        assertTrue(resolver.supportsInterface(type(IContentHashResolver).interfaceId));
    }

    function test_supportsInterface_INameResolver() public view {
        assertTrue(resolver.supportsInterface(type(INameResolver).interfaceId));
    }

    function test_supportsInterface_IMulticallable() public view {
        assertTrue(resolver.supportsInterface(type(IMulticallable).interfaceId));
    }

    function test_supportsInterface_false() public view {
        assertFalse(resolver.supportsInterface(0xdeadbeef));
    }
}
