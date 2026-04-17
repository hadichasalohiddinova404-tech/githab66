// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditTrailRegistry {
    struct AccessEvent {
        string userId;
        string patientId;
        string resourceType;
        string action;
        bytes32 metadataHash;
        uint256 createdAt;
    }

    AccessEvent[] public eventsLog;

    event AccessLogged(uint256 indexed index, string indexed userId, string indexed patientId, string action);

    function logAccess(
        string calldata userId,
        string calldata patientId,
        string calldata resourceType,
        string calldata action,
        bytes32 metadataHash
    ) external {
        eventsLog.push(AccessEvent(userId, patientId, resourceType, action, metadataHash, block.timestamp));
        emit AccessLogged(eventsLog.length - 1, userId, patientId, action);
    }
}
