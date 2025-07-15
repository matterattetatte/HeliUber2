// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../storage/HeliStorage.sol";

contract Pilot is HeliStorage {
    struct PilotProfile {
        address pilotAddress;
        string name;
        string licenseNumber;
        uint256 rating;
        uint256 totalRides;
    }

    event PilotRegistered(address indexed pilot, string name, string licenseNumber);

    mapping(address => PilotProfile) private pilots;

    function registerPilot(
        string memory name,
        string memory licenseNumber
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(licenseNumber).length > 0, "License number cannot be empty");

        PilotProfile storage pilot = pilots[msg.sender];
        pilot.pilotAddress = msg.sender;
        pilot.name = name;
        pilot.licenseNumber = licenseNumber;
        pilot.rating = 0;
        pilot.totalRides = 0;

        emit PilotRegistered(msg.sender, name, licenseNumber);
    }

    function getPilotProfile(address pilot) public view returns (PilotProfile memory) {
        return pilots[pilot];
    }
}
