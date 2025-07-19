// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../storage/HeliStorage.sol";

contract Booking is HeliStorage {
        function createBooking(address passenger, address pilot, uint256 price, bytes32 destination) internal returns (uint256) {

        uint256 rideId = rideCount++;
        rides[passenger][rideId] = Ride({
            passenger: passenger,
            pilot: pilot,
            price: price,
            destination: destination,
            status: RideStatus.Paid,
            passengerConfirmed: false,
            pilotConfirmed: false,
            createdAt: block.timestamp
        });
        return rideId;
    }

    function isPaidOrConfirmed(RideStatus status) internal pure returns (bool) {
        return status == RideStatus.Paid || status == RideStatus.PassengerConfirmed || status == RideStatus.DriverConfirmed;
    }

    function confirmBooking(address confirmer, address passenger, uint256 rideId) internal returns (bool) {
        Ride storage ride = rides[passenger][rideId];
        require(isPaidOrConfirmed(ride.status), "Ride not paid");
        require(confirmer == ride.passenger || confirmer == ride.pilot, "Invalid confirmer");

        if (confirmer == ride.passenger) {
            require(!ride.passengerConfirmed, "Passenger already confirmed");
            ride.passengerConfirmed = true;
            if (ride.pilotConfirmed) {
                ride.status = RideStatus.BothConfirmed;
            } else {
                ride.status = RideStatus.PassengerConfirmed;
            }
        } else if (confirmer == ride.pilot) {
            require(!ride.pilotConfirmed, "Pilot already confirmed");
            ride.pilotConfirmed = true;
            if (ride.passengerConfirmed) {
                ride.status = RideStatus.BothConfirmed;
            } else {
                ride.status = RideStatus.DriverConfirmed;
            }
        }

        return ride.status == RideStatus.BothConfirmed;
    }
}