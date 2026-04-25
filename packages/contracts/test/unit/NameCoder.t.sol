// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {NameCoder} from "../../src/utils/NameCoder.sol";
import {Test} from "forge-std/Test.sol";

contract NameCoderTest is Test {
    // ============ encode ============

    function test_encode_simple() public pure {
        bytes memory encoded = NameCoder.encode("alice");
        // \x05alice\x04kite\x00
        assertEq(encoded.length, 5 + 4 + 3); // label + "kite" + 3 length/null bytes
        assertEq(uint8(encoded[0]), 5); // label length
        assertEq(encoded[1], "a");
        assertEq(encoded[5], "e");
        assertEq(uint8(encoded[6]), 4); // "kite" length
        assertEq(encoded[7], "k");
        assertEq(uint8(encoded[11]), 0); // null terminator
    }

    function test_encode_singleChar() public pure {
        bytes memory encoded = NameCoder.encode("a");
        assertEq(encoded.length, 1 + 4 + 3);
        assertEq(uint8(encoded[0]), 1);
        assertEq(encoded[1], "a");
    }

    // ============ decode ============

    function test_decode_simple() public pure {
        bytes memory encoded = NameCoder.encode("alice");
        string memory label = NameCoder.decode(encoded);
        assertEq(label, "alice");
    }

    function test_decode_singleChar() public pure {
        bytes memory encoded = NameCoder.encode("x");
        string memory label = NameCoder.decode(encoded);
        assertEq(label, "x");
    }

    // ============ roundtrip ============

    function test_roundtrip_various() public pure {
        string[5] memory names = ["alice", "bob", "hello-world", "a", "test123"];
        for (uint256 i; i < names.length; i++) {
            bytes memory encoded = NameCoder.encode(names[i]);
            string memory decoded = NameCoder.decode(encoded);
            assertEq(decoded, names[i]);
        }
    }

    function test_decode_reverts_empty() public {
        bytes memory empty = new bytes(0);
        vm.expectRevert(bytes("NameCoder: invalid data"));
        this.externalDecode(empty);
    }

    function test_decode_reverts_truncated() public {
        // Length byte says 10 but only 3 bytes available total (passes first check: 4 > 2)
        bytes memory truncated = new bytes(4);
        truncated[0] = bytes1(uint8(10)); // says 10 bytes of label
        truncated[1] = "a";
        truncated[2] = "b";
        truncated[3] = "c";
        vm.expectRevert(bytes("NameCoder: truncated"));
        this.externalDecode(truncated);
    }

    /// @dev External wrapper to allow vm.expectRevert to work with library calls
    function externalDecode(
        bytes memory data
    ) external pure returns (string memory) {
        return NameCoder.decode(data);
    }
}
