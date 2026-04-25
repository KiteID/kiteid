// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IAddrResolver} from "../../interfaces/IAddrResolver.sol";
import {IAddressResolver} from "../../interfaces/IAddressResolver.sol";
import {ResolverBase} from "../ResolverBase.sol";

/// @title AddrResolver
/// @notice Resolver profile for Ethereum and multicoin address records
abstract contract AddrResolver is ResolverBase, IAddrResolver, IAddressResolver {
    // coinType => node => version => address
    mapping(uint256 => mapping(bytes32 => mapping(uint64 => bytes))) private _addresses;

    uint256 private constant COIN_TYPE_ETH = 60;

    /// @inheritdoc IAddrResolver
    function addr(
        bytes32 node
    ) public view virtual returns (address payable) {
        bytes memory a = addr(node, COIN_TYPE_ETH);
        if (a.length == 0) return payable(address(0));
        // safe: a is 20 bytes (validated by length check above), bytes20 preserves all bits
        // forge-lint: disable-next-line(unsafe-typecast)
        return payable(address(uint160(bytes20(a))));
    }

    /// @inheritdoc IAddressResolver
    function addr(
        bytes32 node,
        uint256 coinType
    ) public view virtual returns (bytes memory) {
        uint64 version = recordVersions[node];
        return _addresses[coinType][node][version];
    }

    /// @notice Sets the address for a node (ETH only shorthand)
    function setAddr(
        bytes32 node,
        address a
    ) external virtual authorised(node) {
        setAddr(node, COIN_TYPE_ETH, _addressToBytes(a));
    }

    /// @notice Sets the address for a node and coinType
    function setAddr(
        bytes32 node,
        uint256 coinType,
        bytes memory a
    ) public virtual authorised(node) {
        uint64 version = recordVersions[node];
        _addresses[coinType][node][version] = a;
        emit AddressChanged(node, coinType, a);
        // safe: for COIN_TYPE_ETH, a is always 20 bytes (set via _addressToBytes)
        // forge-lint: disable-next-line(unsafe-typecast)
        if (coinType == COIN_TYPE_ETH) emit AddrChanged(node, address(uint160(bytes20(a))));
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public pure virtual override returns (bool) {
        return interfaceID == type(IAddrResolver).interfaceId || interfaceID == type(IAddressResolver).interfaceId
            || super.supportsInterface(interfaceID);
    }

    function _addressToBytes(
        address a
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(a);
    }
}
