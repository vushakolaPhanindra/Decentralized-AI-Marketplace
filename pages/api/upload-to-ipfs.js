import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

// Disable bodyParser for this API route to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Mock IPFS upload for development/testing
const mockIPFSUpload = async (fileData, fileName) => {
  // Generate a mock IPFS hash (CID) based on file content
  const hash = crypto.createHash('sha256').update(fileData).digest('hex');
  const mockCID = `Qm${hash.substring(0, 44)}`; // IPFS CID format
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    cid: mockCID,
    size: fileData.length,
    path: fileName
  };
};

// Encrypt data (simple XOR encryption for demo - use proper encryption in production)
const encryptData = (data, key = 'demo-encryption-key') => {
  const encrypted = Buffer.alloc(data.length);
  const keyBuffer = Buffer.from(key);
  
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyBuffer[i % keyBuffer.length];
  }
  
  return encrypted;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      uploadDir: './tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    const metadata = fields.metadata?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Processing file upload:', file.originalFilename);

    // Read file data
    const fileData = fs.readFileSync(file.filepath);
    
    // Encrypt the file data
    const encryptedData = encryptData(fileData);
    
    // Parse metadata
    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(metadata || '{}');
    } catch (error) {
      console.log('Invalid metadata JSON, using empty object');
    }

    // Create comprehensive metadata
    const fileMetadata = {
      ...parsedMetadata,
      originalName: file.originalFilename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      encrypted: true,
      encryptionMethod: 'XOR', // In production, use AES or similar
      ipfsVersion: '1.0'
    };

    console.log('Uploading to IPFS (mock)...');
    
    // Use mock IPFS upload for development
    const fileResult = await mockIPFSUpload(encryptedData, `encrypted_${file.originalFilename}`);
    
    console.log('File uploaded to IPFS:', fileResult.cid);
    
    // Create metadata hash
    const metadataContent = JSON.stringify(fileMetadata, null, 2);
    const metadataResult = await mockIPFSUpload(Buffer.from(metadataContent), 'metadata.json');
    
    console.log('Metadata uploaded to IPFS:', metadataResult.cid);
    
    // Generate directory hash (combine file and metadata hashes)
    const directoryContent = JSON.stringify({
      file: fileResult.cid,
      metadata: metadataResult.cid,
      timestamp: new Date().toISOString()
    });
    const directoryHash = await mockIPFSUpload(Buffer.from(directoryContent), 'directory.json');
    
    console.log('Directory uploaded to IPFS:', directoryHash.cid);
    
    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (error) {
      console.log('Failed to clean up temp file:', error.message);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      ipfsHash: directoryHash.cid,
      fileHash: fileResult.cid,
      metadataHash: metadataResult.cid,
      metadata: fileMetadata,
      message: 'File uploaded successfully to IPFS (mock)'
    });
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    
    // Clean up any temporary files
    try {
      const form = formidable();
      const [, files] = await form.parse(req);
      const file = files.file?.[0];
      if (file?.filepath) {
        fs.unlinkSync(file.filepath);
      }
    } catch (cleanupError) {
      console.log('Cleanup error:', cleanupError.message);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload to IPFS',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
