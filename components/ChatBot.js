import { useState } from 'react';

export default function ChatBot({ account }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      message: account 
        ? `👋 Welcome! I'm here to help you navigate the AI Data Marketplace. What would you like to do?`
        : `👋 Hi! I'm your AI assistant. Connect your wallet to get started with the marketplace.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = account ? [
    { label: '📤 Upload Dataset', action: 'upload' },
    { label: '🛒 Browse Marketplace', action: 'browse' },
    { label: '🎯 Start Training', action: 'training' },
    { label: '📊 View Dashboard', action: 'dashboard' },
    { label: '❓ How it Works', action: 'help' }
  ] : [
    { label: '🔗 Connect Wallet', action: 'connect' },
    { label: '❓ How it Works', action: 'help' },
    { label: '🔒 Privacy & Security', action: 'privacy' },
    { label: '💰 Pricing Info', action: 'pricing' }
  ];

  const responses = {
    upload: `🚀 **Upload Dataset Guide:**
    
1. **Prepare Your Data**: Ensure it's clean, anonymized, and in CSV/JSON format
2. **Set Fair Pricing**: Research similar datasets (typical range: 0.1-5 AVAX)
3. **Choose Data Type**: Select the most accurate category
4. **Upload Process**: File → IPFS → Blockchain registration
5. **Earn Automatically**: Get paid when AI models train on your data

📋 **Requirements:**
- Maximum 100MB file size
- Remove all personal identifiers
- Clear description helps sales

Ready to upload? Click "Upload Dataset" in the menu!`,

    browse: `🛒 **Marketplace Guide:**
    
**Finding Datasets:**
- Use filters to narrow by type, price, popularity
- Read descriptions carefully
- Check purchase count for quality indicators

**Purchase Process:**
1. Select dataset
2. Review price and details
3. Click "Purchase" 
4. Confirm wallet transaction
5. Access granted immediately

**Training Options:**
- Download encrypted data
- Use federated learning (privacy-first)
- View training progress in real-time

💡 **Pro Tip**: Start with smaller, cheaper datasets to test your models!`,

    training: `🎯 **AI Training Guide:**
    
**Getting Started:**
1. Purchase datasets from marketplace
2. Choose training approach:
   - **Direct Download**: Get encrypted data files
   - **Federated Learning**: Train without data leaving source

**Training Process:**
- Select model architecture
- Configure hyperparameters  
- Monitor training progress
- View accuracy/loss charts

**Privacy Features:**
- Data stays encrypted
- Only model weights shared
- HIPAA/GDPR compliant

Want to start? Purchase a dataset and click "Start Training"!`,

    dashboard: `📊 **Dashboard Overview:**
    
**Your Stats:**
- Datasets uploaded
- Total earnings in AVAX
- Purchase history
- Training job status

**Track Performance:**
- Dataset popularity
- Revenue analytics
- Model accuracy results
- Reputation scores

**Manage Assets:**
- Activate/deactivate datasets
- Update pricing
- View access logs

Access your dashboard from the main menu!`,

    help: `❓ **How AI Data Marketplace Works:**
    
**For Data Providers (Hospitals, Companies):**
1. Upload encrypted datasets to IPFS
2. Set price in AVAX tokens
3. Earn automatically when purchased
4. Maintain full privacy control

**For AI Developers:**
1. Browse marketplace for datasets
2. Purchase with AVAX tokens
3. Train models using federated learning
4. Download results and models

**Key Benefits:**
🔒 Privacy-preserving (HIPAA/GDPR compliant)
💰 Automatic payments via smart contracts
⚡ Fast transactions on Avalanche network
🤖 Federated learning support
📊 Real-time training analytics

**Use Cases:**
- Healthcare: Medical imaging, patient data
- Finance: Fraud detection, credit scoring  
- Retail: Customer behavior, recommendations
- Research: Academic studies, IoT data`,

    connect: `🔗 **Connect Your Wallet:**
    
**Why Connect?**
- Upload and sell datasets
- Purchase data for AI training
- Receive automatic AVAX payments
- Access training tools

**How to Connect:**
1. Install MetaMask browser extension
2. Create/import wallet
3. Get AVAX testnet tokens (free)
4. Switch to Avalanche Fuji network
5. Click "Connect Wallet"

**Network Details:**
- Network: Avalanche Fuji Testnet
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc

**Get Test AVAX:**
Visit the Avalanche Faucet to get free testnet tokens for testing!

Ready? Click "Connect Wallet" in the top right!`,

    privacy: `🔒 **Privacy & Security:**
    
**Data Protection:**
- End-to-end encryption before IPFS upload
- Zero-knowledge architecture
- Only metadata on blockchain
- Private key-based access control

**Compliance:**
✅ HIPAA compliant for healthcare data
✅ GDPR compliant for EU users
✅ SOX compliant for financial data
✅ Custom compliance frameworks

**Federated Learning:**
- Data never leaves your control
- Only model updates shared
- Differential privacy techniques
- Secure aggregation protocols

**Smart Contract Security:**
- Audited smart contracts
- Multi-signature controls
- Emergency pause functionality
- Transparent fee structure

**Your Control:**
- Deactivate datasets anytime
- Set access permissions
- Monitor usage logs
- Automatic royalty payments`,

    pricing: `💰 **Pricing Information:**
    
**For Data Providers:**
- Set your own prices (minimum 0.01 AVAX)
- Platform fee: 5% of each sale
- Instant payments to your wallet
- No monthly fees or subscriptions

**Typical Dataset Prices:**
- 🏥 Medical: 0.5-5 AVAX
- 🏦 Financial: 0.3-3 AVAX  
- 🛍️ Behavioral: 0.1-1 AVAX
- 🔬 Research: 0.2-2 AVAX

**Cost Factors:**
- Data quality and cleanliness
- Dataset size and completeness
- Uniqueness and rarity
- Compliance certifications

**Payment Process:**
1. Buyer pays in AVAX
2. Platform fee deducted (5%)
3. Remaining amount sent to you
4. Instant settlement

**Gas Fees:**
- Low cost on Avalanche (~$0.01)
- Faster than Ethereum
- Eco-friendly network

Start earning from your data today! 🚀`
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', message: userMessage }]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botResponse = "I'm here to help! Try asking about uploading datasets, browsing the marketplace, or how federated learning works.";

      // Simple keyword matching for responses
      const lowercaseMessage = userMessage.toLowerCase();
      
      if (lowercaseMessage.includes('upload') || lowercaseMessage.includes('sell')) {
        botResponse = responses.upload;
      } else if (lowercaseMessage.includes('buy') || lowercaseMessage.includes('purchase') || lowercaseMessage.includes('marketplace')) {
        botResponse = responses.browse;
      } else if (lowercaseMessage.includes('train') || lowercaseMessage.includes('model') || lowercaseMessage.includes('ai')) {
        botResponse = responses.training;
      } else if (lowercaseMessage.includes('dashboard') || lowercaseMessage.includes('stats')) {
        botResponse = responses.dashboard;
      } else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('how')) {
        botResponse = responses.help;
      } else if (lowercaseMessage.includes('wallet') || lowercaseMessage.includes('connect')) {
        botResponse = responses.connect;
      } else if (lowercaseMessage.includes('privacy') || lowercaseMessage.includes('security') || lowercaseMessage.includes('safe')) {
        botResponse = responses.privacy;
      } else if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('fee')) {
        botResponse = responses.pricing;
      }

      setMessages(prev => [...prev, { type: 'bot', message: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    setMessages(prev => [...prev, { 
      type: 'user', 
      message: quickActions.find(qa => qa.action === action)?.label || action 
    }]);
    
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', message: responses[action] }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="bot-info">
              <span className="bot-avatar">🤖</span>
              <div>
                <h4>AI Assistant</h4>
                <span className="status online">Online</span>
              </div>
            </div>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.message.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.message.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.action)}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about the marketplace..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-btn"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
