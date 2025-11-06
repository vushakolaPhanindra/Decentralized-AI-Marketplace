const { ethers } = require("hardhat");

async function testContract() {
  console.log("🧪 Testing Contract Interaction...");
  
  try {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    console.log("✅ Signers loaded");
    
    // Get contract factory
    const AIDataMarketplace = await ethers.getContractFactory("AIDataMarketplace");
    console.log("✅ Contract factory loaded");
    
    // Deploy contract
    const marketplace = await AIDataMarketplace.deploy();
    await marketplace.deployed();
    console.log("✅ Contract deployed to:", marketplace.address);
    
    // Test uploadDataset
    console.log("\n📤 Testing uploadDataset...");
    const uploadTx = await marketplace.connect(user1).uploadDataset(
      "QmTest123",
      "Test Dataset",
      "A test dataset for testing",
      "medical",
      ethers.utils.parseEther("0.1"),
      1024
    );
    await uploadTx.wait();
    console.log("✅ Dataset uploaded successfully");
    
    // Test getAllActiveDatasets
    console.log("\n📋 Testing getAllActiveDatasets...");
    const datasets = await marketplace.getAllActiveDatasets();
    console.log("✅ Active datasets:", datasets.length);
    console.log("Dataset details:", {
      id: datasets[0].id.toString(),
      name: datasets[0].name,
      price: ethers.utils.formatEther(datasets[0].priceInAVAX),
      owner: datasets[0].owner
    });
    
    // Test getContractStats
    console.log("\n📊 Testing getContractStats...");
    const stats = await marketplace.getContractStats();
    console.log("✅ Contract stats:", {
      totalDatasets: stats.totalDatasets.toString(),
      totalPurchases: stats.totalPurchases.toString(),
      totalActiveDatasets: stats.totalActiveDatasets.toString()
    });
    
    console.log("\n🎉 All tests passed! Contract is working correctly.");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

