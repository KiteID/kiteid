// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";
import {IMulticallable} from "../interfaces/IMulticallable.sol";
import {ResolverBase} from "./ResolverBase.sol";
import {AddrResolver} from "./profiles/AddrResolver.sol";
import {ContentHashResolver} from "./profiles/ContentHashResolver.sol";
import {InterfaceResolver} from "./profiles/InterfaceResolver.sol";
import {NameResolver} from "./profiles/NameResolver.sol";
import {TextResolver} from "./profiles/TextResolver.sol";

/// @title KiteResolver
/// @notice Full-featured resolver combining all profiles with multicall support
contract KiteResolver is
    AddrResolver,
    TextResolver,
    ContentHashResolver,
    NameResolver,
    InterfaceResolver,
    IMulticallable
{
    // ============ Constructor ============

    constructor(
        IKiteRegistry _registry
    ) ResolverBase(_registry) {}

    // ============ Multicall ============

    /// @inheritdoc IMulticallable
    function multicall(
        bytes[] calldata data
    ) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "KiteResolver: multicall failed");
            results[i] = result;
        }
    }

    // ============ ERC-165 ============

    function supportsInterface(
        bytes4 interfaceID
    )
        public
        pure
        override(AddrResolver, TextResolver, ContentHashResolver, NameResolver, InterfaceResolver)
        returns (bool)
    {
        return interfaceID == type(IMulticallable).interfaceId || AddrResolver.supportsInterface(interfaceID)
            || TextResolver.supportsInterface(interfaceID) || ContentHashResolver.supportsInterface(interfaceID)
            || NameResolver.supportsInterface(interfaceID) || InterfaceResolver.supportsInterface(interfaceID);
    }
}
