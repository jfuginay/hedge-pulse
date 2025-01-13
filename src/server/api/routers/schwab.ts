import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import axios from "axios";

const fetchSchwabStockData = async (symbol: string) => {
  try {
    const response = await axios.get(`https://api.schwab.com/marketdata/v1/quotes/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${env.SCHWAB_API_KEY}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Schwab stock data for ${symbol}:`, error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to fetch Schwab stock data for ${symbol}`
    });
  }
};

export const schwabRouter = createTRPCRouter({
  getSchwabStockData: protectedProcedure
    .input(z.object({
      symbol: z.string()
    }))
    .query(async ({ input }) => {
      const result = await fetchSchwabStockData(input.symbol);

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No data found for ${input.symbol}`
        });
      }

      return result;
    })
});
