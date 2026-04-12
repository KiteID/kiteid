// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title StringUtils
/// @notice UTF-8 string utilities for name validation and namehash computation
library StringUtils {
    /// @notice Returns the UTF-8 character length of a string (not byte length)
    /// @param s The string to measure
    /// @return length The number of UTF-8 characters
    function strlen(
        string memory s
    ) internal pure returns (uint256 length) {
        uint256 i;
        uint256 byteLen = bytes(s).length;

        for (length = 0; i < byteLen; length++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) i += 1;
            else if (b < 0xE0) i += 2;
            else if (b < 0xF0) i += 3;
            else i += 4;
        }
    }

    /// @notice Validates that a name contains only allowed characters (a-z, 0-9, hyphen)
    /// @dev Does not allow names starting or ending with hyphen, or consecutive hyphens
    /// @param name The name to validate
    /// @return True if the name is valid
    function isValidName(
        string memory name
    ) internal pure returns (bool) {
        bytes memory b = bytes(name);
        uint256 len = b.length;

        if (len == 0) return false;

        // Cannot start or end with hyphen
        if (b[0] == 0x2D || b[len - 1] == 0x2D) return false;

        for (uint256 i; i < len; i++) {
            bytes1 c = b[i];
            // a-z: 0x61-0x7A, 0-9: 0x30-0x39, hyphen: 0x2D
            bool isLower = (c >= 0x61 && c <= 0x7A);
            bool isDigit = (c >= 0x30 && c <= 0x39);
            bool isHyphen = (c == 0x2D);

            if (!isLower && !isDigit && !isHyphen) return false;

            // No consecutive hyphens
            if (isHyphen && i + 1 < len && b[i + 1] == 0x2D) return false;
        }

        return true;
    }

    /// @notice Computes the namehash of a .kite name
    /// @param label The label (e.g., "alice" for alice.kite)
    /// @return The namehash node
    function namehash(
        string memory label
    ) internal pure returns (bytes32) {
        // namehash("kite") = keccak256(abi.encodePacked(namehash(""), keccak256("kite")))
        bytes32 kiteNode = keccak256(abi.encodePacked(bytes32(0), keccak256(bytes("kite"))));
        return keccak256(abi.encodePacked(kiteNode, keccak256(bytes(label))));
    }

    /// @notice Computes the labelhash of a name
    /// @param label The label string
    /// @return The keccak256 hash of the label
    function labelhash(
        string memory label
    ) internal pure returns (bytes32) {
        return keccak256(bytes(label));
    }
}
