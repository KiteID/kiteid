// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IKiteBaseRegistrar} from "../interfaces/IKiteBaseRegistrar.sol";
import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {ERC721} from "solady/tokens/ERC721.sol";

/// @title KiteBaseRegistrar
/// @notice ERC-721 registrar with name expiry management for .kite domains
/// @dev Uses Solady ERC721 for gas efficiency. Immutable contract.
contract KiteBaseRegistrar is ERC721, Ownable, IKiteBaseRegistrar {
    // ============ Errors ============

    error NameNotAvailable(uint256 id);
    error NameExpired(uint256 id);
    error CallerNotController();
    error DurationTooShort();
    error InvalidOwner();

    // ============ State ============

    IKiteRegistry public immutable registry;
    bytes32 public immutable baseNode;

    uint256 public constant GRACE_PERIOD = 90 days;

    mapping(uint256 => uint256) private _expiries;
    mapping(address => bool) public controllers;

    // ============ Modifiers ============

    modifier onlyController() {
        if (!controllers[msg.sender]) revert CallerNotController();
        _;
    }

    modifier live(
        uint256 id
    ) {
        if (_expiries[id] + GRACE_PERIOD < block.timestamp) revert NameExpired(id);
        _;
    }

    // ============ Constructor ============

    /// @param _registry The KiteRegistry contract
    /// @param _baseNode The namehash of the base node (e.g., namehash("kite"))
    constructor(
        IKiteRegistry _registry,
        bytes32 _baseNode
    ) {
        _initializeOwner(msg.sender);
        registry = _registry;
        baseNode = _baseNode;
    }

    // ============ ERC-721 Metadata ============

    function name() public pure override returns (string memory) {
        return "KiteID";
    }

    function symbol() public pure override returns (string memory) {
        return "KITE";
    }

    function tokenURI(
        uint256
    ) public pure override returns (string memory) {
        return "";
    }

    // ============ Controller Management ============

    /// @inheritdoc IKiteBaseRegistrar
    function addController(
        address controller
    ) external onlyOwner {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    /// @inheritdoc IKiteBaseRegistrar
    function removeController(
        address controller
    ) external onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    // ============ Registration ============

    /// @inheritdoc IKiteBaseRegistrar
    function register(
        uint256 id,
        address owner_,
        uint256 duration
    ) external onlyController returns (uint256) {
        if (owner_ == address(0)) revert InvalidOwner();
        if (!_available(id)) revert NameNotAvailable(id);
        if (duration < 28 days) revert DurationTooShort();

        uint256 expires = block.timestamp + duration;
        _expiries[id] = expires;

        // Mint or reclaim the token
        if (_exists(id)) _burn(id);
        _mint(owner_, id);

        // Set ownership in registry to the controller first (so it can set resolver)
        // The controller will then transfer ownership to the actual owner
        registry.setSubnodeOwner(baseNode, bytes32(id), msg.sender);

        emit NameRegistered(id, owner_, expires);
        return expires;
    }

    /// @inheritdoc IKiteBaseRegistrar
    function renew(
        uint256 id,
        uint256 duration
    ) external onlyController returns (uint256) {
        if (duration < 28 days) revert DurationTooShort();
        uint256 currentExpiry = _expiries[id];

        // Can renew if name exists and hasn't passed grace period
        if (currentExpiry + GRACE_PERIOD < block.timestamp) revert NameExpired(id);
        if (currentExpiry == 0) revert NameNotAvailable(id);

        uint256 newExpiry;
        if (currentExpiry > block.timestamp) newExpiry = currentExpiry + duration;
        else newExpiry = block.timestamp + duration;

        _expiries[id] = newExpiry;
        emit NameRenewed(id, newExpiry);
        return newExpiry;
    }

    /// @inheritdoc IKiteBaseRegistrar
    function reclaim(
        uint256 id,
        address owner_
    ) external live(id) {
        address tokenOwner = ownerOf(id);
        require(
            tokenOwner == msg.sender || isApprovedForAll(tokenOwner, msg.sender) || getApproved(id) == msg.sender,
            "KiteBaseRegistrar: not token owner"
        );
        registry.setSubnodeOwner(baseNode, bytes32(id), owner_);
    }

    // ============ Views ============

    /// @inheritdoc IKiteBaseRegistrar
    function nameExpires(
        uint256 id
    ) external view returns (uint256) {
        return _expiries[id];
    }

    /// @inheritdoc IKiteBaseRegistrar
    function available(
        uint256 id
    ) external view returns (bool) {
        return _available(id);
    }

    // ============ Transfer Override ============

    /// @dev Prevents transfers of expired names (past grace period)
    function _beforeTokenTransfer(
        address from,
        address,
        uint256 id
    ) internal virtual override {
        // Allow minting always
        if (from == address(0)) return;
        // For transfers, ensure name hasn't expired past grace period
        if (_expiries[id] != 0 && _expiries[id] + GRACE_PERIOD < block.timestamp) revert NameExpired(id);
    }

    /// @dev Override transferFrom to include expiry check
    function transferFrom(
        address from,
        address to,
        uint256 id
    ) public payable override {
        _beforeTokenTransfer(from, to, id);
        super.transferFrom(from, to, id);
    }

    // ============ Internal ============

    function _available(
        uint256 id
    ) internal view returns (bool) {
        // Never registered = available
        if (_expiries[id] == 0) return true;
        // Expired + grace period passed = available
        return _expiries[id] + GRACE_PERIOD < block.timestamp;
    }
}
