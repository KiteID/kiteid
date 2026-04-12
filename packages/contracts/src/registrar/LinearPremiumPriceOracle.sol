// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {StringUtils} from "../utils/StringUtils.sol";
import {IPriceOracle} from "./IPriceOracle.sol";
import {StablePriceOracle} from "./StablePriceOracle.sol";

/// @title LinearPremiumPriceOracle
/// @notice Extends StablePriceOracle with exponential decay Dutch auction premium
/// @dev Premium activates when a name expires and becomes available after grace period
contract LinearPremiumPriceOracle is StablePriceOracle {
    using StringUtils for string;

    // ============ State ============

    /// @notice Starting premium in wei (KITE)
    uint256 public immutable startPremium;

    /// @notice Duration of the premium decay period (14 days)
    uint256 public constant PREMIUM_DECAY_DURATION = 14 days;

    // ============ Constructor ============

    /// @param _rentPrices Array of 5 prices for tiers
    /// @param _startPremium Initial premium amount at start of auction
    constructor(
        uint256[5] memory _rentPrices,
        uint256 _startPremium
    ) StablePriceOracle(_rentPrices) {
        startPremium = _startPremium;
    }

    // ============ IPriceOracle Override ============

    /// @inheritdoc IPriceOracle
    function price(
        string calldata name,
        uint256 expires,
        uint256 duration
    ) external view override returns (Price memory) {
        uint256 len = name.strlen();
        uint256 basePrice = _yearlyPrice(len);
        uint256 total = (basePrice * duration) / 365.25 days;

        uint256 premium;
        if (expires != 0) premium = _premium(expires);

        return Price({base: total, premium: premium});
    }

    // ============ Public Views ============

    /// @notice Calculate current premium for a name that expired at `expires`
    /// @param expires Timestamp when the name expired
    /// @return The current premium (0 if decay period is over)
    function premium(
        uint256 expires
    ) external view returns (uint256) {
        return _premium(expires);
    }

    // ============ Internal ============

    function _premium(
        uint256 expires
    ) internal view returns (uint256) {
        // Premium starts after grace period ends
        uint256 gracePeriod = 90 days;
        uint256 auctionStart = expires + gracePeriod;

        if (block.timestamp < auctionStart) return startPremium;

        uint256 elapsed = block.timestamp - auctionStart;
        if (elapsed >= PREMIUM_DECAY_DURATION) return 0;

        // Exponential decay: startPremium * (1 - elapsed/duration)^2
        // Using quadratic decay for simplicity (approximates exponential)
        uint256 remaining = PREMIUM_DECAY_DURATION - elapsed;
        return (startPremium * remaining * remaining) / (PREMIUM_DECAY_DURATION * PREMIUM_DECAY_DURATION);
    }
}
