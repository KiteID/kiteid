// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IInterfaceResolver} from "../../interfaces/IInterfaceResolver.sol";
import {ResolverBase} from "../ResolverBase.sol";

/// @title InterfaceResolver
/// @notice EIP-165/EIP-1844 interface resolution for nodes
abstract contract InterfaceResolver is ResolverBase, IInterfaceResolver {
    // node => version => interfaceID => implementer
    mapping(bytes32 => mapping(uint64 => mapping(bytes4 => address))) private _interfaces;

    /// @inheritdoc IInterfaceResolver
    function interfaceImplementer(
        bytes32 node,
        bytes4 interfaceID
    ) external view virtual returns (address) {
        uint64 version = recordVersions[node];
        return _interfaces[node][version][interfaceID];
    }

    /// @notice Sets the implementer for an interface on a node
    function setInterface(
        bytes32 node,
        bytes4 interfaceID,
        address implementer
    ) external virtual authorised(node) {
        uint64 version = recordVersions[node];
        _interfaces[node][version][interfaceID] = implementer;
        emit InterfaceChanged(node, interfaceID, implementer);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual override returns (bool) {
        return interfaceID == type(IInterfaceResolver).interfaceId || super.supportsInterface(interfaceID);
    }
}
