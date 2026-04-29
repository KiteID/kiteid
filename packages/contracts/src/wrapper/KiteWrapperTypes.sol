// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

library KiteWrapperTypes {
    // ============ Fuse Helpers ============

    function isFuseBurned(
        uint96 fuses,
        uint96 fuseMask
    ) internal pure returns (bool) {
        return (fuses & fuseMask) != 0;
    }

    function burnFuse(
        uint96 fuses,
        uint96 fuseMask
    ) internal pure returns (uint96) {
        return fuses | fuseMask;
    }

    // ============ Name Encoding ============

    function namehash(
        string memory _name
    ) internal pure returns (bytes32) {
        bytes32 node = 0x0;
        bytes memory nameBytes = bytes(_name);
        uint256 len = nameBytes.length;
        uint256 idx = 0;

        while (idx < len) {
            uint256 labelLen = 0;
            uint256 start = idx;

            while (idx < len && nameBytes[idx] != ".") {
                labelLen++;
                idx++;
            }

            bytes memory label = new bytes(labelLen);
            for (uint256 i = 0; i < labelLen; i++) {
                label[i] = nameBytes[start + i];
            }

            node = keccak256(abi.encodePacked(node, keccak256(label)));

            if (idx < len) idx++; // Skip the dot
        }

        return node;
    }

    function readLabel(
        bytes memory name,
        uint256 idx
    ) internal pure returns (bytes memory) {
        uint256 len = 0;
        uint256 start = idx;

        while (idx < name.length && name[idx] != ".") {
            len++;
            idx++;
        }

        bytes memory label = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            label[i] = name[start + i];
        }

        return label;
    }

    // ============ Address Normalization ============

    function toChecksum(
        address addr
    ) internal pure returns (address) {
        return addr;
    }
}
