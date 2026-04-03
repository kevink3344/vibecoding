import { useState, useEffect } from 'react';
import type { StockData } from '../types/stock';
import '../styles/StockDashboard.css';

interface StockDashboardProps {
  onLogout: () => void;
}

export const StockDashboard = ({ onLogout }: StockDashboardProps) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        // Try fetching from API first, fall back to JSON if not available
        const apiUrl = import.meta.env.DEV 
          ? 'http://localhost:3000/api/stocks/NVDA'
          : '/api/stocks/NVDA';
        
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          // Fallback to JSON if API is not available
          const fallbackResponse = await fetch('/data/nvda.json');
          if (!fallbackResponse.ok) throw new Error('Failed to fetch stock data');
          const data: StockData = await fallbackResponse.json();
          setStockData(data);
          setLoading(false);
          return;
        }
        
        const data: StockData = await response.json();
        setStockData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  if (loading) return <div className="container"><p className="loading">Loading stock data...</p></div>;
  if (error) return <div className="container"><p className="error">Error: {error}</p></div>;
  if (!stockData) return <div className="container"><p className="error">No stock data available</p></div>;

  const isPositive = stockData.change >= 0;

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>Stock Dashboard</h1>
          <p className="subtitle">Real-time Stock Market Data</p>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-info">
              {user.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </div>
              <button onClick={onLogout} className="logout-btn">Sign Out</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {/* Stock Header Card */}
        <section className="stock-header">
          <div className="stock-title">
            <h2>{stockData.symbol}</h2>
            <p className="stock-name">{stockData.name}</p>
          </div>
          <div className={`stock-price ${isPositive ? 'positive' : 'negative'}`}>
            <p className="price">${stockData.price.toFixed(2)}</p>
            <p className="change">
              {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
            </p>
          </div>
        </section>

        {/* Description */}
        <section className="stock-description">
          <p>{stockData.description}</p>
        </section>

        {/* Key Metrics Grid */}
        <section className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Open</p>
            <p className="metric-value">${stockData.open.toFixed(2)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Day High</p>
            <p className="metric-value">${stockData.dayHigh.toFixed(2)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Day Low</p>
            <p className="metric-value">${stockData.dayLow.toFixed(2)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Volume</p>
            <p className="metric-value">{(stockData.volume / 1000000).toFixed(2)}M</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Market Cap</p>
            <p className="metric-value">{stockData.marketCap}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">P/E Ratio</p>
            <p className="metric-value">{stockData.peRatio.toFixed(2)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">52W High</p>
            <p className="metric-value">${stockData.fiftyTwoWeekHigh.toFixed(2)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">52W Low</p>
            <p className="metric-value">${stockData.fiftyTwoWeekLow.toFixed(2)}</p>
          </div>
        </section>

        {/* Chart Data */}
        <section className="chart-section">
          <h3>3-Day Price Movement</h3>
          <div className="chart-container">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stockData.chartData.map((data, idx) => (
                  <tr key={idx}>
                    <td>{data.date}</td>
                    <td>${data.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Stock Dashboard. Data is for demonstration purposes only.</p>
      </footer>
    </div>
  );
};
