// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {StringUtils} from "../utils/StringUtils.sol";
import {IPriceOracle} from "./IPriceOracle.sol";
import {Ownable} from "solady/auth/Ownable.sol";

/// @title StablePriceOracle
/// @notice Fixed-tier pricing for .kite domain registration (KITE-denominated)
contract StablePriceOracle is IPriceOracle, Ownable {
    using StringUtils for string;

    // ============ Errors ============

    error NameTooShort();

    // ============ State ============

    /// @notice Price tiers (per year, in wei = KITE with 18 decimals)
    uint256[5] public rentPrices;

    // ============ Constructor ============

    /// @param _rentPrices Array of 5 prices: [1char, 2char, 3char, 4char, 5+char]
    constructor(
        uint256[5] memory _rentPrices
    ) {
        _initializeOwner(msg.sender);
        rentPrices = _rentPrices;
    }

    // ============ IPriceOracle ============

    /// @inheritdoc IPriceOracle
    function price(
        string calldata name,
        uint256,
        /*expires*/
        uint256 duration
    ) external view virtual returns (Price memory) {
        uint256 len = name.strlen();
        uint256 basePrice = _yearlyPrice(len);

        // Pro-rate: basePrice * duration / 365.25 days
        uint256 total = (basePrice * duration) / 365.25 days;

        return Price({base: total, premium: 0});
    }

    // ============ Admin ============

    /// @notice Updates rent prices
    function setPrices(
        uint256[5] memory _rentPrices
    ) external onlyOwner {
        rentPrices = _rentPrices;
    }

    // ============ Internal ============

    function _yearlyPrice(
        uint256 len
    ) internal view returns (uint256) {
        if (len <= 0) revert NameTooShort();
        if (len <= 2) revert NameTooShort(); // 1-2 char reserved
        if (len == 3) return rentPrices[2];
        if (len == 4) return rentPrices[3];
        return rentPrices[4];
    }
}
