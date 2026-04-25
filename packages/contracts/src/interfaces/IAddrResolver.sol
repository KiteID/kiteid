// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IAddrResolver
/// @notice Interface for resolving Ethereum addresses
interface IAddrResolver {
    event AddrChanged(bytes32 indexed node, address a);

    /// @notice Returns the address associated with a node
    /// @param node The node to query
    /// @return The associated address
    function addr(
        bytes32 node
    ) external view returns (address payable);
}
