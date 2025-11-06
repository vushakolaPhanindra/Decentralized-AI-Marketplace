// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataMarketplace {
    struct Dataset {
        address owner;
        string ipfsHash;
        uint price;
        bool purchased;
    }

    mapping(uint => Dataset) public datasets;
    uint public datasetCount;

    event DatasetUploaded(uint id, string ipfsHash, uint price);
    event DatasetPurchased(uint id, address buyer);

    function uploadDataset(string memory _ipfsHash, uint _price) public {
        datasetCount++;
        datasets[datasetCount] = Dataset(msg.sender, _ipfsHash, _price, false);
        emit DatasetUploaded(datasetCount, _ipfsHash, _price);
    }

    function purchaseDataset(uint _id) public payable {
        Dataset storage dataset = datasets[_id];
        require(msg.value >= dataset.price, "Not enough payment");
        require(!dataset.purchased, "Already purchased");

        dataset.purchased = true;
        payable(dataset.owner).transfer(msg.value);

        emit DatasetPurchased(_id, msg.sender);
    }
}
