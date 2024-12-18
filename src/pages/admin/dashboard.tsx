import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
  Flex,
  Text,
  useColorModeValue,
  Heading,
  Stack,
  Box,
  Select,
} from "@chakra-ui/react";
import { RoleSets } from "~/common/roles";
import { restClient } from "@polygon.io/client-js";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";
import { api } from "~/utils/api";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const POLY_API_KEY = process.env.POLY_API_KEY || "";
const Dashboard: NextPageWithLayout = () => {
  const [selectedStock, setSelectedStock] = useState<string>(""); // State for selected stock
  const client = useRef(restClient(POLY_API_KEY)).current;

  // Fetch all active stocks from the stock router
const {
  data: activeStocks,
  isLoading: loadingStocks,
  error: stockError,
} = api.activeStocks.useQuery();

  // Fetch aggregated options data for selected stock
  const {
    data: optionData,
    isLoading: loadingOptions,
    error: optionError,
  } = useQuery({
    queryKey: ["optionsData", selectedStock],
    queryFn: async () => {
      const { results } = await client.options.contracts.aggregates(
        `O:${selectedStock}251219C00650000`,
        1,
        "day",
        "2023-01-09",
        "2023-01-09"
      );
      return results ?? [];
    },
    enabled: !!selectedStock, // Only fetch option data when a stock is selected
  });

  // Prepare bar chart data for options data
  const chartData = optionData
    ? {
      labels: ["Open", "High", "Low", "Close"],
      datasets: [
        {
          label: "Aggregate Options Data",
          data: [optionData[0]?.o, optionData[0]?.h, optionData[0]?.l, optionData[0]?.c],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)", // Open
            "rgba(255, 206, 86, 0.6)", // High
            "rgba(75, 192, 192, 0.6)", // Low
            "rgba(255, 99, 132, 0.6)", // Close
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)", // Open
            "rgba(255, 206, 86, 1)", // High
            "rgba(75, 192, 192, 1)", // Low
            "rgba(255, 99, 132, 1)", // Close
          ],
          borderWidth: 1,
        },
      ],
    }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        beginAtZero: true,
      },
      y: {
        type: "linear" as const,
        beginAtZero: true,
      },
    },
  };

  return (
    <AuthRequired roles={RoleSets.users}>
      <Flex justifyContent="space-evenly" mt="10" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Heading as="h2" fontSize="1.5rem" color={useColorModeValue("gray.800", "gray.100")}>
            Stock Dashboard
          </Heading>
          <Text fontSize="1rem" color={useColorModeValue("gray.600", "gray.400")} mb="4">
            Select a stock to view aggregated options data:
          </Text>

          {/* STOCK DROPDOWN */}
          {loadingStocks ? (
            <Text>Loading stocks...</Text>
          ) : stockError ? (
            <Text color="red">Error loading stocks: {stockError.message}</Text>
          ) : (
            <Select
              placeholder="Select Stock"
              onChange={(e) => setSelectedStock(e.target.value)}
              mb="4"
              value={selectedStock}
            >
{activeStocks?.map((stock: { ticker: string; name: string }) => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} - {stock.name}
                </option>
              ))}
            </Select>
          )}

          {/* OPTIONS DATA */}
          {loadingOptions && !optionError && <Text>Loading options data...</Text>}

          {optionError && !loadingOptions && <Text color="red">Error loading options data: {optionError.message}</Text>}

          {/* CHART */}
          {chartData && (
            <Box
              p="4"
              bg={useColorModeValue("gray.100", "gray.800")}
              borderRadius="md"
              overflowX="auto"
              height="400px"
              mt="4"
            >
              <Chart type="bar" data={chartData} options={chartOptions} />
            </Box>
          )}
        </Flex>
      </Flex>
    </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
