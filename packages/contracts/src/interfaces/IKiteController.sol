// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../registrar/IPriceOracle.sol";

/// @title IKiteController
/// @notice Controller interface for commit-reveal name registration
interface IKiteController {
    // Events
    event NameRegistered(
        string name, bytes32 indexed label, address indexed owner, uint256 baseCost, uint256 premium, uint256 expires
    );
    event NameRenewed(string name, bytes32 indexed label, uint256 cost, uint256 expires);
    event CommitmentSubmitted(bytes32 indexed commitment);

    // Mutators
    function commit(
        bytes32 commitment
    ) external;
    function register(
        string calldata name,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord
    ) external payable;
    function renew(
        string calldata name,
        uint256 duration
    ) external payable;
    function withdraw() external;

    // Views
    function rentPrice(
        string calldata name,
        uint256 duration
    ) external view returns (IPriceOracle.Price memory);
    function available(
        string calldata name
    ) external view returns (bool);
    function makeCommitment(
        string calldata name,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord
    ) external pure returns (bytes32);
    function commitments(
        bytes32 commitment
    ) external view returns (uint256);

    // Constants
    function MIN_COMMITMENT_AGE() external view returns (uint256);
    function MAX_COMMITMENT_AGE() external view returns (uint256);
    function MIN_REGISTRATION_DURATION() external view returns (uint256);
}
