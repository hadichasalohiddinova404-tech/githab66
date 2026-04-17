// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DrugSupplyRegistry {
    struct DrugBatch {
        string batchId;
        string drugName;
        string manufacturer;
        string currentOwner;
        uint256 expiryDate;
        bool exists;
    }

    mapping(string => DrugBatch) public batches;

    event BatchRegistered(string indexed batchId, string drugName, string manufacturer, uint256 expiryDate);
    event BatchTransferred(string indexed batchId, string currentOwner);

    function registerBatch(
        string calldata batchId,
        string calldata drugName,
        string calldata manufacturer,
        string calldata currentOwner,
        uint256 expiryDate
    ) external {
        batches[batchId] = DrugBatch(batchId, drugName, manufacturer, currentOwner, expiryDate, true);
        emit BatchRegistered(batchId, drugName, manufacturer, expiryDate);
    }

    function transferBatch(string calldata batchId, string calldata newOwner) external {
        batches[batchId].currentOwner = newOwner;
        emit BatchTransferred(batchId, newOwner);
    }

    function verifyBatch(string calldata batchId) external view returns (bool) {
        return batches[batchId].exists && batches[batchId].expiryDate > block.timestamp;
    }
}
