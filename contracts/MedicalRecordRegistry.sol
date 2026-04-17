// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecordRegistry {
    struct RecordProof {
        string patientId;
        string recordId;
        string category;
        bytes32 recordHash;
        address createdBy;
        uint256 createdAt;
    }

    mapping(string => RecordProof) public records;

    event RecordHashStored(string indexed recordId, string indexed patientId, bytes32 recordHash, string category);

    function addRecordHash(
        string calldata patientId,
        string calldata recordId,
        bytes32 recordHash,
        string calldata category
    ) external {
        records[recordId] = RecordProof(patientId, recordId, category, recordHash, msg.sender, block.timestamp);
        emit RecordHashStored(recordId, patientId, recordHash, category);
    }

    function verifyRecordHash(string calldata recordId, bytes32 candidateHash) external view returns (bool) {
        return records[recordId].recordHash == candidateHash;
    }
}
