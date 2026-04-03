import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import { generateToken, verifyToken } from './src/utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5172',
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google Auth - Login endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();

    // Check if user exists
    let userResult = await pool
      .request()
      .input('googleId', sql.NVarChar, googleId)
      .query('SELECT * FROM Users WHERE GoogleId = @googleId');

    let user;

    if (userResult.recordset.length === 0) {
      // Create new user
      const insertResult = await pool
        .request()
        .input('googleId', sql.NVarChar, googleId)
        .input('email', sql.NVarChar, email)
        .input('name', sql.NVarChar, name)
        .input('profilePicture', sql.NVarChar, picture || null)
        .query(
          'INSERT INTO Users (GoogleId, Email, Name, ProfilePicture) VALUES (@googleId, @email, @name, @profilePicture); SELECT * FROM Users WHERE GoogleId = @googleId'
        );
      user = insertResult.recordset[0];
    } else {
      // Update last login
      user = userResult.recordset[0];
      await pool
        .request()
        .input('userId', sql.Int, user.UserId)
        .query('UPDATE Users SET LastLogin = GETUTCDATE() WHERE UserId = @userId');
    }

    await pool.close();

    // Generate JWT token
    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user.UserId,
        email: user.Email,
        name: user.Name,
        picture: user.ProfilePicture,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};

// Protected route: Get all stocks
app.get('/api/stocks', authMiddleware, async (req, res) => {
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

// Protected route: Get stock by symbol
app.get('/api/stocks/:symbol', authMiddleware, async (req, res) => {
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

// Verify token
app.get('/api/auth/verify', authMiddleware, (req: any, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
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
