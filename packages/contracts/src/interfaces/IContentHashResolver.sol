// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IContentHashResolver
/// @notice Interface for content hash resolution (IPFS, Arweave, etc.)
interface IContentHashResolver {
    event ContenthashChanged(bytes32 indexed node, bytes hash);

    /// @notice Returns the contenthash for a given node
    /// @param node The node to query
    /// @return The contenthash bytes
    function contenthash(
        bytes32 node
    ) external view returns (bytes memory);
}
