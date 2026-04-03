# Production Deployment Guide

Your React stock dashboard is ready for production deployment on Azure Static Web Apps!

## Prerequisites

✅ **Build Complete**: `npm run build` has generated production assets in `dist/`  
✅ **Database**: SQL Server connection and credentials configured in `.env`  
✅ **GitHub Actions**: Workflow configured in `.github/workflows/`

## Deployment Options

### Option A: GitHub + Azure Portal (Recommended, 5 minutes)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Stock dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vibecoding.git
   git push -u origin main
   ```

2. **Create Azure Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create new "Static Web App"
   - Choose repository: `vibecoding`
   - Build presets: Custom
   - App location: `/`
   - API location: (leave blank)
   - Output location: `dist`

3. **Configure GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `AZURE_STATIC_WEB_APPS_API_TOKEN_VIBECODING` (provided by Azure)
     - `DB_SERVER`: `vibecoding5908.database.windows.net`
     - `DB_DATABASE`: `free-sql-db-9378885`
     - `DB_USER`: `vibecoding1`
     - `DB_PASSWORD`: `Raleightimes123!`

4. **Deploy**
   - Push a commit to `main` branch
   - GitHub Actions will automatically build and deploy
   - View deployment status in "Actions" tab

### Option B: Local Deployment via Azure CLI

1. **Create Azure Static Web App**
   ```bash
   az staticwebapp create \
     --name vibecoding-dashboard \
     --resource-group vibecoding-rg \
     --source . \
     --location "East US" \
     --sku Free \
     --app-artifact-location dist
   ```

2. **Deploy Updates**
   ```bash
   az staticwebapp deploy \
     --name vibecoding-dashboard \
     --resource-group vibecoding-rg \
     --source ./dist
   ```

## Testing Locally

Before deployment, test the production build locally:

```bash
# Terminal 1: Start the server
npm start

# Terminal 2: Test API
curl http://localhost:3000/api/stocks/NVDA
```

Expected response: NVDA stock data from SQL Server

## After Deployment

1. ✅ Your app will be live at: `https://vibecoding-dashboard.azurestaticapps.net`
2. ✅ Real-time stock data from SQL Server
3. ✅ Automatic HTTPS + CDN
4. ✅ Auto-deploys on every git push

## Database Configuration

The app fetches stock data from your SQL Server:

- **API Endpoint**: `GET /api/stocks/:symbol` (e.g. `/api/stocks/NVDA`)
- **Fallback**: Falls back to JSON data if API unavailable
- **Real Data**: Uses `Stocks` and `StockChartData` tables

## Environment Variables

These are set in GitHub Secrets:

```
DB_SERVER=vibecoding5908.database.windows.net
DB_DATABASE=free-sql-db-9378885
DB_USER=vibecoding1
DB_PASSWORD=Raleightimes123!
```

## Support

- Azure Static Web Apps: https://docs.microsoft.com/en-us/azure/static-web-apps/
- React Deployment: https://vitejs.dev/guide/static-deploy.html
- GitHub Actions: https://github.com/features/actions
