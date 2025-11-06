// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIDataMarketplace {
    
    struct Dataset {
        uint256 id;
        address owner;
        string ipfsCID;
        string name;
        string description;
        string dataType;
        uint256 priceInAVAX;
        uint256 fileSize;
        bool isActive;
        uint256 purchaseCount;
        uint256 createdAt;
    }
    
    struct Purchase {
        uint256 datasetId;
        address buyer;
        uint256 purchaseTime;
        string accessToken;
    }
    
    uint256 public datasetCounter;
    uint256 public purchaseCounter;
    uint256 public platformFeePercent = 5;
    address public owner;
    
    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => Purchase) public purchases;
    mapping(address => uint256[]) public userDatasets;
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    
    event DatasetUploaded(
        uint256 indexed datasetId,
        address indexed owner,
        string ipfsCID,
        string name,
        uint256 priceInAVAX
    );
    
    event DatasetPurchased(
        uint256 indexed datasetId,
        address indexed buyer,
        uint256 purchaseId,
        uint256 priceInAVAX
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyDatasetOwner(uint256 _datasetId) {
        require(datasets[_datasetId].owner == msg.sender, "Not the dataset owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function uploadDataset(
        string memory _ipfsCID,
        string memory _name,
        string memory _description,
        string memory _dataType,
        uint256 _priceInAVAX,
        uint256 _fileSize
    ) external returns (uint256) {
        require(bytes(_ipfsCID).length > 0, "IPFS CID cannot be empty");
        require(bytes(_name).length > 0, "Dataset name cannot be empty");
        require(_priceInAVAX > 0, "Price must be greater than 0");
        
        datasetCounter++;
        uint256 newDatasetId = datasetCounter;
        
        datasets[newDatasetId] = Dataset({
            id: newDatasetId,
            owner: msg.sender,
            ipfsCID: _ipfsCID,
            name: _name,
            description: _description,
            dataType: _dataType,
            priceInAVAX: _priceInAVAX,
            fileSize: _fileSize,
            isActive: true,
            purchaseCount: 0,
            createdAt: block.timestamp
        });
        
        userDatasets[msg.sender].push(newDatasetId);
        
        emit DatasetUploaded(newDatasetId, msg.sender, _ipfsCID, _name, _priceInAVAX);
        
        return newDatasetId;
    }
    
    function purchaseDataset(uint256 _datasetId) external payable returns (uint256) {
        require(_datasetId > 0 && _datasetId <= datasetCounter, "Invalid dataset ID");
        require(datasets[_datasetId].isActive, "Dataset is not active");
        require(msg.value >= datasets[_datasetId].priceInAVAX, "Insufficient AVAX sent");
        require(datasets[_datasetId].owner != msg.sender, "Cannot purchase your own dataset");
        require(!hasAccess[_datasetId][msg.sender], "Already purchased this dataset");
        
        Dataset storage dataset = datasets[_datasetId];
        
        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 ownerAmount = msg.value - platformFee;
        
        dataset.purchaseCount++;
        hasAccess[_datasetId][msg.sender] = true;
        
        purchaseCounter++;
        purchases[purchaseCounter] = Purchase({
            datasetId: _datasetId,
            buyer: msg.sender,
            purchaseTime: block.timestamp,
            accessToken: string(abi.encodePacked("access_", _datasetId, "_", uint256(uint160(msg.sender)), "_", block.timestamp))
        });
        
        userPurchases[msg.sender].push(purchaseCounter);
        
        payable(dataset.owner).transfer(ownerAmount);
        payable(owner).transfer(platformFee);
        
        emit DatasetPurchased(_datasetId, msg.sender, purchaseCounter, msg.value);
        
        return purchaseCounter;
    }
    
    function getDataset(uint256 _datasetId) external view returns (Dataset memory) {
        require(_datasetId > 0 && _datasetId <= datasetCounter, "Invalid dataset ID");
        return datasets[_datasetId];
    }
    
    function getPurchase(uint256 _purchaseId) external view returns (Purchase memory) {
        require(_purchaseId > 0 && _purchaseId <= purchaseCounter, "Invalid purchase ID");
        return purchases[_purchaseId];
    }
    
    function checkAccess(uint256 _datasetId, address _user) external view returns (bool) {
        return hasAccess[_datasetId][_user] || datasets[_datasetId].owner == _user;
    }
    
    function getUserDatasets(address _user) external view returns (uint256[] memory) {
        return userDatasets[_user];
    }
    
    function getUserPurchases(address _user) external view returns (uint256[] memory) {
        return userPurchases[_user];
    }
    
    function getAllActiveDatasets() external view returns (Dataset[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= datasetCounter; i++) {
            if (datasets[i].isActive) {
                activeCount++;
            }
        }
        
        Dataset[] memory activeDatasets = new Dataset[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= datasetCounter; i++) {
            if (datasets[i].isActive) {
                activeDatasets[currentIndex] = datasets[i];
                currentIndex++;
            }
        }
        
        return activeDatasets;
    }
    
    function deactivateDataset(uint256 _datasetId) external onlyDatasetOwner(_datasetId) {
        datasets[_datasetId].isActive = false;
    }
    
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 20, "Platform fee cannot exceed 20%");
        platformFeePercent = _newFeePercent;
    }
    
    function getContractStats() external view returns (
        uint256 totalDatasets,
        uint256 totalPurchases,
        uint256 totalActiveDatasets
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= datasetCounter; i++) {
            if (datasets[i].isActive) {
                activeCount++;
            }
        }
        
        return (datasetCounter, purchaseCounter, activeCount);
    }
}
