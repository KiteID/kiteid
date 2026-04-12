// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IInterfaceResolver
/// @notice EIP-165/EIP-1844 interface resolver
interface IInterfaceResolver {
    event InterfaceChanged(bytes32 indexed node, bytes4 indexed interfaceID, address implementer);

    /// @notice Returns the address of a contract that implements the specified interface
    /// @param node The node to query
    /// @param interfaceID The EIP-165 interface ID
    /// @return The address of the implementer
    function interfaceImplementer(
        bytes32 node,
        bytes4 interfaceID
    ) external view returns (address);
}
