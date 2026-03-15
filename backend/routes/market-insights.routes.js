/**
 * Market Insights Routes
 * 
 * Endpoints:
 * 1. GET /api/market-insights - Get all market insights
 * 2. GET /api/market-insights/trending - Get trending crops
 * 3. GET /api/market-insights/top-trades - Get highest trades
 * 4. GET /api/market-insights/price-analysis - Get price trends
 */

import express from 'express';
import { getMarketInsights } from '../services/market-insights.service.js';

const router = express.Router();

/**
 * GET /api/market-insights
 * Get comprehensive market insights
 * Real-time data aggregation from orders and listings
 */
router.get('/', async (req, res) => {
  try {
    const insights = await getMarketInsights();
    
    res.json({
      status: 'success',
      timestamp: new Date(),
      data: insights.data
    });
  } catch (error) {
    console.error('Market insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market insights',
      error: error.message
    });
  }
});

/**
 * GET /api/market-insights/trending
 * Get trending crops
 */
router.get('/trending', async (req, res) => {
  try {
    const insights = await getMarketInsights();
    
    res.json({
      status: 'success',
      trendingCrops: insights.data.trendingCrops
    });
  } catch (error) {
    console.error('Trending crops error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending crops',
      error: error.message
    });
  }
});

/**
 * GET /api/market-insights/top-trades
 * Get highest trade values
 */
router.get('/top-trades', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const insights = await getMarketInsights();
    
    const topTrades = insights.data.highestTrades.slice(0, limit);
    
    res.json({
      status: 'success',
      count: topTrades.length,
      trades: topTrades
    });
  } catch (error) {
    console.error('Top trades error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top trades',
      error: error.message
    });
  }
});

/**
 * GET /api/market-insights/price-analysis
 * Get price trends and analysis
 */
router.get('/price-analysis', async (req, res) => {
  try {
    const insights = await getMarketInsights();
    
    res.json({
      status: 'success',
      priceAnalysis: insights.data.priceAnalysis,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Price analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch price analysis',
      error: error.message
    });
  }
});

export default router;
