// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../../src/interfaces/IKiteRegistry.sol";

/// @title MockKiteRegistry
/// @notice Minimal registry mock for isolated testing
contract MockKiteRegistry is IKiteRegistry {
    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }

    mapping(bytes32 => Record) private _records;
    mapping(address => mapping(address => bool)) private _operators;

    constructor() {
        _records[bytes32(0)].owner = msg.sender;
    }

    function setRecord(
        bytes32 node,
        address owner,
        address resolver,
        uint64 ttl
    ) external {
        _records[node] = Record(owner, resolver, ttl);
        emit Transfer(node, owner);
        emit NewResolver(node, resolver);
        emit NewTTL(node, ttl);
    }

    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _records[subnode] = Record(owner, resolver, ttl);
        emit NewOwner(node, label, owner);
    }

    function setSubnodeOwner(
        bytes32 node,
        bytes32 label,
        address owner
    ) external returns (bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _records[subnode].owner = owner;
        emit NewOwner(node, label, owner);
        return subnode;
    }

    function setOwner(
        bytes32 node,
        address owner
    ) external {
        _records[node].owner = owner;
        emit Transfer(node, owner);
    }

    function setResolver(
        bytes32 node,
        address resolver
    ) external {
        _records[node].resolver = resolver;
        emit NewResolver(node, resolver);
    }

    function setTTL(
        bytes32 node,
        uint64 ttl
    ) external {
        _records[node].ttl = ttl;
        emit NewTTL(node, ttl);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) external {
        _operators[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function owner(
        bytes32 node
    ) external view returns (address) {
        return _records[node].owner;
    }

    function resolver(
        bytes32 node
    ) external view returns (address) {
        return _records[node].resolver;
    }

    function ttl(
        bytes32 node
    ) external view returns (uint64) {
        return _records[node].ttl;
    }

    function recordExists(
        bytes32 node
    ) external view returns (bool) {
        return _records[node].owner != address(0);
    }

    function isApprovedForAll(
        address owner_,
        address operator
    ) external view returns (bool) {
        return _operators[owner_][operator];
    }
}
