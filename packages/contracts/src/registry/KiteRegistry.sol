// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";

/// @title KiteRegistry
/// @notice EIP-137 compatible ownership tree for the .kite namespace
/// @dev Immutable contract — no proxy/upgrade pattern
contract KiteRegistry is IKiteRegistry {
    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }

    mapping(bytes32 => Record) private _records;
    mapping(address => mapping(address => bool)) private _operators;

    /// @notice Initializes the registry with the root node owned by the deployer
    constructor() {
        _records[bytes32(0)].owner = msg.sender;
    }

    // ============ Modifiers ============

    modifier authorised(
        bytes32 node
    ) {
        address nodeOwner = _records[node].owner;
        require(nodeOwner == msg.sender || _operators[nodeOwner][msg.sender], "KiteRegistry: not authorised");
        _;
    }

    // ============ Mutators ============

    /// @inheritdoc IKiteRegistry
    function setRecord(
        bytes32 node,
        address owner,
        address resolver,
        uint64 ttl
    ) external authorised(node) {
        _setOwner(node, owner);
        _records[node].resolver = resolver;
        _records[node].ttl = ttl;
        emit NewResolver(node, resolver);
        emit NewTTL(node, ttl);
    }

    /// @inheritdoc IKiteRegistry
    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external authorised(node) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _records[subnode].owner = owner;
        _records[subnode].resolver = resolver;
        _records[subnode].ttl = ttl;
        emit NewOwner(node, label, owner);
        emit NewResolver(subnode, resolver);
        emit NewTTL(subnode, ttl);
    }

    /// @inheritdoc IKiteRegistry
    function setSubnodeOwner(
        bytes32 node,
        bytes32 label,
        address owner
    ) external authorised(node) returns (bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _records[subnode].owner = owner;
        emit NewOwner(node, label, owner);
        return subnode;
    }

    /// @inheritdoc IKiteRegistry
    function setOwner(
        bytes32 node,
        address owner
    ) external authorised(node) {
        _setOwner(node, owner);
    }

    /// @inheritdoc IKiteRegistry
    function setResolver(
        bytes32 node,
        address resolver
    ) external authorised(node) {
        _records[node].resolver = resolver;
        emit NewResolver(node, resolver);
    }

    /// @inheritdoc IKiteRegistry
    function setTTL(
        bytes32 node,
        uint64 ttl
    ) external authorised(node) {
        _records[node].ttl = ttl;
        emit NewTTL(node, ttl);
    }

    /// @inheritdoc IKiteRegistry
    function setApprovalForAll(
        address operator,
        bool approved
    ) external {
        _operators[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // ============ Views ============

    /// @inheritdoc IKiteRegistry
    function owner(
        bytes32 node
    ) external view returns (address) {
        return _records[node].owner;
    }

    /// @inheritdoc IKiteRegistry
    function resolver(
        bytes32 node
    ) external view returns (address) {
        return _records[node].resolver;
    }

    /// @inheritdoc IKiteRegistry
    function ttl(
        bytes32 node
    ) external view returns (uint64) {
        return _records[node].ttl;
    }

    /// @inheritdoc IKiteRegistry
    function recordExists(
        bytes32 node
    ) external view returns (bool) {
        return _records[node].owner != address(0);
    }

    /// @inheritdoc IKiteRegistry
    function isApprovedForAll(
        address owner_,
        address operator
    ) external view returns (bool) {
        return _operators[owner_][operator];
    }

    // ============ Internal ============

    function _setOwner(
        bytes32 node,
        address owner_
    ) internal {
        _records[node].owner = owner_;
        emit Transfer(node, owner_);
    }
}
