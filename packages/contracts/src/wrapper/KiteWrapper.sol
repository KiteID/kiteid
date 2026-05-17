// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IKiteWrapper} from "../interfaces/IKiteWrapper.sol";
import {KiteWrapperTypes} from "./KiteWrapperTypes.sol";

/// @title KiteWrapper
/// @notice UUPS upgradeable ERC-1155 wrapper for KiteID V1 names with fuse system
/// @dev Provides wrapping, permission management (fuses), Passport binding, and agent delegation
contract KiteWrapper is ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable, IKiteWrapper, IERC721Receiver {
    using KiteWrapperTypes for *;

    // ============ ERC-7201 Storage ============

    /// @custom:storage-location erc7201:kiteid.wrapper.storage
    struct WrapperStorage {
        IERC721 baseRegistrar;
        mapping(bytes32 => address) owners;
        mapping(bytes32 => uint256) tokenIds;
        mapping(bytes32 => uint96) fuses;
        mapping(bytes32 => uint64) expiries;
        mapping(bytes32 => bytes32) passportCommitments;
        mapping(bytes32 => mapping(bytes32 => AgentAuth)) agentAuths;
        mapping(bytes32 => bytes32[]) agentList;
    }

    // ERC-7201: keccak256(abi.encode(uint256(keccak256("kiteid.wrapper.storage")) - 1)) & ~bytes32(uint256(0xff))
    // Verified via script/StorageSlot.s.sol on Solidity 0.8.34
    bytes32 private constant STORAGE_LOCATION = 0xaae2fce06d1d1a11b86fed64bc139a7b878de3460d3a51271a51cea9bb3bc700;

    // ============ Fuse Constants ============

    uint96 public constant CANNOT_UNWRAP = 1;
    uint96 public constant CANNOT_TRANSFER = 1 << 2;
    uint96 public constant CANNOT_UNBIND_PASSPORT = 1 << 18;
    uint96 public constant CANNOT_REVOKE_AGENTS = 1 << 19;

    /// @dev Bitmask of all valid fuse bits. setFuses reverts if any other bit is set.
    uint96 public constant VALID_FUSE_MASK =
        CANNOT_UNWRAP | CANNOT_TRANSFER | CANNOT_UNBIND_PASSPORT | CANNOT_REVOKE_AGENTS;

    /// @dev Max authorized agents per parent name (DoS guard on agentList iteration).
    uint256 public constant MAX_AGENTS_PER_NAME = 64;

    // ============ Events ============

    event ControllerAdded(address indexed controller);
    event ControllerRemoved(address indexed controller);

    // ============ State Variables ============

    mapping(address => bool) public controllers;

    // ============ Storage Access ============

    function _getStorage() private pure returns (WrapperStorage storage $) {
        assembly {
            $.slot := STORAGE_LOCATION
        }
    }

    // ============ Initializer ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IERC721 _baseRegistrar,
        address _owner
    ) external initializer {
        __ERC1155_init("");
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();

        WrapperStorage storage $ = _getStorage();
        $.baseRegistrar = _baseRegistrar;
    }

    // ============ Controller Management ============

    function addController(
        address controller
    ) external onlyOwner {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    function removeController(
        address controller
    ) external onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    modifier onlyController() {
        if (!controllers[msg.sender]) revert CallerNotController();
        _;
    }

    // ============ Read Functions ============

    function getFuses(
        bytes32 node
    ) external view returns (uint96) {
        WrapperStorage storage $ = _getStorage();
        return $.fuses[node];
    }

    function getPassportCommitment(
        bytes32 node
    ) external view returns (bytes32) {
        WrapperStorage storage $ = _getStorage();
        return $.passportCommitments[node];
    }

    function getAgent(
        bytes32 parentNode,
        bytes32 agentNode
    ) external view returns (AgentAuth memory) {
        WrapperStorage storage $ = _getStorage();
        return $.agentAuths[parentNode][agentNode];
    }

    function isAgentAuthorized(
        bytes32 parentNode,
        bytes32 agentNode
    ) external view returns (bool) {
        WrapperStorage storage $ = _getStorage();
        AgentAuth memory auth = $.agentAuths[parentNode][agentNode];
        return auth.active && auth.expiry > block.timestamp;
    }

    function getExpiry(
        bytes32 node
    ) external view returns (uint64) {
        WrapperStorage storage $ = _getStorage();
        return $.expiries[node];
    }

    function isBurned(
        bytes32 node,
        uint96 fuses
    ) external view returns (bool) {
        WrapperStorage storage $ = _getStorage();
        return ($.fuses[node] & fuses) != 0;
    }

    // ============ Wrapping Functions ============

    /// @notice Wrap a V1 name (ERC-721) into V2 (ERC-1155) with optional Passport binding
    /// @param node Registry namehash (stored key for wrapped name metadata)
    /// @param tokenId ERC-721 token ID in baseRegistrar (must match actual token)
    function wrap(
        bytes32 node,
        uint256 tokenId,
        address owner,
        uint96 fuses,
        uint64 expiry
    ) external onlyController {
        WrapperStorage storage $ = _getStorage();

        if ($.expiries[node] != 0) revert NameAlreadyWrapped(node);

        $.owners[node] = owner;
        $.tokenIds[node] = tokenId;
        $.fuses[node] = fuses;
        $.expiries[node] = expiry;

        $.baseRegistrar.safeTransferFrom(owner, address(this), tokenId);

        _mint(owner, uint256(node), 1, "");

        emit NameWrapped(node, owner, fuses, expiry);
    }

    /// @notice Unwrap a name (convert ERC-1155 back to control of V1)
    /// @param node Registry namehash
    /// @param tokenId ERC-721 token ID in baseRegistrar (must match actual token)
    function unwrap(
        bytes32 node,
        uint256 tokenId,
        address owner
    ) external onlyController {
        WrapperStorage storage $ = _getStorage();

        if ($.expiries[node] == 0) revert NameNotWrapped(node);
        if ($.tokenIds[node] != tokenId) revert TokenIdMismatch(node, tokenId);
        if (KiteWrapperTypes.isFuseBurned($.fuses[node], CANNOT_UNWRAP)) revert FuseBurned(CANNOT_UNWRAP);

        _burn(owner, uint256(node), 1);

        $.baseRegistrar.safeTransferFrom(address(this), owner, tokenId);

        delete $.owners[node];
        delete $.tokenIds[node];
        delete $.fuses[node];
        delete $.expiries[node];
        delete $.passportCommitments[node];

        emit NameUnwrapped(node, owner);
    }

    /// @notice Burn additional fuses (lock permissions permanently)
    function setFuses(
        bytes32 node,
        uint96 fuses
    ) external {
        WrapperStorage storage $ = _getStorage();

        address owner = _ownerOf(node);
        if (msg.sender != owner) revert CallerNotOwner(node);
        if ($.expiries[node] == 0) revert NameNotWrapped(node);

        // Reject unknown bits to prevent permanent garbage state (fuses are one-way burns).
        if ((fuses & ~VALID_FUSE_MASK) != 0) revert InvalidFuseBits(fuses);

        uint96 currentFuses = $.fuses[node];
        if ((currentFuses & fuses) != 0) revert FuseBurned(fuses);

        $.fuses[node] = currentFuses | fuses;

        emit FusesBurned(node, fuses);
    }

    /// @notice Bind a Kite Passport identity to a name
    function bindPassport(
        bytes32 node,
        bytes32 passportCommitment
    ) external {
        WrapperStorage storage $ = _getStorage();

        address owner = _ownerOf(node);
        if (msg.sender != owner) revert CallerNotOwner(node);
        if ($.expiries[node] == 0) revert NameNotWrapped(node);
        if ($.passportCommitments[node] != 0) revert PassportAlreadyBound(node);

        $.passportCommitments[node] = passportCommitment;

        emit PassportBound(node, passportCommitment);
    }

    /// @notice Unbind a Passport (only if CANNOT_UNBIND_PASSPORT is not burned)
    function unbindPassport(
        bytes32 node
    ) external {
        WrapperStorage storage $ = _getStorage();

        address owner = _ownerOf(node);
        if (msg.sender != owner) revert CallerNotOwner(node);
        if ($.expiries[node] == 0) revert NameNotWrapped(node);
        if ($.passportCommitments[node] == 0) revert PassportNotBound(node);
        if (KiteWrapperTypes.isFuseBurned($.fuses[node], CANNOT_UNBIND_PASSPORT)) {
            revert FuseBurned(CANNOT_UNBIND_PASSPORT);
        }

        delete $.passportCommitments[node];

        emit PassportUnbound(node);
    }

    // ============ Agent Delegation ============

    /// @notice Authorize a child agent under parent name
    function authorizeAgent(
        bytes32 parentNode,
        bytes32 agentNode,
        address agentAddress,
        uint256 spendCapPerTx,
        uint64 expiry
    ) external {
        WrapperStorage storage $ = _getStorage();

        address parentOwner = _ownerOf(parentNode);
        if (msg.sender != parentOwner) revert CallerNotOwner(parentNode);
        if ($.expiries[parentNode] == 0) revert NameNotWrapped(parentNode);
        if (KiteWrapperTypes.isFuseBurned($.fuses[parentNode], CANNOT_REVOKE_AGENTS)) {
            revert FuseBurned(CANNOT_REVOKE_AGENTS);
        }

        AgentAuth memory auth = $.agentAuths[parentNode][agentNode];
        if (auth.active) revert AgentAlreadyAuthorized(parentNode, agentNode);

        // Cap list length to prevent unbounded growth (revoke marks .active=false but never removes).
        if ($.agentList[parentNode].length >= MAX_AGENTS_PER_NAME) revert AgentListFull(parentNode);

        $.agentAuths[parentNode][agentNode] =
            AgentAuth({agentAddress: agentAddress, spendCapPerTx: spendCapPerTx, expiry: expiry, active: true});

        $.agentList[parentNode].push(agentNode);

        emit AgentAuthorized(parentNode, agentNode, agentAddress, spendCapPerTx, expiry);
    }

    /// @notice Revoke agent delegation
    function revokeAgent(
        bytes32 parentNode,
        bytes32 agentNode
    ) external {
        WrapperStorage storage $ = _getStorage();

        address parentOwner = _ownerOf(parentNode);
        if (msg.sender != parentOwner) revert CallerNotOwner(parentNode);
        if ($.expiries[parentNode] == 0) revert NameNotWrapped(parentNode);

        AgentAuth memory auth = $.agentAuths[parentNode][agentNode];
        if (!auth.active) revert AgentNotAuthorized(parentNode, agentNode);
        if (KiteWrapperTypes.isFuseBurned($.fuses[parentNode], CANNOT_REVOKE_AGENTS)) {
            revert FuseBurned(CANNOT_REVOKE_AGENTS);
        }

        $.agentAuths[parentNode][agentNode].active = false;

        emit AgentRevoked(parentNode, agentNode, auth.agentAddress);
    }

    // ============ ERC-1155 Overrides ============

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        WrapperStorage storage $ = _getStorage();

        for (uint256 i = 0; i < ids.length; i++) {
            bytes32 node = bytes32(ids[i]);
            if (from != address(0) && KiteWrapperTypes.isFuseBurned($.fuses[node], CANNOT_TRANSFER)) {
                revert FuseBurned(CANNOT_TRANSFER);
            }
            // Zero-value ERC-1155 transfers must not mutate ownership metadata.
            if (from != address(0) && to != address(0) && values[i] > 0) $.owners[node] = to;
        }

        super._update(from, to, ids, values);
    }

    function _ownerOf(
        bytes32 node
    ) internal view returns (address) {
        return _ownerOf(uint256(node));
    }

    function _ownerOf(
        uint256 tokenId
    ) internal view returns (address owner) {
        WrapperStorage storage $ = _getStorage();
        return $.owners[bytes32(tokenId)];
    }

    function uri(
        uint256
    ) public pure override returns (string memory) {
        return "";
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ============ IERC721Receiver ============

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // ============ Upgrade ============

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
