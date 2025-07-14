// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

contract Payment is HeliStorage {

    constructor(address _creator) {
        creator = _creator;
    }

    // Passenger pays ETH for the ride
    function processPayment(address fromAddress, uint256 rideId, uint256 price) external payable {
        Ride storage ride = rides[rideId];
        require(ride.passenger == fromAddress, "Invalid passenger");
        require(ride.status == RideStatus.Pending, "Invalid status");
        require(msg.value == price, "Incorrect ETH amount");
        ride.status = RideStatus.Paid;
    }

    // Release payment to pilot and creator after both confirm
    function releasePayment(uint256 rideId) external {
        Ride storage ride = rides[rideId];
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
