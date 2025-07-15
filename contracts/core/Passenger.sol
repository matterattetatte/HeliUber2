// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

contract Passenger is HeliStorage {
    struct PassengerProfile {
        string name;
    }

    event PassengerRegistered(address indexed passenger, string name);

    mapping(address => PassengerProfile) private passengers;

    function registerPassenger(
        string memory name
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");

        PassengerProfile storage passenger = passengers[msg.sender];
        passenger.name = name;

        emit PassengerRegistered(msg.sender, name);
    }

    function getPassengerProfile(address pilot) public view returns (PassengerProfile memory) {
        return passengers[pilot];
    }
}
