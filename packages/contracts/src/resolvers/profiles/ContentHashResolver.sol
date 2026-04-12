// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IContentHashResolver} from "../../interfaces/IContentHashResolver.sol";
import {ResolverBase} from "../ResolverBase.sol";

/// @title ContentHashResolver
/// @notice Resolver profile for content hash records (IPFS, Arweave, Swarm)
abstract contract ContentHashResolver is ResolverBase, IContentHashResolver {
    // node => version => contenthash
    mapping(bytes32 => mapping(uint64 => bytes)) private _hashes;

    /// @inheritdoc IContentHashResolver
    function contenthash(
        bytes32 node
    ) external view virtual returns (bytes memory) {
        uint64 version = recordVersions[node];
        return _hashes[node][version];
    }

    /// @notice Sets the contenthash for a node
    function setContenthash(
        bytes32 node,
        bytes calldata hash
    ) external virtual authorised(node) {
        uint64 version = recordVersions[node];
        _hashes[node][version] = hash;
        emit ContenthashChanged(node, hash);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual override returns (bool) {
        return interfaceID == type(IContentHashResolver).interfaceId || super.supportsInterface(interfaceID);
    }
}
