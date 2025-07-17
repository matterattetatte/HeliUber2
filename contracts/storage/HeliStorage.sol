// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HeliStorage {
    enum RideStatus { Pending, Paid, PassengerConfirmed, DriverConfirmed, BothConfirmed, Completed, Cancelled }

    struct Ride {
        address passenger;
        address pilot;
        uint256 price;
        bytes32 destination;
        RideStatus status;
        bool passengerConfirmed;
        bool pilotConfirmed;
        uint256 createdAt;
    }

    mapping(address => mapping(uint256 => Ride)) public rides;
    uint256 public rideCount;
    address public creator;

    constructor() {
        creator = msg.sender;
    }

    function getRides(address passenger) internal view returns (Ride[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < rideCount; i++) {
            if (rides[passenger][i].passenger != address(0)) {
                count++;
            }
        }

        Ride[] memory passengerRides = new Ride[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < rideCount; i++) {
            if (rides[passenger][i].passenger != address(0)) {
                passengerRides[index] = rides[passenger][i];
                index++;
            }
        }

        return passengerRides;
    }
}