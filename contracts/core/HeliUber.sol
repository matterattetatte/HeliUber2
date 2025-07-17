// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import './Booking.sol';
import "./Payment.sol";
import "./Pilot.sol";
import "./Passenger.sol";
import "../interfaces/IHeliUber.sol";


contract HeliUber is IHeliUber, Booking, Payment, Pilot, Passenger {
    function bookRide(
        address pilot,
        uint256 price,
        bytes32 destination
    ) external payable {
        uint256 rideId = createBooking(
            msg.sender,
            pilot,
            price,
            destination
        );
        processPayment(msg.sender, rideId);
        emit RideBooked(rideId, msg.sender, pilot, price);
    }

    function getRidesForPassenger(address passenger) external view returns (Booking.Ride[] memory) {
        Booking.Ride[] memory rides = getRides(passenger);

        return rides;   
    }

    function confirmRide(address passenger, uint256 rideId) external {
        bool isBothConfirmed = confirmBooking(msg.sender, passenger, rideId);
        emit RideConfirmed(rideId, msg.sender);

        if (isBothConfirmed) {
            releasePayment(passenger, rideId);
            emit RideCompleted(rideId);
        }
    }
}
