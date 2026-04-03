export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: string;
  peRatio: number;
  dividend: number;
  yield: number;
  volume: number;
  avgVolume: number;
  description: string;
  chartData: Array<{
    date: string;
    price: number;
  }>;
}
