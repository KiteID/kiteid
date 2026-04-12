// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IPriceOracle
/// @notice Price oracle interface for name registration pricing
interface IPriceOracle {
    struct Price {
        uint256 base;
        uint256 premium;
    }

    /// @notice Returns the price to register or renew a name
    /// @param name The name being registered/renewed
    /// @param expires Current expiry timestamp (0 for new registrations)
    /// @param duration Duration in seconds
    /// @return price The base price and premium
    function price(
        string calldata name,
        uint256 expires,
        uint256 duration
    ) external view returns (Price memory price);
}
