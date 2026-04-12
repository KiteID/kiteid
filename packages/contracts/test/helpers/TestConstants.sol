// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title TestConstants
/// @notice Shared constants for test suites
library TestConstants {
    // Node hashes
    bytes32 internal constant ROOT_NODE = bytes32(0);
    bytes32 internal constant KITE_NODE = keccak256(abi.encodePacked(ROOT_NODE, keccak256("kite")));
    bytes32 internal constant REVERSE_NODE = keccak256(abi.encodePacked(ROOT_NODE, keccak256("reverse")));
    bytes32 internal constant ADDR_REVERSE_NODE = keccak256(abi.encodePacked(REVERSE_NODE, keccak256("addr")));

    // Durations
    uint256 internal constant ONE_YEAR = 365.25 days;
    uint256 internal constant TWO_YEARS = 730.5 days;
    uint256 internal constant MIN_DURATION = 28 days;
    uint256 internal constant GRACE_PERIOD = 90 days;

    // Commit-reveal
    uint256 internal constant MIN_COMMITMENT_AGE = 60;
    uint256 internal constant MAX_COMMITMENT_AGE = 24 hours;

    // Pricing (in wei, KITE has 18 decimals)
    uint256 internal constant PRICE_3CHAR = 640 ether;
    uint256 internal constant PRICE_4CHAR = 160 ether;
    uint256 internal constant PRICE_5PLUS = 5 ether;

    // Test secrets
    bytes32 internal constant SECRET = keccak256("test-secret");
    bytes32 internal constant SECRET2 = keccak256("test-secret-2");
}
