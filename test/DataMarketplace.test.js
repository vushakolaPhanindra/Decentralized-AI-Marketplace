const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIDataMarketplace", function () {
  let AIDataMarketplace;
  let marketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AIDataMarketplace = await ethers.getContractFactory("AIDataMarketplace");
    marketplace = await AIDataMarketplace.deploy();
    await marketplace.deployed();
  });

  describe("Dataset Upload", function () {
    it("Should allow users to upload datasets", async function () {
      const ipfsCID = "QmTestHash123";
      const name = "Test Dataset";
      const description = "A test dataset for AI training";
      const dataType = "medical";
      const priceInAVAX = 0; // Zero price
      const fileSize = 1024 * 1024;

      const tx = await marketplace.connect(addr1).uploadDataset(
        ipfsCID, name, description, dataType, priceInAVAX, fileSize
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'DatasetUploaded');

      expect(event.args.datasetId.toNumber()).to.equal(1);
      expect(event.args.owner).to.equal(addr1.address);
      expect(event.args.ipfsCID).to.equal(ipfsCID);
      expect(event.args.name).to.equal(name);
      expect(event.args.priceInAVAX.toString()).to.equal(priceInAVAX.toString());

      const dataset = await marketplace.getDataset(1);
      expect(dataset.owner).to.equal(addr1.address);
      expect(dataset.ipfsCID).to.equal(ipfsCID);
      expect(dataset.name).to.equal(name);
      expect(dataset.description).to.equal(description);
      expect(dataset.dataType).to.equal(dataType);
      expect(dataset.priceInAVAX.toString()).to.equal(priceInAVAX.toString());
      expect(dataset.fileSize.toNumber()).to.equal(fileSize);
      expect(dataset.isActive).to.equal(true);
      expect(dataset.purchaseCount.toNumber()).to.equal(0);
    });

    it("Should increment dataset counter", async function () {
      const initialStats = await marketplace.getContractStats();
      expect(initialStats.totalDatasets.toNumber()).to.equal(0);

      await marketplace.connect(addr1).uploadDataset(
        "QmTest1", "Dataset 1", "Description 1", "medical", 0, 1024
      );
      await marketplace.connect(addr2).uploadDataset(
        "QmTest2", "Dataset 2", "Description 2", "financial", 0, 2048
      );

      const finalStats = await marketplace.getContractStats();
      expect(finalStats.totalDatasets.toNumber()).to.equal(2);
      expect(finalStats.totalActiveDatasets.toNumber()).to.equal(2);
    });

    it("Should add dataset to user's datasets array", async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTest1", "Dataset 1", "Description 1", "medical", 0, 1024
      );

      const userDatasets = await marketplace.getUserDatasets(addr1.address);
      expect(userDatasets.length).to.equal(1);
      expect(userDatasets[0].toNumber()).to.equal(1);
    });
  });

  describe("Dataset Purchase", function () {
    beforeEach(async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTestHash", "Test Dataset", "Test Description", "medical", 0, 1024
      );
    });

    it("Should allow purchase for free datasets", async function () {
      const price = 0; 
      const platformFee = 0; 
      const ownerAmount = 0; 

      const initialOwnerBalance = await addr1.getBalance();
      const initialContractOwnerBalance = await owner.getBalance();

      const tx = await marketplace.connect(addr2).purchaseDataset(1, { value: price });
      const receipt = await tx.wait();

      const purchaseEvent = receipt.events.find(e => e.event === 'DatasetPurchased');
      expect(purchaseEvent.args.datasetId.toNumber()).to.equal(1);
      expect(purchaseEvent.args.buyer).to.equal(addr2.address);
      expect(purchaseEvent.args.priceInAVAX.toString()).to.equal(price.toString());

      const paymentEvent = receipt.events.find(e => e.event === 'PaymentDistributed');
      expect(paymentEvent.args.datasetOwner).to.equal(addr1.address);
      expect(paymentEvent.args.ownerAmount.toString()).to.equal(ownerAmount.toString());
      expect(paymentEvent.args.platformFee.toString()).to.equal(platformFee.toString());

      const hasAccess = await marketplace.checkAccess(1, addr2.address);
      expect(hasAccess).to.equal(true);

      const dataset = await marketplace.getDataset(1);
      expect(dataset.purchaseCount.toNumber()).to.equal(1);

      const userPurchases = await marketplace.getUserPurchases(addr2.address);
      expect(userPurchases.length).to.equal(1);
    });

    it("Should fail when user already has access", async function () {
      const price = 0;
      await marketplace.connect(addr2).purchaseDataset(1, { value: price });
      try {
        await marketplace.connect(addr2).purchaseDataset(1, { value: price });
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Already purchased this dataset");
      }
    });

    it("Should fail when trying to purchase own dataset", async function () {
      const price = 0;
      try {
        await marketplace.connect(addr1).purchaseDataset(1, { value: price });
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Cannot purchase your own dataset");
      }
    });

    it("Should fail for inactive dataset", async function () {
      await marketplace.connect(addr1).deactivateDataset(1);
      const price = 0;
      try {
        await marketplace.connect(addr2).purchaseDataset(1, { value: price });
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Dataset is not active");
      }
    });
  });

  describe("Access Control", function () {
    it("Should correctly check access for dataset owners", async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTestHash", "Test Dataset", "Test Description", "medical", 0, 1024
      );

      const hasAccess = await marketplace.checkAccess(1, addr1.address);
      expect(hasAccess).to.equal(true);
    });

    it("Should correctly check access for purchasers", async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTestHash", "Test Dataset", "Test Description", "medical", 0, 1024
      );

      let hasAccess = await marketplace.checkAccess(1, addr2.address);
      expect(hasAccess).to.equal(false);

      await marketplace.connect(addr2).purchaseDataset(1, { value: 0 });
      hasAccess = await marketplace.checkAccess(1, addr2.address);
      expect(hasAccess).to.equal(true);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await marketplace.updatePlatformFee(10);
      expect((await marketplace.platformFeePercent()).toNumber()).to.equal(10);
    });

    it("Should reject platform fee above maximum", async function () {
      try {
        await marketplace.updatePlatformFee(25);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Platform fee cannot exceed 20%");
      }
    });

    it("Should only allow owner to update platform fee", async function () {
      try {
        await marketplace.connect(addr1).updatePlatformFee(10);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Only owner can call this function");
      }
    });
  });

  describe("Dataset Management", function () {
    it("Should allow dataset owner to deactivate dataset", async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTestHash", "Test Dataset", "Test Description", "medical", 0, 1024
      );

      await marketplace.connect(addr1).deactivateDataset(1);
      const dataset = await marketplace.getDataset(1);
      expect(dataset.isActive).to.equal(false);
    });

    it("Should only allow dataset owner to deactivate", async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTestHash", "Test Dataset", "Test Description", "medical", 0, 1024
      );

      try {
        await marketplace.connect(addr2).deactivateDataset(1);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Not the dataset owner");
      }
    });
  });

  describe("Marketplace Views", function () {
    beforeEach(async function () {
      await marketplace.connect(addr1).uploadDataset(
        "QmTest1", "Dataset 1", "Medical data", "medical", 0, 1024
      );
      await marketplace.connect(addr1).uploadDataset(
        "QmTest2", "Dataset 2", "Financial data", "financial", 0, 2048
      );
      await marketplace.connect(addr2).uploadDataset(
        "QmTest3", "Dataset 3", "IoT data", "iot", 0, 4096
      );

      await marketplace.connect(addr1).deactivateDataset(2);
    });

    it("Should return all active datasets", async function () {
      const activeDatasets = await marketplace.getAllActiveDatasets();
      expect(activeDatasets.length).to.equal(2);
      expect(activeDatasets[0].name).to.equal("Dataset 1");
      expect(activeDatasets[1].name).to.equal("Dataset 3");
    });

    it("Should return correct contract stats", async function () {
      const stats = await marketplace.getContractStats();
      expect(stats.totalDatasets.toNumber()).to.equal(3);
      expect(stats.totalActiveDatasets.toNumber()).to.equal(2);
      expect(stats.totalPurchases.toNumber()).to.equal(0);
    });
  });
});
