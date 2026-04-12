// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ITextResolver} from "../../interfaces/ITextResolver.sol";
import {ResolverBase} from "../ResolverBase.sol";

/// @title TextResolver
/// @notice Resolver profile for text records (url, avatar, twitter, github, etc.)
abstract contract TextResolver is ResolverBase, ITextResolver {
    // node => version => key => value
    mapping(bytes32 => mapping(uint64 => mapping(string => string))) private _texts;

    /// @inheritdoc ITextResolver
    function text(
        bytes32 node,
        string calldata key
    ) external view virtual returns (string memory) {
        uint64 version = recordVersions[node];
        return _texts[node][version][key];
    }

    /// @notice Sets a text record for a node
    function setText(
        bytes32 node,
        string calldata key,
        string calldata value
    ) external virtual authorised(node) {
        uint64 version = recordVersions[node];
        _texts[node][version][key] = value;
        emit TextChanged(node, key, key, value);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual override returns (bool) {
        return interfaceID == type(ITextResolver).interfaceId || super.supportsInterface(interfaceID);
    }
}
