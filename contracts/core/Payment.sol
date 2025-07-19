// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../storage/HeliStorage.sol";
import "../mock/PLNC.sol";

contract Payment is HeliStorage {
    function releasePayment(address passenger, uint256 rideId, PLNC plnc) internal {
        Ride storage ride = rides[passenger][rideId];
        require(ride.status == RideStatus.BothConfirmed, "Not both confirmed");

        uint256 pilotAmount = ride.price * 99 / 100;

        bool sent = plnc.transfer(ride.pilot, pilotAmount);
        require(sent, "Failed to send tokens to pilot");

        ride.status = RideStatus.Completed;
    }
}
