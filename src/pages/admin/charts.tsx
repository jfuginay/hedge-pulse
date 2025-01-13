import React, { useEffect, useState } from "react";
import { AdminLayout } from "~/components/Global/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Dark theme configuration
const darkTheme = {
  backgroundColor: "#1a1a1a",
  textColor: "#ffffff",
  gridColor: "#333333",
  tooltipBackground: "#262626",
  barColors: {
    open: "#3b82f6",  // Blue
    close: "#ef4444"  // Red
  }
};

// Mock data generator remains the same
const generateMockData = (stockSymbol: string, days: number) => {
  const data = [];
  const basePrice = Math.random() * 100 + 100;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const openPrice = basePrice + (Math.random() - 0.5) * 10;
    const closePrice = openPrice + (Math.random() - 0.5) * 5;

    data.push({
      date: date.toLocaleDateString(),
      open: parseFloat(openPrice.toFixed(2)),
      close: parseFloat(closePrice.toFixed(2)),
      symbol: stockSymbol
    });
  }

  return data.reverse();
};

const StockDashboard = () => {
  return (
    <AdminLayout>
      <StockDashboardContent />
    </AdminLayout>
  );
};

const StockDashboardContent = () => {

  const [selectedStock, setSelectedStock] = useState<string>("AAPL");
  const [selectedStockSecondary, setSelectedStockSecondary] = useState<string>("SPY");
  const [startDate, setStartDate] = useState<string>("2024-12-12");
  const [endDate, setEndDate] = useState<string>("2024-12-19");
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartDataSecondary, setChartDataSecondary] = useState<any[]>([]);

  const stockOptions = ["AAPL", "SPY", "QQQ", "MSFT", "GOOGL"];

  useEffect(() => {
    setChartData(generateMockData(selectedStock, 7));
  }, [selectedStock, startDate, endDate]);

  useEffect(() => {
    setChartDataSecondary(generateMockData(selectedStockSecondary, 7));
  }, [selectedStockSecondary, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 mb-1">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-h-[84.3vh] bg-gray-900">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-white">Stock Dashboard</h2>
        <p className="text-gray-400 mb-4">
          Select stocks to compare detailed options statistics:
        </p>
      </div>

      {/* Date Range Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm mb-2 block text-white">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
            className="block w-full rounded-md border border-gray-600 bg-gray-700 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm mb-2 block text-white">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="block w-full rounded-md border border-gray-600 bg-gray-700 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Primary Stock Chart</h3>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-32 rounded-md border border-gray-600 bg-gray-700 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stockOptions.map((stock) => (
                  <option key={stock} value={stock}>
                    {stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkTheme.gridColor}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke={darkTheme.textColor}
                      tick={{ fill: darkTheme.textColor }}
                    />
                    <YAxis
                      dataKey="date"
                      type="category"
                      stroke={darkTheme.textColor}
                      tick={{ fill: darkTheme.textColor }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: darkTheme.tooltipBackground,
                        border: 'none',
                        borderRadius: '8px',
                        color: darkTheme.textColor
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: darkTheme.textColor }}
                    />
                    <Bar
                      dataKey="open"
                      fill={darkTheme.barColors.open}
                      name="Open Price"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="close"
                      fill={darkTheme.barColors.close}
                      name="Close Price"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Loading chart data...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Secondary Stock Chart</h3>
              <select
                value={selectedStockSecondary}
                onChange={(e) => setSelectedStockSecondary(e.target.value)}
                className="w-32 rounded-md border border-gray-600 bg-gray-700 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stockOptions.map((stock) => (
                  <option key={stock} value={stock}>
                    {stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[400px]">
              {chartDataSecondary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartDataSecondary}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkTheme.gridColor}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke={darkTheme.textColor}
                      tick={{ fill: darkTheme.textColor }}
                    />
                    <YAxis
                      dataKey="date"
                      type="category"
                      stroke={darkTheme.textColor}
                      tick={{ fill: darkTheme.textColor }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: darkTheme.tooltipBackground,
                        border: 'none',
                        borderRadius: '8px',
                        color: darkTheme.textColor
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: darkTheme.textColor }}
                    />
                    <Bar
                      dataKey="open"
                      fill={darkTheme.barColors.open}
                      name="Open Price"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="close"
                      fill={darkTheme.barColors.close}
                      name="Close Price"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Loading chart data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
