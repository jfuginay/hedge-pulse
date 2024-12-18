import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { groupRouter } from "~/server/api/routers/group";
import { addressRouter } from "~/server/api/routers/address";
import { stockRouter } from "~/server/api/routers/stocks";
import { z } from "zod";
import axios from "axios";

// Type definitions for API responses
interface PolygonStock {
  ticker: string;
  name: string;
}

interface PolygonResponse {
  results?: PolygonStock[];
}

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";

if (!POLYGON_API_KEY) {
  throw new Error('Polygon API key is not configured');
}

export const appRouter = createTRPCRouter({
  user: userRouter,
  group: groupRouter,
  address: addressRouter,
  stock: stockRouter,
  activeStocks: publicProcedure
    .query(async () => {
      try {
        const response = await axios.get<PolygonResponse>(
          `https://api.polygon.io/v3/reference/tickers?type=CS&active=true`,
          { headers: { Authorization: `Bearer ${POLYGON_API_KEY}` } }
        );

        const stocks = response.data.results?.map(stock => ({
          ticker: stock.ticker,
          name: stock.name,
        })) || [];

        return stocks;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch active stocks: ${error.message}`);
        }
        throw new Error('An unknown error occurred while fetching active stocks');
      }
    }),
  currentSelectedStock: publicProcedure
    .input(z.object({
      ticker: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await axios.get(
          `https://api.polygon.io/v3/reference/options/contracts?ticker=${input.ticker}`,
          { headers: { Authorization: `Bearer ${POLYGON_API_KEY}` } }
        );

        return response.data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch options data for ticker ${input.ticker}: ${error.message}`);
        }
        throw new Error(`An unknown error occurred while fetching data for ticker ${input.ticker}`);
      }
    })
});

export type AppRouter = typeof appRouter;
