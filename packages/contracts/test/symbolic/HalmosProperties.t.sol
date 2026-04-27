// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../../src/registrar/IPriceOracle.sol";
import {DeployHelper} from "../helpers/DeployHelper.sol";

/// @title HalmosProperties
/// @notice Symbolic property checks for the KiteID registration system.
///         Run with: halmos --contract HalmosProperties --solver-timeout-assertion 30000
contract HalmosProperties is DeployHelper {
    function setUp() public {
        _deployFullStack(address(this));
    }

    // ─── Commitment scheme ────────────────────────────────────────────────────

    /// Commitment is deterministic: identical inputs always hash to the same value.
    function check_commitmentDeterministic(
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bool reverseRecord
    ) public view {
        bytes[] memory data = new bytes[](0);
        bytes32 c1 = controller.makeCommitment("alice", owner, duration, secret, resolver, data, reverseRecord);
        bytes32 c2 = controller.makeCommitment("alice", owner, duration, secret, resolver, data, reverseRecord);
        assert(c1 == c2);
    }

    /// Distinct secrets always produce distinct commitments (collision resistance).
    function check_commitmentSecretIsolation(
        address owner,
        uint256 duration,
        bytes32 secret1,
        bytes32 secret2,
        address resolver,
        bool reverseRecord
    ) public view {
        vm.assume(secret1 != secret2);
        bytes[] memory data = new bytes[](0);
        bytes32 c1 = controller.makeCommitment("alice", owner, duration, secret1, resolver, data, reverseRecord);
        bytes32 c2 = controller.makeCommitment("alice", owner, duration, secret2, resolver, data, reverseRecord);
        assert(c1 != c2);
    }

    /// Distinct owners always produce distinct commitments.
    function check_commitmentOwnerIsolation(
        address owner1,
        address owner2,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bool reverseRecord
    ) public view {
        vm.assume(owner1 != owner2);
        bytes[] memory data = new bytes[](0);
        bytes32 c1 = controller.makeCommitment("alice", owner1, duration, secret, resolver, data, reverseRecord);
        bytes32 c2 = controller.makeCommitment("alice", owner2, duration, secret, resolver, data, reverseRecord);
        assert(c1 != c2);
    }

    // ─── Price oracle ─────────────────────────────────────────────────────────

    /// Price for a valid name is always non-zero.
    function check_priceNonZeroForValidName(
        uint256 duration
    ) public view {
        vm.assume(duration >= 28 days);
        vm.assume(duration <= 10 * 365.25 days);
        // "alice" = 5 chars, base price 5 KITE/yr
        IPriceOracle.Price memory p = priceOracle.price("alice", 0, duration);
        assert(p.base > 0);
    }

    /// Price is monotonic: longer duration never costs less.
    function check_priceMonotonicity(
        uint256 duration1,
        uint256 duration2
    ) public view {
        vm.assume(duration1 >= 28 days);
        vm.assume(duration2 > duration1);
        vm.assume(duration2 <= 10 * 365.25 days);
        IPriceOracle.Price memory p1 = priceOracle.price("alice", 0, duration1);
        IPriceOracle.Price memory p2 = priceOracle.price("alice", 0, duration2);
        assert(p2.base >= p1.base);
    }
}
