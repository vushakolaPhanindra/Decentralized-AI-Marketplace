import { useState } from 'react';

export default function DatasetCard({ 
  dataset, 
  onPurchase, 
  onStartTraining,
  isPurchased = false,
  isOwner = false,
  purchasing = false,
  showPreview = false 
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!dataset) return null;

  const { ethers } = require('ethers');
  const priceInAVAX = ethers.utils.formatEther(dataset.priceInAVAX || '0');
  const fileSizeMB = dataset.fileSize ? (dataset.fileSize / 1024 / 1024).toFixed(2) : '0';
  const createdDate = dataset.createdAt ? new Date(dataset.createdAt * 1000).toLocaleDateString() : 'Unknown';

  const getDataTypeInfo = (dataType) => {
    const types = {
      medical: { icon: '🏥', color: '#e74c3c', label: 'Medical' },
      financial: { icon: '🏦', color: '#f39c12', label: 'Financial' },
      behavioral: { icon: '🛍️', color: '#9b59b6', label: 'Behavioral' },
      iot: { icon: '📡', color: '#3498db', label: 'IoT/Sensors' },
      research: { icon: '🔬', color: '#2ecc71', label: 'Research' },
      other: { icon: '📊', color: '#95a5a6', label: 'Other' }
    };
    return types[dataType] || types.other;
  };

  const typeInfo = getDataTypeInfo(dataset.dataType);

  const handlePurchase = () => {
    if (onPurchase && !isPurchased && !isOwner) {
      onPurchase(dataset);
    }
  };

  const handleStartTraining = () => {
    if (onStartTraining && (isPurchased || isOwner)) {
      onStartTraining(dataset);
    }
  };

  return (
    <div className={`dataset-card ${isPurchased ? 'purchased' : ''} ${isOwner ? 'owned' : ''}`}>
      {/* Card Header */}
      <div className="card-header">
        <div className="dataset-type" style={{ backgroundColor: typeInfo.color }}>
          <span className="type-icon">{typeInfo.icon}</span>
          <span className="type-label">{typeInfo.label}</span>
        </div>
        
        {isOwner && <span className="owner-badge">Your Dataset</span>}
        {isPurchased && !isOwner && <span className="purchased-badge">✅ Purchased</span>}
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="dataset-title">{dataset.name}</h3>
        
        <p className="dataset-description">
          {showDetails || showPreview 
            ? dataset.description 
            : `${dataset.description?.substring(0, 100)}${dataset.description?.length > 100 ? '...' : ''}`
          }
        </p>

        {showDetails && (
          <div className="dataset-details">
            <div className="detail-row">
              <span className="detail-label">IPFS Hash:</span>
              <span className="detail-value ipfs-hash">
                {dataset.ipfsCID?.substring(0, 20)}...
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">File Size:</span>
              <span className="detail-value">{fileSizeMB} MB</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{createdDate}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Owner:</span>
              <span className="detail-value address">
                {dataset.owner?.substring(0, 8)}...{dataset.owner?.substring(-6)}
              </span>
            </div>
          </div>
        )}

        {/* Dataset Stats */}
        <div className="dataset-stats">
          <div className="stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{priceInAVAX} AVAX</span>
            <span className="stat-label">Price</span>
          </div>
          <div className="stat">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{dataset.purchaseCount?.toString() || '0'}</span>
            <span className="stat-label">Purchases</span>
          </div>
          <div className="stat">
            <span className="stat-icon">📁</span>
            <span className="stat-value">{fileSizeMB}</span>
            <span className="stat-label">MB</span>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="privacy-features">
          <span className="feature-badge">🔒 Encrypted</span>
          <span className="feature-badge">🤝 Federated Learning</span>
          <span className="feature-badge">📋 Compliant</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <button
          className="btn btn-secondary btn-small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Less Details' : 'More Details'}
        </button>

        {!showPreview && (
          <>
            {isOwner ? (
              <div className="owner-actions">
                <button className="btn btn-primary btn-small">
                  📊 View Analytics
                </button>
                <button 
                  className="btn btn-success btn-small"
                  onClick={handleStartTraining}
                >
                  🎯 Test Training
                </button>
              </div>
            ) : isPurchased ? (
              <div className="purchased-actions">
                <button 
                  className="btn btn-success btn-small"
                  onClick={handleStartTraining}
                >
                  🚀 Start Training
                </button>
                <button className="btn btn-secondary btn-small">
                  📥 Download
                </button>
              </div>
            ) : (
              <button
                className={`btn btn-primary ${purchasing ? 'loading' : ''}`}
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <>
                    <span className="spinner"></span>
                    Purchasing...
                  </>
                ) : (
                  <>
                    🛒 Purchase for {priceInAVAX} AVAX
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Quality Indicators */}
      <div className="quality-indicators">
        {dataset.purchaseCount > 10 && (
          <span className="quality-badge popular">🔥 Popular</span>
        )}
        {parseFloat(priceInAVAX) < 0.5 && (
          <span className="quality-badge affordable">💡 Affordable</span>
        )}
        {dataset.fileSize > 50 * 1024 * 1024 && (
          <span className="quality-badge large">📈 Large Dataset</span>
        )}
      </div>
    </div>
  );
}
