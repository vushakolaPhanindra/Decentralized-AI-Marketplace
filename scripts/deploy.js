const hre = require("hardhat");

async function main() {
  console.log("Deploying AI Data Marketplace to", hre.network.name);
  
  // Deploy the contract
  const AIDataMarketplace = await hre.ethers.getContractFactory("AIDataMarketplace");
  console.log("Deploying contract...");
  
  const marketplace = await AIDataMarketplace.deploy();
  await marketplace.deployed();

  console.log("✅ AI Data Marketplace deployed to:", marketplace.address);
  console.log("🔗 Network:", hre.network.name);
  console.log("⛽ Gas used for deployment:", (await marketplace.deployTransaction.wait()).gasUsed.toString());
  
  // Verify the contract on Avalanche testnet
  if (hre.network.name === "avalancheFuji") {
    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on SnowTrace");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: marketplace.address,
    deploymentTime: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return marketplace.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
