// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentRegistry {
    struct Consent {
        string patientId;
        string doctorId;
        string scope;
        uint256 expiry;
        bool active;
    }

    mapping(bytes32 => Consent) public consents;

    event AccessGranted(bytes32 indexed consentId, string patientId, string doctorId, string scope, uint256 expiry);
    event AccessRevoked(bytes32 indexed consentId);

    function grantAccess(
        bytes32 consentId,
        string calldata patientId,
        string calldata doctorId,
        string calldata scope,
        uint256 expiry
    ) external {
        consents[consentId] = Consent(patientId, doctorId, scope, expiry, true);
        emit AccessGranted(consentId, patientId, doctorId, scope, expiry);
    }

    function revokeAccess(bytes32 consentId) external {
        consents[consentId].active = false;
        emit AccessRevoked(consentId);
    }

    function hasAccess(bytes32 consentId) external view returns (bool) {
        Consent memory consent = consents[consentId];
        return consent.active && consent.expiry > block.timestamp;
    }
}
