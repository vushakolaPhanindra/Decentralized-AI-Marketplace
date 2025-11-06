import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IPFSUpload from '../components/IPFSUpload';
import ChatBot from '../components/ChatBot';

export default function Upload({ account, provider }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataType: 'medical',
    priceInAVAX: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Upload to IPFS, 3: Register on blockchain
  const fileInputRef = useRef();

  const dataTypes = [
    { value: 'medical', label: 'Medical / Healthcare', icon: '🏥' },
    { value: 'financial', label: 'Financial', icon: '🏦' },
    { value: 'behavioral', label: 'Behavioral / Customer', icon: '🛍️' },
    { value: 'iot', label: 'IoT / Sensor Data', icon: '📡' },
    { value: 'research', label: 'Research / Academic', icon: '🔬' },
    { value: 'other', label: 'Other', icon: '📊' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleIPFSUpload = async () => {
    if (!formData.file) {
      alert('Please select a file first');
      return;
    }

    if (!formData.name || !formData.description || !formData.priceInAVAX) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setStep(2);

    try {
      // Create form data for IPFS upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('metadata', JSON.stringify({
        name: formData.name,
        description: formData.description,
        dataType: formData.dataType,
        uploadTime: new Date().toISOString(),
        fileSize: formData.file.size,
        fileName: formData.file.name
      }));

      console.log('Starting IPFS upload...');
      
      // Upload to IPFS (using local API or Pinata/Infura)
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('IPFS upload successful:', result);
        setIpfsHash(result.ipfsHash);
        setStep(3);
        await registerOnBlockchain(result.ipfsHash);
      } else {
        throw new Error(result.error || 'Failed to upload to IPFS');
      }
      
    } catch (error) {
      console.error('IPFS upload error:', error);
      alert('Failed to upload to IPFS: ' + error.message);
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  const registerOnBlockchain = async (ipfsCID) => {
    try {
      if (!provider || !account) {
        throw new Error('Please connect your wallet first');
      }

      const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Updated contract address from deployment
      if (!contractAddress) {
        throw new Error('Contract not deployed. Please deploy the contract first.');
      }

      const { ethers } = await import('ethers');
      const { AIDataMarketplaceABI } = await import('../contracts/contractABI');

      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, AIDataMarketplaceABI, signer);

      // Convert price to wei (AVAX has 18 decimals)
      const priceInWei = ethers.utils.parseEther(formData.priceInAVAX);

      console.log('Registering dataset on blockchain...');
      const tx = await contract.uploadDataset(
        ipfsCID,
        formData.name,
        formData.description,
        formData.dataType,
        priceInWei,
        formData.file.size
      );

      console.log('Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Success! Redirect to marketplace or show success message
      alert('Dataset uploaded successfully! Transaction: ' + tx.hash);
      router.push('/marketplace');

    } catch (error) {
      console.error('Blockchain registration error:', error);
      alert('Failed to register on blockchain: ' + error.message);
      setStep(1);
    }
  };

  if (!account) {
    return (
      <div className="upload-page">
        <div className="container">
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your MetaMask wallet to upload datasets.</p>
            <button className="btn btn-primary">Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-header">
          <h1>📤 Upload Dataset</h1>
          <p>Share your data securely and earn AVAX when AI models train on it.</p>
        </div>

        {/* Progress Indicator */}
        <div className="upload-progress">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Dataset Info</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Upload to IPFS</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Register on Blockchain</span>
          </div>
        </div>

        {step === 1 && (
          <div className="upload-form">
            <div className="form-section">
              <h3>Dataset Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Dataset Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Anonymized Chest X-Ray Dataset"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your dataset, its features, and potential use cases..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataType">Data Type *</label>
                <select
                  id="dataType"
                  name="dataType"
                  value={formData.dataType}
                  onChange={handleInputChange}
                  required
                >
                  {dataTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priceInAVAX">Price per Access (AVAX) *</label>
                <input
                  type="number"
                  id="priceInAVAX"
                  name="priceInAVAX"
                  value={formData.priceInAVAX}
                  onChange={handleInputChange}
                  placeholder="0.1"
                  step="0.01"
                  min="0.01"
                  required
                />
                <small>Minimum: 0.01 AVAX</small>
              </div>

              <div className="form-group">
                <label htmlFor="file">Dataset File *</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.json,.parquet,.xlsx"
                    required
                  />
                  <div className="file-upload-content">
                    {formData.file ? (
                      <div className="file-selected">
                        <span className="file-icon">📄</span>
                        <div className="file-info">
                          <span className="file-name">{formData.file.name}</span>
                          <span className="file-size">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="file-prompt">
                        <span className="upload-icon">☁️</span>
                        <p>Click to select file or drag and drop</p>
                        <small>Supported: CSV, JSON, Parquet, Excel (Max 100MB)</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="privacy-notice">
                <h4>🔒 Privacy & Security</h4>
                <ul>
                  <li>Your data will be encrypted before upload to IPFS</li>
                  <li>Only metadata is stored on the blockchain</li>
                  <li>Buyers get access tokens, not direct file access</li>
                  <li>You maintain full control over your data</li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleIPFSUpload}
                  disabled={!formData.name || !formData.description || !formData.priceInAVAX || !formData.file || uploading}
                  className="btn btn-primary"
                >
                  {uploading ? '⏳ Processing...' : '🚀 Upload Dataset'}
                </button>
                {uploading && (
                  <p className="upload-status-text">
                    Please wait while we upload your dataset to IPFS...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="upload-status">
            <div className="status-card">
              <div className="status-icon loading">☁️</div>
              <h3>Uploading to IPFS...</h3>
              <p>Your dataset is being encrypted and uploaded to the decentralized storage network.</p>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <div className="upload-steps">
                <div className="step-item">
                  <span className="step-icon">🔒</span>
                  <span>Encrypting data...</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">📤</span>
                  <span>Uploading to IPFS...</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">🔗</span>
                  <span>Generating content hash...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="upload-status">
            <div className="status-card">
              <div className="status-icon">🔗</div>
              <h3>Registering on Blockchain...</h3>
              <p>Creating your dataset entry on Avalanche network.</p>
              <div className="ipfs-info">
                <p><strong>IPFS Hash:</strong> {ipfsHash}</p>
                <p>Please confirm the transaction in your wallet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="upload-tips">
          <h3>💡 Upload Tips</h3>
          <div className="tips-grid">
            <div className="tip">
              <h4>🎯 Quality Data</h4>
              <p>Clean, well-structured data gets more purchases and higher prices.</p>
            </div>
            <div className="tip">
              <h4>📝 Clear Description</h4>
              <p>Detailed descriptions help AI developers understand your data's value.</p>
            </div>
            <div className="tip">
              <h4>🏷️ Fair Pricing</h4>
              <p>Research similar datasets to set competitive prices.</p>
            </div>
            <div className="tip">
              <h4>🔒 Privacy First</h4>
              <p>Remove all personally identifiable information before upload.</p>
            </div>
          </div>
        </div>
      </div>

      <ChatBot account={account} />
    </div>
  );
}
