import { useState, useEffect, useRef } from 'react';

export default function TrainingSimulation({ dataset, onClose, account }) {
  const [trainingState, setTrainingState] = useState('setup'); // setup, training, completed
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [trainingData, setTrainingData] = useState([]);
  const [modelType, setModelType] = useState('neural_network');
  const [learningRate, setLearningRate] = useState(0.001);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(32);
  const [federatedMode, setFederatedMode] = useState(true);
  const intervalRef = useRef(null);

  const modelTypes = [
    { value: 'neural_network', label: 'Neural Network', icon: '🧠' },
    { value: 'cnn', label: 'Convolutional Neural Network', icon: '👁️' },
    { value: 'rnn', label: 'Recurrent Neural Network', icon: '🔄' },
    { value: 'transformer', label: 'Transformer', icon: '⚡' },
    { value: 'random_forest', label: 'Random Forest', icon: '🌲' },
    { value: 'svm', label: 'Support Vector Machine', icon: '📏' }
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generateTrainingData = () => {
    const data = [];
    for (let i = 0; i <= currentEpoch; i++) {
      // Simulate realistic training curves
      const progressRatio = i / epochs;
      const noiseLevel = 0.1;
      
      // Loss decreases with some noise
      const baseLoss = 1.0 * Math.exp(-progressRatio * 3) + 0.1;
      const lossNoise = (Math.random() - 0.5) * noiseLevel;
      const simulatedLoss = Math.max(0.05, baseLoss + lossNoise);
      
      // Accuracy increases with some noise
      const baseAccuracy = (1 - Math.exp(-progressRatio * 2.5)) * 0.95;
      const accuracyNoise = (Math.random() - 0.5) * noiseLevel * 0.3;
      const simulatedAccuracy = Math.min(0.98, Math.max(0.1, baseAccuracy + accuracyNoise));
      
      data.push({
        epoch: i,
        loss: simulatedLoss,
        accuracy: simulatedAccuracy,
        valLoss: simulatedLoss + Math.random() * 0.05,
        valAccuracy: simulatedAccuracy - Math.random() * 0.05
      });
    }
    return data;
  };

  const startTraining = () => {
    setTrainingState('training');
    setProgress(0);
    setCurrentEpoch(0);
    setTrainingData([]);

    intervalRef.current = setInterval(() => {
      setCurrentEpoch(prev => {
        const newEpoch = prev + 1;
        const newProgress = (newEpoch / epochs) * 100;
        
        setProgress(newProgress);
        
        // Update current metrics
        const data = generateTrainingData();
        if (data.length > 0) {
          const latest = data[data.length - 1];
          setAccuracy(latest.accuracy);
          setLoss(latest.loss);
        }
        setTrainingData(data);

        if (newEpoch >= epochs) {
          clearInterval(intervalRef.current);
          setTrainingState('completed');
          return epochs;
        }
        
        return newEpoch;
      });
    }, 200); // Fast simulation for demo
  };

  const getModelDescription = () => {
    const descriptions = {
      neural_network: 'Multi-layer perceptron suitable for tabular data and general classification/regression tasks.',
      cnn: 'Convolutional networks excel at image recognition, medical imaging, and spatial data analysis.',
      rnn: 'Recurrent networks are perfect for time series, sequential data, and natural language processing.',
      transformer: 'State-of-the-art for NLP, recommendation systems, and attention-based learning.',
      random_forest: 'Ensemble method great for structured data, feature importance, and interpretable results.',
      svm: 'Support Vector Machines work well for high-dimensional data and smaller datasets.'
    };
    return descriptions[modelType] || '';
  };

  const getFinalResults = () => {
    if (trainingData.length === 0) return null;
    
    const finalMetrics = trainingData[trainingData.length - 1];
    const convergence = trainingData.length > 10 ? 
      Math.abs(trainingData[trainingData.length - 1].loss - trainingData[trainingData.length - 10].loss) < 0.01 : false;
    
    return {
      finalAccuracy: (finalMetrics.accuracy * 100).toFixed(2),
      finalLoss: finalMetrics.loss.toFixed(4),
      convergence,
      recommendedEpochs: convergence ? currentEpoch - 5 : epochs + 20
    };
  };

  const downloadModel = () => {
    const modelData = {
      dataset: dataset.name,
      modelType,
      hyperparameters: { learningRate, epochs, batchSize },
      metrics: getFinalResults(),
      trainingData,
      timestamp: new Date().toISOString(),
      federatedMode
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model_${dataset.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay training-modal">
      <div className="modal training-simulation">
        <div className="modal-header">
          <h3>🎯 AI Model Training</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {trainingState === 'setup' && (
            <div className="training-setup">
              <div className="dataset-info">
                <h4>📊 Dataset: {dataset.name}</h4>
                <p>{dataset.description}</p>
                <div className="dataset-specs">
                  <span>Type: {dataset.dataType}</span>
                  <span>Size: {(dataset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  <span>Privacy: {federatedMode ? '🔒 Federated' : '📥 Direct'}</span>
                </div>
              </div>

              <div className="model-config">
                <h4>🤖 Model Configuration</h4>
                
                <div className="config-row">
                  <label>Model Type:</label>
                  <select value={modelType} onChange={(e) => setModelType(e.target.value)}>
                    {modelTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="model-description">
                  <p>{getModelDescription()}</p>
                </div>

                <div className="config-grid">
                  <div className="config-item">
                    <label>Learning Rate:</label>
                    <input
                      type="number"
                      value={learningRate}
                      onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                      step="0.0001"
                      min="0.0001"
                      max="0.1"
                    />
                  </div>
                  
                  <div className="config-item">
                    <label>Epochs:</label>
                    <input
                      type="number"
                      value={epochs}
                      onChange={(e) => setEpochs(parseInt(e.target.value))}
                      min="10"
                      max="200"
                    />
                  </div>
                  
                  <div className="config-item">
                    <label>Batch Size:</label>
                    <input
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      min="8"
                      max="128"
                      step="8"
                    />
                  </div>
                </div>

                <div className="privacy-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={federatedMode}
                      onChange={(e) => setFederatedMode(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      {federatedMode ? '🔒 Federated Learning (Privacy-Preserving)' : '📥 Direct Download'}
                    </span>
                  </label>
                  <small>
                    {federatedMode 
                      ? 'Model trains without accessing raw data. Maximum privacy.'
                      : 'Download encrypted data for local training. Faster but less private.'
                    }
                  </small>
                </div>
              </div>

              <div className="training-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={startTraining}>
                  🚀 Start Training
                </button>
              </div>
            </div>
          )}

          {trainingState === 'training' && (
            <div className="training-progress">
              <div className="progress-header">
                <h4>🔄 Training in Progress...</h4>
                <div className="training-status">
                  <span>Epoch {currentEpoch}/{epochs}</span>
                  <span>{progress.toFixed(1)}% Complete</span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Accuracy</span>
                  <span className="metric-value">{(accuracy * 100).toFixed(2)}%</span>
                  <div className="metric-trend up">↗️</div>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Loss</span>
                  <span className="metric-value">{loss.toFixed(4)}</span>
                  <div className="metric-trend down">↘️</div>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Learning Rate</span>
                  <span className="metric-value">{learningRate}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Batch Size</span>
                  <span className="metric-value">{batchSize}</span>
                </div>
              </div>

              {trainingData.length > 0 && (
                <div className="training-chart">
                  <h5>Training Progress</h5>
                  <div className="chart-container">
                    <svg viewBox="0 0 400 200" className="progress-chart">
                      {/* Chart background */}
                      <rect width="400" height="200" fill="#f8f9fa" />
                      
                      {/* Grid lines */}
                      {[0, 50, 100, 150, 200].map(y => (
                        <line key={y} x1="40" y1={y + 20} x2="380" y2={y + 20} stroke="#e9ecef" strokeWidth="1" />
                      ))}
                      
                      {/* Accuracy line */}
                      <polyline
                        points={trainingData.map((d, i) => 
                          `${40 + (i / epochs) * 340},${180 - d.accuracy * 160}`
                        ).join(' ')}
                        fill="none"
                        stroke="#28a745"
                        strokeWidth="2"
                      />
                      
                      {/* Loss line */}
                      <polyline
                        points={trainingData.map((d, i) => 
                          `${40 + (i / epochs) * 340},${20 + d.loss * 80}`
                        ).join(' ')}
                        fill="none"
                        stroke="#dc3545"
                        strokeWidth="2"
                      />
                      
                      {/* Legend */}
                      <text x="50" y="15" fill="#28a745" fontSize="12">Accuracy</text>
                      <text x="150" y="15" fill="#dc3545" fontSize="12">Loss</text>
                    </svg>
                  </div>
                </div>
              )}

              {federatedMode && (
                <div className="federated-status">
                  <h5>🔒 Federated Learning Status</h5>
                  <div className="participants">
                    <div className="participant">
                      <span className="participant-icon">🏥</span>
                      <span>Hospital A - Synced</span>
                      <span className="status-indicator connected"></span>
                    </div>
                    <div className="participant">
                      <span className="participant-icon">🏦</span>
                      <span>Financial Corp - Synced</span>
                      <span className="status-indicator connected"></span>
                    </div>
                    <div className="participant">
                      <span className="participant-icon">🔬</span>
                      <span>Research Lab - Syncing...</span>
                      <span className="status-indicator syncing"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {trainingState === 'completed' && (
            <div className="training-results">
              <div className="results-header">
                <h4>✅ Training Completed!</h4>
                <p>Your AI model has been successfully trained on the dataset.</p>
              </div>

              {(() => {
                const results = getFinalResults();
                return results && (
                  <div className="final-metrics">
                    <div className="metric-highlight">
                      <span className="metric-icon">🎯</span>
                      <div>
                        <span className="metric-title">Final Accuracy</span>
                        <span className="metric-result">{results.finalAccuracy}%</span>
                      </div>
                    </div>
                    <div className="metric-highlight">
                      <span className="metric-icon">📉</span>
                      <div>
                        <span className="metric-title">Final Loss</span>
                        <span className="metric-result">{results.finalLoss}</span>
                      </div>
                    </div>
                    <div className="metric-highlight">
                      <span className="metric-icon">⚡</span>
                      <div>
                        <span className="metric-title">Convergence</span>
                        <span className="metric-result">
                          {results.convergence ? 'Achieved' : 'Partial'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="recommendations">
                <h5>💡 Recommendations</h5>
                <ul>
                  <li>Model performance: {accuracy > 0.8 ? 'Excellent' : accuracy > 0.6 ? 'Good' : 'Needs improvement'}</li>
                  <li>Consider {getFinalResults()?.recommendedEpochs} epochs for optimal results</li>
                  <li>Try different learning rates if accuracy plateaus</li>
                  <li>Add regularization if overfitting occurs</li>
                </ul>
              </div>

              <div className="export-options">
                <h5>📁 Export Options</h5>
                <div className="export-buttons">
                  <button className="btn btn-primary" onClick={downloadModel}>
                    💾 Download Model
                  </button>
                  <button className="btn btn-secondary">
                    📊 View Full Report
                  </button>
                  <button className="btn btn-success">
                    🚀 Deploy Model
                  </button>
                </div>
              </div>

              <div className="next-steps">
                <h5>🎯 Next Steps</h5>
                <div className="step-cards">
                  <div className="step-card">
                    <span className="step-icon">🔧</span>
                    <h6>Fine-tune</h6>
                    <p>Adjust hyperparameters for better performance</p>
                  </div>
                  <div className="step-card">
                    <span className="step-icon">📈</span>
                    <h6>Scale Up</h6>
                    <p>Train on more datasets for improved accuracy</p>
                  </div>
                  <div className="step-card">
                    <span className="step-icon">🌐</span>
                    <h6>Deploy</h6>
                    <p>Put your model into production</p>
                  </div>
                </div>
              </div>

              <div className="completion-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={() => setTrainingState('setup')}>
                  🔄 Train Another Model
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
