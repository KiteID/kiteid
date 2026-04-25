// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {StringUtils} from "../../src/utils/StringUtils.sol";
import {Test} from "forge-std/Test.sol";

contract StringUtilsTest is Test {
    using StringUtils for string;

    // ============ strlen ============

    function test_strlen_empty() public pure {
        string memory empty = "";
        assertEq(empty.strlen(), 0);
    }

    function test_strlen_ascii() public pure {
        string memory s1 = "hello";
        string memory s2 = "alice";
        string memory s3 = "a";
        assertEq(s1.strlen(), 5);
        assertEq(s2.strlen(), 5);
        assertEq(s3.strlen(), 1);
    }

    function test_strlen_multibyte() public pure {
        // 2-byte UTF-8
        string memory s1 = unicode"café";
        assertEq(s1.strlen(), 4);
        // 3-byte UTF-8
        string memory s2 = unicode"你好";
        assertEq(s2.strlen(), 2);
    }

    // ============ isValidName ============

    function test_isValidName_valid() public pure {
        string memory n1 = "alice";
        string memory n2 = "bob123";
        string memory n3 = "my-name";
        string memory n4 = "a";
        string memory n5 = "abc";
        string memory n6 = "hello-world";
        string memory n7 = "test123test";
        assertTrue(n1.isValidName());
        assertTrue(n2.isValidName());
        assertTrue(n3.isValidName());
        assertTrue(n4.isValidName());
        assertTrue(n5.isValidName());
        assertTrue(n6.isValidName());
        assertTrue(n7.isValidName());
    }

    function test_isValidName_empty() public pure {
        string memory empty = "";
        assertFalse(empty.isValidName());
    }

    function test_isValidName_uppercase() public pure {
        string memory n1 = "Alice";
        string memory n2 = "BOB";
        string memory n3 = "heLLo";
        assertFalse(n1.isValidName());
        assertFalse(n2.isValidName());
        assertFalse(n3.isValidName());
    }

    function test_isValidName_specialChars() public pure {
        string memory n1 = "alice.kite";
        string memory n2 = "hello_world";
        string memory n3 = "test@name";
        string memory n4 = "name space";
        assertFalse(n1.isValidName());
        assertFalse(n2.isValidName());
        assertFalse(n3.isValidName());
        assertFalse(n4.isValidName());
    }

    function test_isValidName_hyphenRules() public pure {
        string memory n1 = "-start";
        string memory n2 = "end-";
        string memory n3 = "double--hyphen";
        string memory n4 = "single-hyphen";
        string memory n5 = "a-b-c";
        assertFalse(n1.isValidName());
        assertFalse(n2.isValidName());
        assertFalse(n3.isValidName());
        assertTrue(n4.isValidName());
        assertTrue(n5.isValidName());
    }

    // ============ namehash ============

    function test_namehash_deterministic() public pure {
        bytes32 hash1 = StringUtils.namehash("alice");
        bytes32 hash2 = StringUtils.namehash("alice");
        assertEq(hash1, hash2);
    }

    function test_namehash_different_labels() public pure {
        bytes32 hash1 = StringUtils.namehash("alice");
        bytes32 hash2 = StringUtils.namehash("bob");
        assertNotEq(hash1, hash2);
    }

    function test_namehash_kiteNode() public pure {
        // Verify kite node calculation
        bytes32 rootNode = bytes32(0);
        bytes32 expectedKiteNode = keccak256(abi.encodePacked(rootNode, keccak256("kite")));
        bytes32 expectedAliceNode = keccak256(abi.encodePacked(expectedKiteNode, keccak256("alice")));
        assertEq(StringUtils.namehash("alice"), expectedAliceNode);
    }

    // ============ labelhash ============

    function test_labelhash() public pure {
        assertEq(StringUtils.labelhash("alice"), keccak256("alice"));
        assertEq(StringUtils.labelhash("bob"), keccak256("bob"));
    }

    // ============ Fuzz ============

    function testFuzz_strlen_neverReverts(
        string memory s
    ) public pure {
        // Should never revert, just return a value
        s.strlen();
    }

    function testFuzz_labelhash_consistent(
        string memory label
    ) public pure {
        assertEq(StringUtils.labelhash(label), keccak256(bytes(label)));
    }
}
