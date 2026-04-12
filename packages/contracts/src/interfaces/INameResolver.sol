// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title INameResolver
/// @notice Interface for reverse name resolution
interface INameResolver {
    event NameChanged(bytes32 indexed node, string name);

    /// @notice Returns the name associated with a node (reverse resolution)
    /// @param node The node to query
    /// @return The associated name
    function name(
        bytes32 node
    ) external view returns (string memory);
}
