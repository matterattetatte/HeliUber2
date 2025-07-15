// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

import "hardhat/console.sol";

contract Booking is HeliStorage {
        function createBooking(address passenger, address pilot, uint256 price, bytes32 destination) internal returns (uint256) {
        uint256 rideId = rideCount++;
        rides[passenger][rideId] = Ride({
            passenger: passenger,
            pilot: pilot,
            price: price,
            destination: destination,
            status: RideStatus.Pending,
            passengerConfirmed: false,
            pilotConfirmed: false
        });
        return rideId;
    }

    function confirmBooking(uint256 rideId, address confirmer) internal {
        Ride storage ride = rides[confirmer][rideId];
        require(ride.status == RideStatus.Paid, "Ride not paid");
        require(confirmer == ride.passenger || confirmer == ride.pilot, "Invalid confirmer");

        if (confirmer == ride.passenger) {
            require(!ride.passengerConfirmed, "Passenger already confirmed");
            ride.passengerConfirmed = true;
            ride.status = RideStatus.PassengerConfirmed;
        } else if (confirmer == ride.pilot) {
            require(!ride.pilotConfirmed, "Pilot already confirmed");
            ride.pilotConfirmed = true;
            if (ride.passengerConfirmed) {
                ride.status = RideStatus.BothConfirmed;
            }
        }
    }

    function isBothConfirmed(address passenger, uint256 rideId) internal view returns (bool) {
        Ride storage ride = rides[passenger][rideId];
        return ride.passengerConfirmed && ride.pilotConfirmed;
    }
}