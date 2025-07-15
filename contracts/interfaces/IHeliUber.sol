// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IHeliUber {
    event RideBooked(uint256 indexed rideId, address passenger, address pilot, uint256 price);
    event RideConfirmed(uint256 indexed rideId, address confirmer);
    event RideCompleted(uint256 indexed rideId);

    function bookRide(address pilot, uint256 price, bytes32 destination) external payable;
    function confirmRide(address passenger, uint256 rideId) external;
}