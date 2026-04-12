// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";
import {Ownable} from "solady/auth/Ownable.sol";

/// @dev Interface for the setName function on the resolver
interface IReverseResolver {
    function setName(
        bytes32 node,
        string calldata name
    ) external;
}

/// @title KiteReverseRegistrar
/// @notice Manages reverse records (address → name) for .kite domains
contract KiteReverseRegistrar is Ownable {
    // ============ Errors ============

    error NotAuthorised(address addr);

    // ============ Events ============

    event ReverseClaimed(address indexed addr, bytes32 indexed node);
    event DefaultResolverChanged(address indexed resolver);

    // ============ State ============

    IKiteRegistry public immutable registry;
    bytes32 public constant ADDR_REVERSE_NODE =
        keccak256(abi.encodePacked(keccak256(abi.encodePacked(bytes32(0), keccak256("reverse"))), keccak256("addr")));

    address public defaultResolver;

    // ============ Constructor ============

    constructor(
        IKiteRegistry _registry,
        address _defaultResolver
    ) {
        _initializeOwner(msg.sender);
        registry = _registry;
        defaultResolver = _defaultResolver;
    }

    // ============ Public ============

    /// @notice Claims the reverse record for the caller
    /// @param owner The address to set as owner of the reverse node
    /// @return The reverse node
    function claim(
        address owner
    ) external returns (bytes32) {
        return _claimForAddr(msg.sender, owner);
    }

    /// @notice Sets the reverse name for the caller
    /// @param name The .kite name to set (e.g., "alice.kite")
    function setName(
        string calldata name
    ) external returns (bytes32) {
        bytes32 node = _claimForAddr(msg.sender, address(this));
        IReverseResolver(defaultResolver).setName(node, name);
        return node;
    }

    /// @notice Sets the reverse name for a specific address (authorized callers only)
    /// @param addr The address to set the reverse for
    /// @param name The .kite name
    function setNameForAddr(
        address addr,
        string calldata name
    ) external returns (bytes32) {
        if (msg.sender != addr && !_isAuthorised(addr)) revert NotAuthorised(addr);
        bytes32 node = _claimForAddr(addr, address(this));
        IReverseResolver(defaultResolver).setName(node, name);
        return node;
    }

    /// @notice Computes the reverse node for an address
    /// @param addr The address
    /// @return The reverse node hash
    function node(
        address addr
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(ADDR_REVERSE_NODE, keccak256(abi.encodePacked(_addrToString(addr)))));
    }

    // ============ Admin ============

    /// @notice Sets the default resolver for reverse records
    function setDefaultResolver(
        address _resolver
    ) external onlyOwner {
        defaultResolver = _resolver;
        emit DefaultResolverChanged(_resolver);
    }

    // ============ Internal ============

    function _claimForAddr(
        address addr,
        address owner
    ) internal returns (bytes32) {
        bytes32 label = keccak256(abi.encodePacked(_addrToString(addr)));
        bytes32 reverseNode = registry.setSubnodeOwner(ADDR_REVERSE_NODE, label, owner);
        emit ReverseClaimed(addr, reverseNode);
        return reverseNode;
    }

    function _isAuthorised(
        address addr
    ) internal view returns (bool) {
        // Check if caller is approved operator for the address's reverse node
        return registry.isApprovedForAll(addr, msg.sender);
    }

    /// @notice Converts an address to its lowercase hex string
    function _addrToString(
        address addr
    ) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(addr)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = _hexChar(hi);
            s[2 * i + 1] = _hexChar(lo);
        }
        return string(s);
    }

    function _hexChar(
        bytes1 b
    ) internal pure returns (bytes1) {
        uint8 n = uint8(b);
        if (n < 10) return bytes1(n + 0x30);
        return bytes1(n + 0x57); // lowercase a-f
    }
}
