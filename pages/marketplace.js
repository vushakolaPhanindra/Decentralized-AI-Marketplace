import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AIDataMarketplaceABI, CONTRACT_ADDRESS } from '../contracts/contractABI';
import DatasetCard from '../components/DatasetCard';
import FilterSidebar from '../components/FilterSidebar';
import ChatBot from '../components/ChatBot';
import TrainingSimulation from '../components/TrainingSimulation';

export default function Marketplace({ account, provider }) {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dataType: 'all',
    priceRange: [0, 10],
    sortBy: 'newest'
  });
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [purchasedDatasets, setPurchasedDatasets] = useState([]);

  useEffect(() => {
    if (provider) {
      loadDatasets();
      loadUserPurchases();
    }
  }, [provider]);

  useEffect(() => {
    applyFilters();
  }, [datasets, filters]);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIDataMarketplaceABI, provider);
      let datasetsData = await contract.getAllActiveDatasets();

      // Force all dataset prices to 0 for zero-fee
      datasetsData = datasetsData.map(ds => ({ ...ds, priceInAVAX: ethers.utils.parseEther("0") }));
      setDatasets(datasetsData);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPurchases = async () => {
    if (!account) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIDataMarketplaceABI, provider);
      const userPurchases = await contract.getUserPurchases(account);
      setPurchasedDatasets(userPurchases.map(id => id.toNumber()));
    } catch (error) {
      console.error('Error loading user purchases:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...datasets];

    if (filters.dataType !== 'all') {
      filtered = filtered.filter(dataset => dataset.dataType === filters.dataType);
    }

    filtered = filtered.filter(dataset => {
      const priceInAVAX = parseFloat(ethers.utils.formatEther(dataset.priceInAVAX));
      return priceInAVAX >= filters.priceRange[0] && priceInAVAX <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.priceInAVAX - b.priceInAVAX);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.priceInAVAX - a.priceInAVAX);
        break;
      case 'popular':
        filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
        break;
      default:
        break;
    }

    setFilteredDatasets(filtered);
  };

  const handlePurchase = async (dataset) => {
    if (!account || !provider) {
      alert('Please connect your wallet first');
      return;
    }

    if (dataset.owner.toLowerCase() === account.toLowerCase()) {
      alert('You cannot purchase your own dataset');
      return;
    }

    if (purchasedDatasets.includes(dataset.id.toNumber())) {
      alert('You already have access to this dataset');
      return;
    }

    try {
      setPurchasing(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIDataMarketplaceABI, signer);

      // 0 fee purchase
      const tx = await contract.purchaseDataset(dataset.id, { value: ethers.utils.parseEther("0") });
      await tx.wait();

      alert('Dataset purchased successfully (free of charge)!');
      loadUserPurchases();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase dataset: ' + error.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleDatasetSelect = (dataset) => setSelectedDataset(dataset);
  const handleCloseDataset = () => setSelectedDataset(null);
  const handleShowTraining = () => setShowTraining(true);
  const handleCloseTraining = () => setShowTraining(false);

  if (loading) {
    return (
      <div className="marketplace-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="page-header">
          <h1>🛒 AI Training Dataset Marketplace</h1>
          <p>Browse and access high-quality datasets for AI model training, completely free!</p>
        </div>

        <div className="marketplace-content">
          <FilterSidebar 
            filters={filters} 
            onFilterChange={setFilters}
            datasets={datasets}
          />

          <div className="datasets-grid">
            {filteredDatasets.length === 0 ? (
              <div className="no-datasets">
                <h3>No datasets found</h3>
                <p>Try adjusting your filters or check back later for new datasets.</p>
              </div>
            ) : (
              filteredDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id.toString()}
                  dataset={dataset}
                  onSelect={handleDatasetSelect}
                  onPurchase={handlePurchase}
                  isPurchased={purchasedDatasets.includes(dataset.id.toNumber())}
                  purchasing={purchasing}
                  account={account}
                />
              ))
            )}
          </div>
        </div>

        {selectedDataset && (
          <div className="dataset-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={handleCloseDataset}>×</button>
              <h2>{selectedDataset.name}</h2>
              <p className="description">{selectedDataset.description}</p>

              <div className="dataset-details">
                <div className="detail">
                  <span className="label">Data Type:</span>
                  <span className="value">{selectedDataset.dataType}</span>
                </div>
                <div className="detail">
                  <span className="label">Price:</span>
                  <span className="value">0 ETH</span>
                </div>
                <div className="detail">
                  <span className="label">File Size:</span>
                  <span className="value">{(selectedDataset.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="detail">
                  <span className="label">Purchase Count:</span>
                  <span className="value">{selectedDataset.purchaseCount.toString()}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePurchase(selectedDataset)}
                  disabled={purchasing || selectedDataset.owner.toLowerCase() === account?.toLowerCase()}
                >
                  {purchasing ? 'Processing...' : 'Get Dataset (Free)'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleShowTraining}
                >
                  🚀 Try AI Training
                </button>
              </div>
            </div>
          </div>
        )}

        {showTraining && (
          <TrainingSimulation 
            dataset={selectedDataset}
            onClose={handleCloseTraining}
          />
        )}

        <ChatBot />
      </div>
    </div>
  );
}
