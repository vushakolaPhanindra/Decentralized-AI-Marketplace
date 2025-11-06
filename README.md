# Decentralized AI Marketplace

A decentralized marketplace for buying and selling AI datasets using blockchain technology and IPFS for secure, censorship-resistant storage. Built with Solidity, Hardhat, Ethers.js, and Next.js/React, it empowers researchers and organizations to share and monetize datasets transparently.

---

## ✨ Features

- **Smart Contracts**: On-chain management of dataset listings and purchases  
- **IPFS Integration**: Decentralized storage of datasets with immutable references  
- **Web3 Frontend**: Next.js + React interface with MetaMask wallet support  
- **Secure Transactions**: Escrow-style payments with automatic distribution to dataset owners  
- **Privacy & Ownership**: Data providers retain full control while monetizing securely  

---

## 🔒 Smart Contract Capabilities

- Upload datasets with an **IPFS hash** and a **price in ETH**  
- Purchase datasets with **ETH** (or native token of EVM network)  
- Prevent **double-purchasing** by the same buyer  
- Emit **events** for seamless frontend interaction  
- Automatic payment transfer to dataset owners  

---

## ✅ Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)  
- npm or yarn  
- [MetaMask](https://metamask.io/) or another Web3 wallet  
- Access to a blockchain network (Hardhat local node, Ethereum testnet, or Avalanche Fuji)  

---

## ⚙️ Installation
# Clone the repository
git clone https://github.com/Bhumika611/BrutalSparks.git
cd BrutalSparks

# Install dependencies
npm install
Compile Smart Contracts
npm run compile

Run Tests
npm run test

Deploy to Local Network
# Terminal 1: Start Hardhat local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy

Start Development Server
npm run dev

# Smart Contract Functions
uploadDataset(string _ipfsHash, uint256 _price)

Upload a dataset with an associated IPFS hash and price.

_ipfsHash: IPFS content identifier (CID)

_price: Price in wei

purchaseDataset(uint256 _id) (payable)

Purchase a dataset by its ID.

_id: Dataset ID

Must send the exact price in ETH

# Testing

The project includes tests for:

Dataset uploads

Successful purchases with correct payment

Handling insufficient payment

Preventing double purchases

Run tests with:

npm run test

# Security Considerations

Always verify IPFS hashes before purchasing

Use wallets with test funds for development

Ensure error handling and input validation in contracts

Test thoroughly on testnets before deploying to mainnet

Consider gas optimization and reentrancy protection

