// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IKiteWrapper is IERC1155 {
    // ============ Events ============

    event NameWrapped(bytes32 indexed node, address indexed owner, uint96 fuses, uint64 expiry);
    event NameUnwrapped(bytes32 indexed node, address indexed owner);
    event FusesBurned(bytes32 indexed node, uint96 fuses);
    event PassportBound(bytes32 indexed node, bytes32 indexed passportCommitment);
    event PassportUnbound(bytes32 indexed node);
    event AgentAuthorized(
        bytes32 indexed parentNode,
        bytes32 indexed agentNode,
        address indexed agentAddress,
        uint256 spendCapPerTx,
        uint64 expiry
    );
    event AgentRevoked(bytes32 indexed parentNode, bytes32 indexed agentNode, address indexed agentAddress);

    // ============ Structs ============

    struct AgentAuth {
        address agentAddress;
        uint256 spendCapPerTx;
        uint64 expiry;
        bool active;
    }

    // ============ Fuse Constants ============

    uint96 constant CANNOT_UNWRAP = 1;
    uint96 constant CANNOT_TRANSFER = 1 << 2;
    uint96 constant CANNOT_UNBIND_PASSPORT = 1 << 18;
    uint96 constant CANNOT_REVOKE_AGENTS = 1 << 19;

    // ============ Read Functions ============

    function getFuses(
        bytes32 node
    ) external view returns (uint96);
    function getPassportCommitment(
        bytes32 node
    ) external view returns (bytes32);
    function getAgent(
        bytes32 parentNode,
        bytes32 agentNode
    ) external view returns (AgentAuth memory);
    function isAgentAuthorized(
        bytes32 parentNode,
        bytes32 agentNode
    ) external view returns (bool);
    function getExpiry(
        bytes32 node
    ) external view returns (uint64);
    function isBurned(
        bytes32 node,
        uint96 fuses
    ) external view returns (bool);

    // ============ Wrapper Functions ============

    function wrap(
        bytes32 node,
        address owner,
        uint96 fuses,
        uint64 expiry
    ) external;

    function unwrap(
        bytes32 node,
        address owner
    ) external;

    function setFuses(
        bytes32 node,
        uint96 fuses
    ) external;

    function bindPassport(
        bytes32 node,
        bytes32 passportCommitment
    ) external;

    function unbindPassport(
        bytes32 node
    ) external;

    function authorizeAgent(
        bytes32 parentNode,
        bytes32 agentNode,
        address agentAddress,
        uint256 spendCapPerTx,
        uint64 expiry
    ) external;

    function revokeAgent(
        bytes32 parentNode,
        bytes32 agentNode
    ) external;
}
