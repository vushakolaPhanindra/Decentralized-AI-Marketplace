import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import DatasetCard from '../components/DatasetCard';
import StatsCard from '../components/StatsCard';
import ChatBot from '../components/ChatBot';

export default function Dashboard({ account, provider }) {
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    datasetsOwned: 0,
    totalEarnings: 0,
    datasetsPurchased: 0,
    totalSpent: 0
  });
  const [ownedDatasets, setOwnedDatasets] = useState([]);
  const [purchasedDatasets, setPurchasedDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (provider && account) {
      loadDashboardData();
    }
  }, [provider, account]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      if (!contractAddress) {
        console.log('Contract address not set');
        setLoading(false);
        return;
      }

      const { ethers } = await import('ethers');
      const { AIDataMarketplaceABI } = await import('../contracts/contractABI');
      
      const contract = new ethers.Contract(contractAddress, AIDataMarketplaceABI, provider);
      
      // Load user's datasets and purchases
      const [userDatasetIds, userPurchaseIds] = await Promise.all([
        contract.getUserDatasets(account),
        contract.getUserPurchases(account)
      ]);
      
      // Load detailed dataset information
      const ownedDatasetsData = await Promise.all(
        userDatasetIds.map(id => contract.getDataset(id.toNumber()))
      );
      
      // Load purchased datasets
      const purchasedDatasetsData = [];
      for (const purchaseId of userPurchaseIds) {
        const purchase = await contract.getPurchase(purchaseId.toNumber());
        const dataset = await contract.getDataset(purchase.datasetId.toNumber());
        purchasedDatasetsData.push({
          ...dataset,
          purchaseId: purchaseId.toNumber(),
          purchaseTime: purchase.purchasedAt.toNumber(),
          accessToken: purchase.accessToken
        });
      }
      
      // Calculate user stats - Note: getDataset returns simplified structure
      const totalEarnings = 0; // Can't calculate without purchaseCount from full dataset
      
      const totalSpent = purchasedDatasetsData.reduce((total, dataset) => {
        return total + parseFloat(ethers.utils.formatEther(dataset.priceInAVAX));
      }, 0);
      
      setUserStats({
        datasetsOwned: ownedDatasetsData.length,
        totalEarnings: totalEarnings,
        datasetsPurchased: purchasedDatasetsData.length,
        totalSpent: totalSpent
      });
      
      setOwnedDatasets(ownedDatasetsData);
      setPurchasedDatasets(purchasedDatasetsData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your MetaMask wallet to view your dashboard.</p>
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p>Manage your AI datasets and training activities</p>
          <div className="user-info">
            <span className="user-address">
              {account.slice(0, 8)}...{account.slice(-6)}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stats-grid">
            <StatsCard
              title="Datasets Owned"
              value={userStats.datasetsOwned}
              icon="📊"
              loading={loading}
            />
            <StatsCard
              title="Total Earnings"
              value={`${userStats.totalEarnings.toFixed(4)} AVAX`}
              icon="💰"
              loading={loading}
            />
            <StatsCard
              title="Datasets Purchased"
              value={userStats.datasetsPurchased}
              icon="🛒"
              loading={loading}
            />
            <StatsCard
              title="Total Spent"
              value={`${userStats.totalSpent.toFixed(4)} AVAX`}
              icon="💸"
              loading={loading}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview
          </button>
          <button
            className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            📊 My Datasets ({userStats.datasetsOwned})
          </button>
          <button
            className={`tab ${activeTab === 'purchased' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchased')}
          >
            🛒 Purchased ({userStats.datasetsPurchased})
          </button>
          <button
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            📋 Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-cards">
                  <div className="action-card" onClick={() => router.push('/upload')}>
                    <span className="action-icon">📤</span>
                    <h4>Upload Dataset</h4>
                    <p>Share your data and start earning AVAX</p>
                  </div>
                  <div className="action-card" onClick={() => router.push('/marketplace')}>
                    <span className="action-icon">🛒</span>
                    <h4>Browse Marketplace</h4>
                    <p>Find datasets for your AI projects</p>
                  </div>
                  <div className="action-card">
                    <span className="action-icon">🎯</span>
                    <h4>Start Training</h4>
                    <p>Train AI models on your purchased data</p>
                  </div>
                  <div className="action-card">
                    <span className="action-icon">📊</span>
                    <h4>View Analytics</h4>
                    <p>Track your earnings and dataset performance</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {ownedDatasets.slice(0, 3).map(dataset => (
                    <div key={dataset.id} className="activity-item">
                      <span className="activity-icon">📊</span>
                      <div className="activity-content">
                        <p><strong>Dataset Uploaded:</strong> {dataset.name}</p>
                        <small>Purchased {dataset.purchaseCount.toString()} times</small>
                      </div>
                      <span className="activity-time">
                        {new Date(dataset.createdAt.toNumber() * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  
                  {purchasedDatasets.slice(0, 3).map(dataset => (
                    <div key={`purchase-${dataset.purchaseId}`} className="activity-item">
                      <span className="activity-icon">🛒</span>
                      <div className="activity-content">
                        <p><strong>Dataset Purchased:</strong> {dataset.name}</p>
                        <small>Ready for AI training</small>
                      </div>
                      <span className="activity-time">
                        {new Date(dataset.purchaseTime * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  
                  {ownedDatasets.length === 0 && purchasedDatasets.length === 0 && (
                    <div className="no-activity">
                      <p>No recent activity. Start by uploading a dataset or making a purchase!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'owned' && (
            <div className="owned-tab">
              <div className="tab-header">
                <h3>Your Datasets</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/upload')}
                >
                  📤 Upload New Dataset
                </button>
              </div>
              
              {loading ? (
                <div className="loading-grid">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="dataset-card loading">
                      <div className="loading-placeholder"></div>
                    </div>
                  ))}
                </div>
              ) : ownedDatasets.length > 0 ? (
                <div className="datasets-grid">
                  {ownedDatasets.map(dataset => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      isOwner={true}
                      showAnalytics={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <h4>No datasets uploaded yet</h4>
                  <p>Upload your first dataset to start earning AVAX!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/upload')}
                  >
                    📤 Upload Dataset
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchased' && (
            <div className="purchased-tab">
              <div className="tab-header">
                <h3>Purchased Datasets</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/marketplace')}
                >
                  🛒 Browse Marketplace
                </button>
              </div>
              
              {loading ? (
                <div className="loading-grid">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="dataset-card loading">
                      <div className="loading-placeholder"></div>
                    </div>
                  ))}
                </div>
              ) : purchasedDatasets.length > 0 ? (
                <div className="datasets-grid">
                  {purchasedDatasets.map(dataset => (
                    <div key={dataset.purchaseId} className="purchased-dataset-card">
                      <DatasetCard
                        dataset={dataset}
                        isPurchased={true}
                        showTraining={true}
                      />
                      <div className="purchase-info">
                        <div className="purchase-detail">
                          <span className="label">Purchased:</span>
                          <span className="value">
                            {new Date(dataset.purchaseTime * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="purchase-detail">
                          <span className="label">Access Token:</span>
                          <span className="value token">
                            {dataset.accessToken.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🛒</span>
                  <h4>No datasets purchased yet</h4>
                  <p>Browse the marketplace to find datasets for your AI projects!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/marketplace')}
                  >
                    🛒 Browse Marketplace
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <h3>Activity Log</h3>
              <div className="activity-timeline">
                {/* Upload activities */}
                {ownedDatasets.map(dataset => (
                  <div key={`upload-${dataset.id}`} className="timeline-item">
                    <div className="timeline-marker upload">📤</div>
                    <div className="timeline-content">
                      <h4>Dataset Uploaded</h4>
                      <p>"{dataset.name}" uploaded to the marketplace</p>
                      <div className="timeline-meta">
                        <span>Price: {ethers.utils.formatEther(dataset.priceInAVAX)} AVAX</span>
                        <span>Purchases: {dataset.purchaseCount.toString()}</span>
                        <span>{new Date(dataset.createdAt.toNumber() * 1000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Purchase activities */}
                {purchasedDatasets.map(dataset => (
                  <div key={`purchase-${dataset.purchaseId}`} className="timeline-item">
                    <div className="timeline-marker purchase">🛒</div>
                    <div className="timeline-content">
                      <h4>Dataset Purchased</h4>
                      <p>Purchased "{dataset.name}" for AI training</p>
                      <div className="timeline-meta">
                        <span>Cost: {ethers.utils.formatEther(dataset.priceInAVAX)} AVAX</span>
                        <span>Type: {dataset.dataType}</span>
                        <span>{new Date(dataset.purchaseTime * 1000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {ownedDatasets.length === 0 && purchasedDatasets.length === 0 && (
                  <div className="no-activity">
                    <span className="empty-icon">📋</span>
                    <h4>No activity yet</h4>
                    <p>Your marketplace activities will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatBot account={account} />
    </div>
  );
}
