import React, { useState, useEffect } from 'react';
import { AdminLayout } from '~/components/Global/Layout';
import { Select, Box, Text } from '@chakra-ui/react';

const SchwabTab = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [marketData, setMarketData] = useState(null);

  const fetchMarketData = async (stock) => {
    try {
      const response = await fetch(`/api/schwab?symbol=${stock}`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  useEffect(() => {
    fetchMarketData(selectedStock);
    const interval = setInterval(() => {
      fetchMarketData(selectedStock);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  return (
    <Box p={5}>
      <Text fontSize="2xl" mb={4}>Schwab Market Info</Text>
      <Select
        value={selectedStock}
        onChange={(e) => setSelectedStock(e.target.value)}
        mb={4}
      >
        <option value="AAPL">Apple</option>
        <option value="GOOGL">Google (Alphabet)</option>
        <option value="SPY">SPY</option>
      </Select>
      {marketData ? (
        <Box>
          <Text>Stock: {selectedStock}</Text>
          <Text>Price: {marketData.price}</Text>
          <Text>Change: {marketData.change}</Text>
          <Text>Volume: {marketData.volume}</Text>
        </Box>
      ) : (
        <Text>Loading market data...</Text>
      )}
    </Box>
  );
};

const SchwabPage = () => {
  return (
    <AdminLayout>
      <SchwabTab />
    </AdminLayout>
  );
};

export default SchwabPage;
