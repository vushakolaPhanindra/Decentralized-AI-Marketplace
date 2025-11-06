const { ethers } = require("hardhat");

async function main() {
  console.log("Adding test data to AI Data Marketplace...");

  // Get the deployed contract
  const AIDataMarketplace = await ethers.getContractFactory("AIDataMarketplace");
  const contract = await AIDataMarketplace.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();

  console.log("Adding test datasets...");

  // Add test dataset 1
  const tx1 = await contract.connect(user1).uploadDataset(
    "QmTestCID123456789",
    "Medical Imaging Dataset",
    "Medical imaging data for AI training",
    "Medical",
    ethers.utils.parseEther("0.1"),
    1024
  );
  await tx1.wait();
  console.log("✅ Added Medical Imaging Dataset");

  // Add test dataset 2
  const tx2 = await contract.connect(user2).uploadDataset(
    "QmTestCID987654321",
    "Financial Market Data",
    "Historical financial data for trading algorithms",
    "Finance",
    ethers.utils.parseEther("0.05"),
    2048
  );
  await tx2.wait();
  console.log("✅ Added Financial Market Data");

  // Add test dataset 3
  const tx3 = await contract.connect(user1).uploadDataset(
    "QmTestCID456789123",
    "Natural Language Processing Corpus",
    "Large text corpus for NLP model training",
    "NLP",
    ethers.utils.parseEther("0.2"),
    4096
  );
  await tx3.wait();
  console.log("✅ Added NLP Corpus");

  console.log("🎉 Test data added successfully!");
  console.log("📊 Contract now has 3 test datasets");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
