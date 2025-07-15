// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;


import './Booking.sol';
import "./Payment.sol";
import "../interfaces/IHeliUber.sol";

contract HeliUber is IHeliUber, Booking, Payment {

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => mapping(uint256 => Order)) public orders;
    mapping(address => uint256) public orderCount;

    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint256 quantity);

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

    function confirmRide(uint256 rideId) external override {
        confirmBooking(rideId, msg.sender);
        emit RideConfirmed(rideId, msg.sender);
    }
}
