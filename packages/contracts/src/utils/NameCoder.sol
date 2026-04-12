// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title NameCoder
/// @notice DNS-wire format encoding/decoding for .kite names
library NameCoder {
    /// @notice Encodes a .kite name into DNS-wire format
    /// @param label The label (e.g., "alice" for alice.kite)
    /// @return The DNS-wire encoded name (e.g., \x05alice\x04kite\x00)
    function encode(
        string memory label
    ) internal pure returns (bytes memory) {
        bytes memory labelBytes = bytes(label);
        bytes memory kiteBytes = bytes("kite");

        // format: <labelLen><label><4><kite><0>
        bytes memory result = new bytes(labelBytes.length + kiteBytes.length + 3);

        uint256 pos;
        result[pos++] = bytes1(uint8(labelBytes.length));
        for (uint256 i; i < labelBytes.length; i++) {
            result[pos++] = labelBytes[i];
        }
        result[pos++] = bytes1(uint8(kiteBytes.length));
        for (uint256 i; i < kiteBytes.length; i++) {
            result[pos++] = kiteBytes[i];
        }
        result[pos] = 0x00;

        return result;
    }

    /// @notice Decodes a DNS-wire format name and returns the first label
    /// @param data The DNS-wire encoded data
    /// @return label The first label in the name
    function decode(
        bytes memory data
    ) internal pure returns (string memory label) {
        require(data.length > 2, "NameCoder: invalid data");

        uint8 labelLen = uint8(data[0]);
        require(data.length >= uint256(labelLen) + 2, "NameCoder: truncated");

        bytes memory labelBytes = new bytes(labelLen);
        for (uint256 i; i < labelLen; i++) {
            labelBytes[i] = data[i + 1];
        }

        return string(labelBytes);
    }
}
