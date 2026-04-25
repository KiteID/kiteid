// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IAddressResolver
/// @notice ENSIP-9 multicoin address resolution interface
interface IAddressResolver {
    event AddressChanged(bytes32 indexed node, uint256 coinType, bytes newAddress);

    /// @notice Returns the address associated with a node for a given coin type
    /// @param node The node to query
    /// @param coinType SLIP-44 coin type (60 = ETH)
    /// @return The address in bytes format
    function addr(
        bytes32 node,
        uint256 coinType
    ) external view returns (bytes memory);
}
