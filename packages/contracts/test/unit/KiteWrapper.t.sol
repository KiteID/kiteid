// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Test} from "forge-std/Test.sol";

import {IKiteWrapper} from "../../src/interfaces/IKiteWrapper.sol";
import {KiteWrapper} from "../../src/wrapper/KiteWrapper.sol";
import {KiteWrapperTypes} from "../../src/wrapper/KiteWrapperTypes.sol";

contract MockERC721 {
    mapping(uint256 => address) public owners;

    function ownerOf(
        uint256 tokenId
    ) public view returns (address) {
        return owners[tokenId];
    }

    function mint(
        address to,
        uint256 tokenId
    ) public {
        owners[tokenId] = to;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        require(owners[tokenId] == from, "Not owner");
        owners[tokenId] = to;
    }
}

contract KiteWrapperTest is Test {
    KiteWrapper public wrapper;
    MockERC721 public mockRegistrar;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public controller = address(0x4);

    bytes32 public testNode = keccak256(abi.encodePacked("test"));
    bytes32 public agentNode = keccak256(abi.encodePacked("agent"));

    uint96 constant CANNOT_UNWRAP = 1;
    uint96 constant CANNOT_TRANSFER = 1 << 2;
    uint96 constant CANNOT_UNBIND_PASSPORT = 1 << 18;
    uint96 constant CANNOT_REVOKE_AGENTS = 1 << 19;

    function setUp() public {
        mockRegistrar = new MockERC721();
        mockRegistrar.mint(user1, uint256(testNode));

        // Deploy wrapper via proxy
        KiteWrapper impl = new KiteWrapper();
        bytes memory initData = abi.encodeCall(KiteWrapper.initialize, (IERC721(address(mockRegistrar)), owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        wrapper = KiteWrapper(address(proxy));

        vm.prank(owner);
        wrapper.addController(controller);
    }

    // ============ Wrapping Tests ============

    function test_wrap_SuccessfulWrap() public {
        vm.prank(controller);
        wrapper.wrap(testNode, uint256(testNode), user1, 0, uint64(block.timestamp + 365 days));

        assertEq(wrapper.getExpiry(testNode), uint64(block.timestamp + 365 days));
        assertEq(wrapper.getFuses(testNode), 0);
        assertEq(wrapper.balanceOf(user1, uint256(testNode)), 1);
    }

    function test_wrap_AlreadyWrapped() public {
        vm.prank(controller);
        wrapper.wrap(testNode, uint256(testNode), user1, 0, uint64(block.timestamp + 365 days));

        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.NameAlreadyWrapped.selector, testNode));
        wrapper.wrap(testNode, uint256(testNode), user1, 0, uint64(block.timestamp + 365 days));
    }

    function test_wrap_WithFuses() public {
        uint96 fuses = CANNOT_UNWRAP | CANNOT_TRANSFER;

        vm.prank(controller);
        wrapper.wrap(testNode, uint256(testNode), user1, fuses, uint64(block.timestamp + 365 days));

        assertEq(wrapper.getFuses(testNode), fuses);
    }

    // ============ Unwrap Tests ============

    function test_unwrap_SuccessfulUnwrap() public {
        _setupWrappedName(user1, 0);

        vm.prank(controller);
        wrapper.unwrap(testNode, uint256(testNode), user1);

        assertEq(wrapper.getExpiry(testNode), 0);
        assertEq(wrapper.balanceOf(user1, uint256(testNode)), 0);
    }

    function test_unwrap_NotWrapped() public {
        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.NameNotWrapped.selector, testNode));
        wrapper.unwrap(testNode, uint256(testNode), user1);
    }

    function test_unwrap_CannotUnwrapFuseBurned() public {
        _setupWrappedName(user1, CANNOT_UNWRAP);

        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.FuseBurned.selector, CANNOT_UNWRAP));
        wrapper.unwrap(testNode, uint256(testNode), user1);
    }

    // ============ Fuse Tests ============

    function test_setFuses_BurnFuse() public {
        _setupWrappedName(user1, 0);

        vm.prank(user1);
        wrapper.setFuses(testNode, CANNOT_UNWRAP);

        assertEq(wrapper.getFuses(testNode), CANNOT_UNWRAP);
    }

    function test_setFuses_NotOwner() public {
        _setupWrappedName(user1, 0);

        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.CallerNotOwner.selector, testNode));
        wrapper.setFuses(testNode, CANNOT_UNWRAP);
    }

    function test_setFuses_AlreadyBurned() public {
        _setupWrappedName(user1, CANNOT_UNWRAP);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.FuseBurned.selector, CANNOT_UNWRAP));
        wrapper.setFuses(testNode, CANNOT_UNWRAP);
    }

    // ============ Passport Tests ============

    function test_bindPassport_Success() public {
        _setupWrappedName(user1, 0);

        bytes32 commitment = keccak256(abi.encodePacked(user1));

        vm.prank(user1);
        wrapper.bindPassport(testNode, commitment);

        assertEq(wrapper.getPassportCommitment(testNode), commitment);
    }

    function test_bindPassport_AlreadyBound() public {
        _setupWrappedName(user1, 0);

        bytes32 commitment = keccak256(abi.encodePacked(user1));
        vm.prank(user1);
        wrapper.bindPassport(testNode, commitment);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.PassportAlreadyBound.selector, testNode));
        wrapper.bindPassport(testNode, commitment);
    }

    function test_unbindPassport_Success() public {
        _setupWrappedName(user1, 0);

        bytes32 commitment = keccak256(abi.encodePacked(user1));
        vm.prank(user1);
        wrapper.bindPassport(testNode, commitment);

        vm.prank(user1);
        wrapper.unbindPassport(testNode);

        assertEq(wrapper.getPassportCommitment(testNode), bytes32(0));
    }

    function test_unbindPassport_CannotUnbindFuseBurned() public {
        _setupWrappedName(user1, CANNOT_UNBIND_PASSPORT);

        bytes32 commitment = keccak256(abi.encodePacked(user1));
        vm.prank(user1);
        wrapper.bindPassport(testNode, commitment);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.FuseBurned.selector, CANNOT_UNBIND_PASSPORT));
        wrapper.unbindPassport(testNode);
    }

    // ============ Agent Tests ============

    function test_authorizeAgent_Success() public {
        _setupWrappedName(user1, 0);

        vm.prank(user1);
        wrapper.authorizeAgent(testNode, agentNode, user2, 1 ether, uint64(block.timestamp + 30 days));

        IKiteWrapper.AgentAuth memory auth = wrapper.getAgent(testNode, agentNode);
        assertEq(auth.agentAddress, user2);
        assertEq(auth.spendCapPerTx, 1 ether);
        assertTrue(auth.active);
    }

    function test_authorizeAgent_CannotRevokeAgentsFuseBurned() public {
        _setupWrappedName(user1, CANNOT_REVOKE_AGENTS);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.FuseBurned.selector, CANNOT_REVOKE_AGENTS));
        wrapper.authorizeAgent(testNode, agentNode, user2, 1 ether, uint64(block.timestamp + 30 days));
    }

    function test_revokeAgent_Success() public {
        _setupWrappedName(user1, 0);

        vm.prank(user1);
        wrapper.authorizeAgent(testNode, agentNode, user2, 1 ether, uint64(block.timestamp + 30 days));

        vm.prank(user1);
        wrapper.revokeAgent(testNode, agentNode);

        assertFalse(wrapper.isAgentAuthorized(testNode, agentNode));
    }

    function test_revokeAgent_NotAuthorized() public {
        _setupWrappedName(user1, 0);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IKiteWrapper.AgentNotAuthorized.selector, testNode, agentNode));
        wrapper.revokeAgent(testNode, agentNode);
    }

    function test_isAgentAuthorized_ExpiryCheck() public {
        _setupWrappedName(user1, 0);

        vm.prank(user1);
        wrapper.authorizeAgent(testNode, agentNode, user2, 1 ether, uint64(block.timestamp + 1));

        assertTrue(wrapper.isAgentAuthorized(testNode, agentNode));

        vm.warp(block.timestamp + 2);
        assertFalse(wrapper.isAgentAuthorized(testNode, agentNode));
    }

    // ============ Helper Functions ============

    function _setupWrappedName(
        address wrappedOwner,
        uint96 fuses
    ) internal {
        vm.prank(controller);
        wrapper.wrap(testNode, uint256(testNode), wrappedOwner, fuses, uint64(block.timestamp + 365 days));
    }
}
