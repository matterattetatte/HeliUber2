// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

contract Payment is HeliStorage {
    // Passenger pays ETH for the ride
    function processPayment(address passenger, uint256 rideId) internal {
        Ride storage ride = rides[passenger][rideId];
        require(ride.status == RideStatus.Pending, "Invalid status");
        ride.status = RideStatus.Paid;
    }

   function releasePayment(address passenger, uint256 rideId) internal {
        Ride storage ride = rides[passenger][rideId];
        require(ride.status == RideStatus.BothConfirmed, "Not both confirmed");

        uint256 pilotAmount = ride.price * 99 / 100;

        ride.status = RideStatus.Completed;

        (bool sent, ) = payable(ride.pilot).call{ value: pilotAmount }("");
        require(sent, "Failed to send to pilot");
    }
}
