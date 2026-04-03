import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// SQL Server configuration
const sqlConfig = {
  server: process.env.DB_SERVER || 'vibecoding5908.database.windows.net',
  database: process.env.DB_DATABASE || 'free-sql-db-9378885',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableKeepAlive: true,
  },
};

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();

    const result = await pool
      .request()
      .query('SELECT * FROM Stocks ORDER BY Symbol');

    await pool.close();

    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to fetch stocks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get stock by symbol (for detailed view)
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();

    const stockResult = await pool
      .request()
      .input('symbol', sql.NVarChar, symbol.toUpperCase())
      .query('SELECT * FROM Stocks WHERE Symbol = @symbol');

    if (stockResult.recordset.length === 0) {
      await pool.close();
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stock = stockResult.recordset[0];

    const chartResult = await pool
      .request()
      .input('stockId', sql.Int, stock.StockId)
      .query(
        'SELECT ChartDate, ChartPrice FROM StockChartData WHERE StockId = @stockId ORDER BY ChartId'
      );

    await pool.close();

    res.json({
      ...stock,
      chartData: chartResult.recordset.map((row) => ({
        date: row.ChartDate,
        price: row.ChartPrice,
      })),
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to fetch stock details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Stock API: http://localhost:${PORT}/api/stocks`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
