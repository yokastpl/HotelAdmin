// Simple test version without database
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hotel Management App is running!',
    timestamp: new Date().toISOString(),
    platform: process.platform
  });
});

// Mock API endpoints
app.get('/api/items', (req, res) => {
  res.json([
    { id: '1', name: 'Sample Item 1', pricePerUnit: '10.00', category: 'food' },
    { id: '2', name: 'Sample Item 2', pricePerUnit: '15.50', category: 'beverage' }
  ]);
});

app.get('/api/inventory', (req, res) => {
  res.json([
    { 
      id: '1', 
      itemId: '1', 
      currentStock: 50, 
      item: { id: '1', name: 'Sample Item 1', pricePerUnit: '10.00' }
    },
    { 
      id: '2', 
      itemId: '2', 
      currentStock: 25, 
      item: { id: '2', name: 'Sample Item 2', pricePerUnit: '15.50' }
    }
  ]);
});

app.get('/api/sales', (req, res) => {
  res.json([
    { 
      id: '1', 
      itemId: '1', 
      quantity: 2, 
      unitPrice: '10.00', 
      total: '20.00', 
      customerName: 'Test Customer',
      date: new Date().toISOString()
    }
  ]);
});

app.get('/api/daily-account', (req, res) => {
  res.json({
    date: new Date().toISOString().split('T')[0],
    totalSales: 20.00,
    totalExpenses: 5.00,
    totalOnlinePayments: 0,
    netCash: 15.00,
    salesBreakdown: [],
    expensesBreakdown: [],
    onlinePaymentsBreakdown: []
  });
});

// Serve static files (if built)
app.use(express.static('dist/public'));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.json({
    message: 'Hotel Management API Server',
    status: 'Running',
    endpoints: [
      'GET /health - Health check',
      'GET /api/items - Get items',
      'GET /api/inventory - Get inventory',
      'GET /api/sales - Get sales',
      'GET /api/daily-account - Get daily account'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hotel Management App running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API endpoints: http://localhost:${PORT}/api/items`);
  console.log(`\n✅ Server is ready! Open your browser and visit: http://localhost:${PORT}`);
});
