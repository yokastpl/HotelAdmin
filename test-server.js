// Simple test server for Windows
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hotel Management App is running!',
    timestamp: new Date().toISOString(),
    platform: process.platform
  });
});

// Simple test route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hotel Management System',
    status: 'Server is running successfully!',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Open your browser and visit: http://localhost:${PORT}`);
});
