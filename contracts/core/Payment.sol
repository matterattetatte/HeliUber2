// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

import "hardhat/console.sol";

contract Payment is HeliStorage {
    // Passenger pays ETH for the ride
    function processPayment(address passenger, uint256 rideId) internal {
        Ride storage ride = rides[passenger][rideId];
        require(ride.status == RideStatus.Pending, "Invalid status");
        ride.status = RideStatus.Paid;
    }

    // Release payment to pilot and creator after both confirm
    function releasePayment(address passenger, uint256 rideId) internal {
        Ride storage ride = rides[passenger][rideId];
        require(ride.status == RideStatus.BothConfirmed, "Not both confirmed");

        uint256 creatorFee = ride.price / 100; // 1% fee
        uint256 pilotAmount = ride.price - creatorFee;

        // Transfer to creator
        (bool sentToCreator, ) = payable(creator).call{value: creatorFee}("");
        require(sentToCreator, "Failed to send to creator");

        // Transfer to pilot
        (bool sentToPilot, ) = payable(ride.pilot).call{value: pilotAmount}("");
        require(sentToPilot, "Failed to send to pilot");

        ride.status = RideStatus.Completed;
    }
}
