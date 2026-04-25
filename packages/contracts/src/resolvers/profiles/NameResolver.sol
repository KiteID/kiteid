// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {INameResolver} from "../../interfaces/INameResolver.sol";
import {ResolverBase} from "../ResolverBase.sol";

/// @title NameResolver
/// @notice Resolver profile for reverse name resolution
abstract contract NameResolver is ResolverBase, INameResolver {
    // node => version => name
    mapping(bytes32 => mapping(uint64 => string)) private _names;

    /// @inheritdoc INameResolver
    function name(
        bytes32 node
    ) external view virtual returns (string memory) {
        uint64 version = recordVersions[node];
        return _names[node][version];
    }

    /// @notice Sets the name for a node (reverse record)
    function setName(
        bytes32 node,
        string calldata newName
    ) external virtual authorised(node) {
        uint64 version = recordVersions[node];
        _names[node][version] = newName;
        emit NameChanged(node, newName);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual override returns (bool) {
        return interfaceID == type(INameResolver).interfaceId || super.supportsInterface(interfaceID);
    }
}
