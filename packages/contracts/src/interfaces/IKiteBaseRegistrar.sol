// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IKiteBaseRegistrar
/// @notice ERC-721 registrar interface with name expiry management
interface IKiteBaseRegistrar {
    // Events
    event NameRegistered(uint256 indexed id, address indexed owner, uint256 expires);
    event NameRenewed(uint256 indexed id, uint256 expires);
    event ControllerAdded(address indexed controller);
    event ControllerRemoved(address indexed controller);

    // Mutators
    function register(
        uint256 id,
        address owner,
        uint256 duration
    ) external returns (uint256);
    function renew(
        uint256 id,
        uint256 duration
    ) external returns (uint256);
    function reclaim(
        uint256 id,
        address owner
    ) external;
    function addController(
        address controller
    ) external;
    function removeController(
        address controller
    ) external;

    // Views
    function nameExpires(
        uint256 id
    ) external view returns (uint256);
    function available(
        uint256 id
    ) external view returns (bool);
    function controllers(
        address addr
    ) external view returns (bool);

    // Constants
    function GRACE_PERIOD() external view returns (uint256);
}
