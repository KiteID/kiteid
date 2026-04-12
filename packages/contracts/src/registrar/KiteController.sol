// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {IKiteBaseRegistrar} from "../interfaces/IKiteBaseRegistrar.sol";
import {IKiteRegistry} from "../interfaces/IKiteRegistry.sol";
import {StringUtils} from "../utils/StringUtils.sol";
import {IPriceOracle} from "./IPriceOracle.sol";

/// @title KiteController
/// @notice UUPS upgradeable controller for .kite name registration with commit-reveal
/// @dev ERC-7201 namespaced storage pattern
contract KiteController is OwnableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using StringUtils for string;

    // ============ Errors ============

    error CommitmentTooNew(bytes32 commitment);
    error CommitmentTooOld(bytes32 commitment);
    error CommitmentNotFound(bytes32 commitment);
    error NameNotAvailable(string name);
    error NameNotValid(string name);
    error DurationTooShort(uint256 duration);
    error DurationTooLong(uint256 duration);
    error InsufficientValue(uint256 required, uint256 provided);
    error NameReserved(string name);
    error ResolverRequired();

    // ============ Events ============

    event NameRegistered(
        string name, bytes32 indexed label, address indexed owner, uint256 baseCost, uint256 premium, uint256 expires
    );
    event NameRenewed(string name, bytes32 indexed label, uint256 cost, uint256 expires);
    event CommitmentSubmitted(bytes32 indexed commitment);

    // ============ Constants ============

    uint256 public constant MIN_COMMITMENT_AGE = 60;
    uint256 public constant MAX_COMMITMENT_AGE = 24 hours;
    uint256 public constant MIN_REGISTRATION_DURATION = 28 days;
    uint256 public constant MAX_REGISTRATION_DURATION = 3652.5 days;

    // ============ ERC-7201 Storage ============

    /// @custom:storage-location erc7201:kiteid.controller.storage
    struct ControllerStorage {
        IKiteBaseRegistrar registrar;
        IPriceOracle priceOracle;
        IKiteRegistry registry;
        address reverseRegistrar;
        mapping(bytes32 => uint256) commitments;
        mapping(string => bool) reservedNames;
    }

    // keccak256(abi.encode(uint256(keccak256("kiteid.controller.storage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant STORAGE_LOCATION = 0x4b1d0d7c3b0d4d7c3b0d4d7c3b0d4d7c3b0d4d7c3b0d4d7c3b0d4d7c3b0d4d00;

    function _getStorage() private pure returns (ControllerStorage storage $) {
        assembly {
            $.slot := STORAGE_LOCATION
        }
    }

    // ============ Initializer ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IKiteBaseRegistrar _registrar,
        IPriceOracle _priceOracle,
        IKiteRegistry _registry,
        address _reverseRegistrar,
        address _owner
    ) external initializer {
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        ControllerStorage storage $ = _getStorage();
        $.registrar = _registrar;
        $.priceOracle = _priceOracle;
        $.registry = _registry;
        $.reverseRegistrar = _reverseRegistrar;
    }

    // ============ Commit-Reveal Registration ============

    /// @notice Generate a commitment hash for registration
    function makeCommitment(
        string calldata name,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord
    ) external pure returns (bytes32) {
        return _makeCommitment(name, owner, duration, secret, resolver, data, reverseRecord);
    }

    /// @notice Submit a commitment
    function commit(
        bytes32 commitment
    ) external {
        ControllerStorage storage $ = _getStorage();
        require($.commitments[commitment] == 0 || $.commitments[commitment] + MAX_COMMITMENT_AGE < block.timestamp);
        $.commitments[commitment] = block.timestamp;
        emit CommitmentSubmitted(commitment);
    }

    /// @notice Register a name after commitment period
    function register(
        string calldata name,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord
    ) external payable nonReentrant {
        _validateRegistration(name, duration);

        // Validate commitment
        bytes32 commitment = _makeCommitment(name, owner, duration, secret, resolver, data, reverseRecord);
        _consumeCommitment(commitment);

        // Execute registration
        (uint256 expires, uint256 totalPrice) = _executeRegistration(name, owner, duration, resolver, data);

        // Set reverse record if requested
        if (reverseRecord) _setReverseRecord(name, owner);

        emit NameRegistered(name, keccak256(bytes(name)), owner, totalPrice, 0, expires);

        // Refund excess
        _refundExcess(totalPrice);
    }

    /// @notice Renew a name
    function renew(
        string calldata name,
        uint256 duration
    ) external payable nonReentrant {
        ControllerStorage storage $ = _getStorage();

        if (duration < MIN_REGISTRATION_DURATION) revert DurationTooShort(duration);

        uint256 tokenId = uint256(keccak256(bytes(name)));
        uint256 expires = $.registrar.nameExpires(tokenId);

        IPriceOracle.Price memory priceData = $.priceOracle.price(name, expires, duration);
        uint256 totalPrice = priceData.base + priceData.premium;
        if (msg.value < totalPrice) revert InsufficientValue(totalPrice, msg.value);

        uint256 newExpires = $.registrar.renew(tokenId, duration);

        emit NameRenewed(name, keccak256(bytes(name)), totalPrice, newExpires);

        // Refund excess
        if (msg.value > totalPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(success, "KiteController: refund failed");
        }
    }

    // ============ Views ============

    /// @notice Get the rent price for a name
    function rentPrice(
        string calldata name,
        uint256 duration
    ) external view returns (IPriceOracle.Price memory) {
        ControllerStorage storage $ = _getStorage();
        return $.priceOracle.price(name, 0, duration);
    }

    /// @notice Check if a name is available
    function available(
        string calldata name
    ) external view returns (bool) {
        ControllerStorage storage $ = _getStorage();
        if (!name.isValidName()) return false;
        if (name.strlen() <= 2) return false;
        if ($.reservedNames[name]) return false;
        uint256 tokenId = uint256(keccak256(bytes(name)));
        return $.registrar.available(tokenId);
    }

    /// @notice Get commitment timestamp
    function commitments(
        bytes32 commitment
    ) external view returns (uint256) {
        ControllerStorage storage $ = _getStorage();
        return $.commitments[commitment];
    }

    // ============ Admin ============

    /// @notice Withdraw collected fees
    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "KiteController: withdraw failed");
    }

    /// @notice Update the price oracle
    function setPriceOracle(
        IPriceOracle _priceOracle
    ) external onlyOwner {
        ControllerStorage storage $ = _getStorage();
        $.priceOracle = _priceOracle;
    }

    /// @notice Reserve or unreserve a name
    function setReservedName(
        string calldata name,
        bool reserved
    ) external onlyOwner {
        ControllerStorage storage $ = _getStorage();
        $.reservedNames[name] = reserved;
    }

    /// @notice Check if a name is reserved
    function isReserved(
        string calldata name
    ) external view returns (bool) {
        ControllerStorage storage $ = _getStorage();
        return $.reservedNames[name];
    }

    // ============ UUPS ============

    function _authorizeUpgrade(
        address
    ) internal override onlyOwner {}

    // ============ Internal ============

    function _makeCommitment(
        string calldata name,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(name, owner, duration, secret, resolver, data, reverseRecord));
    }

    function _validateRegistration(
        string calldata name,
        uint256 duration
    ) internal view {
        ControllerStorage storage $ = _getStorage();
        if (!name.isValidName()) revert NameNotValid(name);
        if (name.strlen() <= 2) revert NameNotValid(name);
        if ($.reservedNames[name]) revert NameReserved(name);
        if (duration < MIN_REGISTRATION_DURATION) revert DurationTooShort(duration);
        if (duration > MAX_REGISTRATION_DURATION) revert DurationTooLong(duration);
    }

    function _executeRegistration(
        string calldata name,
        address owner,
        uint256 duration,
        address resolver,
        bytes[] calldata data
    ) internal returns (uint256 expires, uint256 totalPrice) {
        ControllerStorage storage $ = _getStorage();

        uint256 tokenId = uint256(keccak256(bytes(name)));
        if (!$.registrar.available(tokenId)) revert NameNotAvailable(name);

        IPriceOracle.Price memory priceData = $.priceOracle.price(name, 0, duration);
        totalPrice = priceData.base + priceData.premium;
        if (msg.value < totalPrice) revert InsufficientValue(totalPrice, msg.value);

        // Register — registrar gives registry node ownership to this controller
        expires = $.registrar.register(tokenId, owner, duration);

        bytes32 node = StringUtils.namehash(name);

        // Set resolver if provided (we own the node at this point)
        if (resolver != address(0)) {
            $.registry.setResolver(node, resolver);
            if (data.length > 0) _setRecords(resolver, node, data);
        }

        // Transfer registry node ownership to the actual owner
        $.registry.setOwner(node, owner);
    }

    function _refundExcess(
        uint256 totalPrice
    ) internal {
        if (msg.value > totalPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(success, "KiteController: refund failed");
        }
    }

    function _consumeCommitment(
        bytes32 commitment
    ) internal {
        ControllerStorage storage $ = _getStorage();
        uint256 committedAt = $.commitments[commitment];
        if (committedAt == 0) revert CommitmentNotFound(commitment);
        if (block.timestamp < committedAt + MIN_COMMITMENT_AGE) revert CommitmentTooNew(commitment);
        if (block.timestamp > committedAt + MAX_COMMITMENT_AGE) revert CommitmentTooOld(commitment);
        delete $.commitments[commitment];
    }

    function _setRecords(
        address resolver,
        bytes32 node,
        bytes[] calldata data
    ) internal {
        for (uint256 i; i < data.length; i++) {
            (bool success,) = resolver.call(data[i]);
            require(success, "KiteController: resolver call failed");
        }
    }

    function _setReverseRecord(
        string calldata name,
        address owner
    ) internal {
        ControllerStorage storage $ = _getStorage();
        if ($.reverseRegistrar != address(0)) {
            (bool success,) = $.reverseRegistrar
                .call(abi.encodeWithSignature("setNameForAddr(address,string)", owner, string.concat(name, ".kite")));
            success; // silence unused variable warning
        }
    }
}
