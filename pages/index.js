import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import ChatBot from '../components/ChatBot';
import DatasetCard from '../components/DatasetCard';
import StatsCard from '../components/StatsCard';

/**
 * Home Page Component
 * Displays hero section, stats, featured datasets, how it works, use cases, and chatbot
 */
export default function Home({ account, provider }) {
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalPurchases: 0,
    totalActiveDatasets: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load contract data whenever provider changes
  useEffect(() => {
    if (provider) {
      loadData();
    }
  }, [provider]);

  /**
   * Load contract data: datasets and stats
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // ✅ contract address
      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
        ' 0x5FbDB2315678afecb367f032d93F642f64180aa3';

      if (!contractAddress) {
        console.log('❌ Contract address not set. Deploy the contract first.');
        setLoading(false);
        return;
      }

      const { AIDataMarketplaceABI } = await import(
        '../contracts/contractABI'
      );

      // ✅ create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        AIDataMarketplaceABI,
        provider
      );

      let datasetsData = [];
      let statsData = [0, 0, 0];

      // Load datasets safely
      try {
        datasetsData = await contract.getAllActiveDatasets();
      } catch (err) {
        console.warn('⚠️ Could not fetch datasets:', err.message);
      }

      // Load stats safely
      try {
        statsData = await contract.getContractStats();
      } catch (err) {
        console.warn('⚠️ Could not fetch stats:', err.message);
      }

      // ✅ update state with safe fallbacks
      setDatasets(datasetsData?.slice(0, 6) || []);
      setStats({
        totalDatasets: statsData[0]?.toNumber?.() || 0,
        totalPurchases: statsData[1]?.toNumber?.() || 0,
        totalActiveDatasets: statsData[2]?.toNumber?.() || 0,
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* ======================== HERO SECTION ======================== */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Privacy-First AI Training Marketplace</h1>
            <p className="hero-subtitle">
              Upload encrypted datasets, enable federated learning, and earn AVAX
              while preserving privacy. HIPAA & GDPR compliant.
            </p>

            <div className="hero-actions">
              <Link href="/upload" className="btn btn-primary">
                📤 Upload Dataset
              </Link>
              <Link href="/marketplace" className="btn btn-secondary">
                🛒 Browse Marketplace
              </Link>
            </div>

            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>End-to-End Encryption</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤝</span>
                <span>Federated Learning</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💰</span>
                <span>Automatic Payments</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Avalanche Network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== STATS SECTION ======================== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <StatsCard
              title="Total Datasets"
              value={stats.totalDatasets}
              icon="📊"
              loading={loading}
            />
            <StatsCard
              title="Total Purchases"
              value={stats.totalPurchases}
              icon="🛒"
              loading={loading}
            />
            <StatsCard
              title="Active Datasets"
              value={stats.totalActiveDatasets}
              icon="✅"
              loading={loading}
            />
            <StatsCard
              title="Success Rate"
              value="95%"
              icon="🎯"
              loading={false}
            />
          </div>
        </div>
      </section>

      {/* ======================== FEATURED DATASETS ======================== */}
      <section className="featured-datasets">
        <div className="container">
          <div className="section-header">
            <h2>Featured Datasets</h2>
            <Link href="/marketplace" className="view-all-link">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="dataset-card loading">
                  <div className="loading-placeholder"></div>
                </div>
              ))}
            </div>
          ) : datasets.length > 0 ? (
            <div className="datasets-grid">
              {datasets.map((dataset, i) => (
                <DatasetCard
                  key={dataset.id?.toString?.() || i}
                  dataset={dataset}
                  showPreview={true}
                />
              ))}
            </div>
          ) : (
            <p className="no-datasets-msg">No active datasets available.</p>
          )}
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Data</h3>
              <p>
                Upload your encrypted dataset to IPFS and register metadata on
                Avalanche
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Training</h3>
              <p>
                AI developers purchase access and train models using federated
                learning
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Paid</h3>
              <p>
                Receive automatic AVAX payments when your data contributes to
                model training
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track Results</h3>
              <p>
                Monitor training progress and model performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== USE CASES ======================== */}
      <section className="use-cases">
        <div className="container">
          <h2>Use Cases</h2>
          <div className="use-cases-grid">
            <div className="use-case">
              <span className="use-case-icon">🏥</span>
              <h3>Healthcare</h3>
              <p>
                Train medical AI models on encrypted patient data while
                maintaining HIPAA compliance
              </p>
            </div>
            <div className="use-case">
              <span className="use-case-icon">🏦</span>
              <h3>Finance</h3>
              <p>
                Develop fraud detection models using privacy-preserving financial
                transaction data
              </p>
            </div>
            <div className="use-case">
              <span className="use-case-icon">🛍️</span>
              <h3>Retail</h3>
              <p>
                Create recommendation systems from customer behavior data without
                exposing identities
              </p>
            </div>
            <div className="use-case">
              <span className="use-case-icon">🔬</span>
              <h3>Research</h3>
              <p>
                Collaborate on research datasets while preserving participant
                privacy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CHATBOT ======================== */}
      <ChatBot account={account} />
    </div>
  );
}
