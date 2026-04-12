// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title ITextResolver
/// @notice Interface for text record resolution
interface ITextResolver {
    event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value);

    /// @notice Returns the text record for a given node and key
    /// @param node The node to query
    /// @param key The text data key (e.g., "url", "avatar", "twitter")
    /// @return The associated text value
    function text(
        bytes32 node,
        string calldata key
    ) external view returns (string memory);
}
