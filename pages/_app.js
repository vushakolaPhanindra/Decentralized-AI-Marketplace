import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        initializeWeb3();
      } else {
        console.log('🦊 MetaMask not detected. Please install the extension.');
      }
    }
  }, []);

  const initializeWeb3 = async () => {
    try {
      console.log('🔌 Initializing Web3 connection...');

      // Request MetaMask access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Account access granted');

      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();

      console.log('📱 Connected account:', account);
      console.log('🌐 Current network:', await provider.getNetwork());

      setProvider(provider);
      setAccount(account);

      // Decide network: Core for production, Hardhat local for dev
      if (process.env.NODE_ENV === 'production') {
        console.log('🚀 Switching to Core Mainnet...');
        await switchToCore();
      } else {
        console.log('🏠 Switching to Hardhat Local...');
        await switchToHardhat();
      }

      console.log('✅ Web3 initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize Web3:', error);
    }
  };

  /** --------------------------
   * 🔀 Switch to Hardhat Local
   * -------------------------- */
  const switchToHardhat = async () => {
    try {
      console.log('🔄 Switching to Hardhat (ChainId 31337)...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337
      });
      console.log('✅ Switched to Hardhat Local');
    } catch (switchError) {
      console.log('⚠️ Failed to switch, adding Hardhat...', switchError);
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539',
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: [],
              },
            ],
          });
          console.log('✅ Hardhat Local added successfully');
        } catch (addError) {
          console.error('❌ Failed to add Hardhat Local:', addError);
        }
      }
    }
  };

  /** --------------------------
   * 🔀 Switch to Core Mainnet
   * -------------------------- */
  const switchToCore = async () => {
    try {
      console.log('🔄 Switching to Core Mainnet (1116)...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x45C' }], // Core 1116
      });
      console.log('✅ Switched to Core Mainnet');
    } catch (switchError) {
      console.log('⚠️ Failed to switch, adding Core...', switchError);
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x45C',
                chainName: 'Core Mainnet',
                nativeCurrency: {
                  name: 'CORE',
                  symbol: 'CORE',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.coredao.org'],
                blockExplorerUrls: ['https://scan.coredao.org/'],
              },
            ],
          });
          console.log('✅ Core Mainnet added successfully');
        } catch (addError) {
          console.error('❌ Failed to add Core Mainnet:', addError);
        }
      }
    }
  };

  /** --------------------------
   * 🔀 Switch to Avalanche Fuji
   * -------------------------- */
  const switchToAvalanche = async () => {
    try {
      console.log('🔄 Switching to Avalanche Fuji (43113)...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // Fuji Testnet
      });
      console.log('✅ Switched to Avalanche Fuji');
    } catch (switchError) {
      console.log('⚠️ Failed to switch, adding Avalanche Fuji...', switchError);
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              },
            ],
          });
          console.log('✅ Avalanche Fuji added successfully');
        } catch (addError) {
          console.error('❌ Failed to add Avalanche Fuji:', addError);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>AI Data Marketplace</title>
        <meta
          name="description"
          content="Decentralized marketplace for AI training data"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app">
        {/* -------------------- HEADER -------------------- */}
        <header className="app-header">
          <div className="container">
            <div className="header-left">
              <h1>🤖 AI Data Marketplace</h1>
              {account && (
                <nav className="main-nav">
                  <a href="/">Home</a>
                  <a href="/marketplace">Marketplace</a>
                  <a href="/upload">Upload</a>
                  <a href="/dashboard">Dashboard</a>
                </nav>
              )}
            </div>

            {/* Wallet Info */}
            <div className="wallet-info">
              {account ? (
                <div className="connected">
                  <span className="account">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <span className="network">
                    {process.env.NODE_ENV === 'production'
                      ? 'Core Mainnet'
                      : 'Hardhat Local'}
                  </span>
                </div>
              ) : (
                <div className="wallet-actions">
                  {!isClient ? (
                    <div className="loading">
                      <p>Loading...</p>
                    </div>
                  ) : isClient &&
                    typeof window !== 'undefined' &&
                    !window.ethereum ? (
                    <div className="metamask-missing">
                      <p>MetaMask not detected</p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Install MetaMask
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={initializeWeb3}
                      className="connect-btn"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* -------------------- MAIN CONTENT -------------------- */}
        <main className="main-content">
          <Component
            {...pageProps}
            account={account}
            provider={provider}
            contract={contract}
            initializeWeb3={initializeWeb3}
          />
        </main>

        {/* -------------------- FOOTER -------------------- */}
        <footer className="app-footer">
          <div className="container">
            <p>
              &copy; {new Date().getFullYear()} AI Data Marketplace - Privacy-First AI Training
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default MyApp;
