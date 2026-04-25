// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title IMulticallable
/// @notice Interface for batching multiple resolver calls
interface IMulticallable {
    /// @notice Execute multiple resolver calls in a single transaction
    /// @param data Array of encoded function calls
    /// @return results Array of return data from each call
    function multicall(
        bytes[] calldata data
    ) external returns (bytes[] memory results);
}
