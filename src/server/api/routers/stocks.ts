import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { restClient } from '@polygon.io/client-js';

// Initialize the Polygon client
const rest = restClient(env.POLYGON_API_KEY);

// Interfaces
interface StockData {
  ticker: string;
  name: string;
  volume: number;
  chartData: ChartData[];
}

interface ChartData {
  close: number;
  high: number;
  low: number;
  open: number;
  time: number;
  volume: number;
  volumeWeighted: number;
  transactions: number;
}

interface ActiveStockData {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  last_updated_utc: string;
}

const createAbortableRequest = async <T>(callback: (controller: AbortController) => Promise<T>): Promise<T> => {
  const controller = new AbortController();
  return callback(controller);
};

// Fetch historical data for each stock
const fetchOptionAggregateData = async (
  optionTicker: string,
  multiplier = 1,
  timespan: string,
  from: string,
  to: string
): Promise<StockData | null> => {
  try {
    const data = await createAbortableRequest(() =>
      rest.options.aggregates(optionTicker, multiplier, timespan, from, to)
    );

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return {
        ticker: optionTicker,
        name: optionTicker,
        volume: 0,
        chartData: [],
      };
    }

    const transformedData = data.results.map((result) => ({
      close: result.c ?? 0,
      high: result.h ?? 0,
      low: result.l ?? 0,
      open: result.o ?? 0,
      time: result.t ?? 0,
      volume: result.v ?? 0,
      volumeWeighted: result.vw ?? 0,
      transactions: result.n ?? 0,
    }));

    const totalVolume = transformedData.reduce(
      (sum, entry) => sum + entry.volume,
      0
    );

    return {
      ticker: optionTicker,
      name: optionTicker,
      volume: totalVolume,
      chartData: transformedData,
    };
  } catch (e) {
    console.error(`Failed to fetch options data for ${optionTicker}:`, e);
    return null;
  }
};

const fetchTopActiveStocks = async (): Promise<ActiveStockData[]> => {
  try {
    const data = await createAbortableRequest(() => rest.reference.tickers({ active: "true" }));

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return [];
    }

    const sortedStocks = data.results
      .slice(0, 5)
      .map((stock) => ({
        ticker: stock.ticker || "",
        name: stock.name || "",
        market: stock.market || "",
        locale: stock.locale || "",
        primary_exchange: stock.primary_exchange || "",
        type: stock.type || "",
        active: stock.active || false,
        currency_name: stock.currency_name || "",
        last_updated_utc: stock.last_updated_utc || "",
      }));


    return sortedStocks;
  } catch (e) {
    console.error(`Failed to fetch top active stocks:`, e);
    return [];
  }
};

// Define the actual router
export const stockRouter = createTRPCRouter({
  getOptionsData: protectedProcedure
    .input(z.object({
      optionTicker: z.string(),
      multiplier: z.number().optional().default(1),
      timespan: z.string().optional().default("day"),
      from: z.string().optional().default("2023-01-09"),
      to: z.string().optional().default("2023-01-09")
    }))
    .query(async ({ input }) => {
      const result = await fetchOptionAggregateData(
        input.optionTicker,
        input.multiplier,
        input.timespan,
        input.from,
        input.to
      );

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No data found for ${input.optionTicker}`
        });
      }

      return result;
    }),

  getTopActiveStocks: protectedProcedure
    .query(async () => {
      const result = await fetchTopActiveStocks();

      if (!result || result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active stocks found.'
        });
      }

      return result;
    })
});

export type StockRouter = typeof stockRouter;