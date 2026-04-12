// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";

/// @title ResolverBase
/// @notice Base contract for resolver profiles with versioning and authorization
abstract contract ResolverBase {
    // ============ Errors ============

    error Unauthorized(bytes32 node, address caller);

    // ============ State ============

    IKiteRegistry public immutable registry;

    /// @notice Record version per node — incrementing clears all records
    mapping(bytes32 => uint64) public recordVersions;

    // ============ Constructor ============

    constructor(
        IKiteRegistry _registry
    ) {
        registry = _registry;
    }

    // ============ Modifiers ============

    modifier authorised(
        bytes32 node
    ) {
        if (!_isAuthorised(node)) revert Unauthorized(node, msg.sender);
        _;
    }

    // ============ Public ============

    /// @notice Clears all records for a node by incrementing its version
    /// @param node The node to clear records for
    function clearRecords(
        bytes32 node
    ) external virtual authorised(node) {
        recordVersions[node]++;
    }

    // ============ Internal ============

    function _isAuthorised(
        bytes32 node
    ) internal view returns (bool) {
        address nodeOwner = registry.owner(node);
        return nodeOwner == msg.sender || registry.isApprovedForAll(nodeOwner, msg.sender);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual returns (bool) {
        return interfaceID == 0x01ffc9a7; // ERC-165
    }
}
