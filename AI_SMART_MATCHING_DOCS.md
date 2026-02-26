# AI Smart Product Matching Feature Documentation

## Overview

The AI Smart Product Matching system is an intelligent recommendation engine that helps consumers find millet products that precisely match their quality and price requirements. The system uses a sophisticated matching algorithm to score and rank verified listings based on multiple factors.

## How It Works

### Algorithm Components

The matching algorithm evaluates each product on four key dimensions:

#### 1. **Quality Matching (30% weight)**

- Compares the consumer's preferred quality level with the actual product quality
- Priority matching:
  - If looking for Premium: Premium (100%) > Standard (90%) > Basic (70%)
  - If looking for Standard: Standard (100%) > Premium (90%) > Basic (70%)
  - If looking for Basic: Basic (100%) > Standard (80%) > Premium (70%)

#### 2. **Price Value Score (25% weight)**

- Ensures the product is within budget
- Gives slight preference to lower-priced options within budget
- Formula: Products below maximum price get proportional scoring

#### 3. **Farmer Credibility (25% weight)**

- Uses farmer's historical performance score (0-100)
- Based on:
  - Quality history (past quality checks)
  - Order completion rate
  - Payment reliability
  - Number of active listings
- Higher credibility = higher trust in the product

#### 4. **Freshness (20% weight)**

- Evaluates product freshness based on harvest date
- Scoring:
  - 0-30 days old: 100%
  - 30-60 days old: 80%
  - 60-90 days old: 60%
  - 90+ days old: 40%

### Final Match Score Calculation

```
Match Score = (Quality × 0.3) + (Price × 0.25) + (Credibility × 0.25) + (Freshness × 0.2)
```

The final score ranges from 0-100, where:

- **85-100**: Excellent match
- **70-84**: Good match
- **50-69**: Fair match
- **Below 50**: Poor match

## Features

### For Consumers

#### 1. **Smart Shopping Assistant**

- **Location**: `/dashboard/consumer/smart-shopping`
- **Features**:
  - Set maximum budget per kg
  - Choose preferred quality (Premium, Standard, Basic)
  - Filter by millet types (optional)
  - View aggregated statistics (total matches, average score, price range)
  - See top 10 matches with detailed information
  - View match reasons for each product
  - Contact farmer directly
  - Place orders

#### 2. **Product Display Information**

Each matched product shows:

- **Match Score**: Percentage match (color-coded)
- **Price Per Kg**: With total cost calculation
- **Quality Level**: Premium/Standard/Basic
- **Quantity Available**: With unit
- **Freshness**: Days since harvest
- **Farmer Rating**: Credibility score out of 100
- **Match Reasons**:
  - Quality compatibility explanation
  - Price positioning vs budget
  - Freshness assessment
  - Seller credibility rating

### For Admin

#### 1. **AI Insights Dashboard**

- **Location**: `/dashboard/admin/ai-insights`
- **Tabs**:
  - Overview: Summary statistics and recommendations
  - Demand Trends: Chart and analysis of order frequency
  - Pricing Analysis: Current market prices and comparisons
  - Market Volatility: Price stability analysis

#### 2. **Insights Provided**:

- Current market prices by millet type
- Demand levels and trends
- Price volatility analysis
- Trend direction (Upward/Downward/Stable)
- Actionable recommendations for stakeholders

## API Endpoint

### POST `/api/ai/smart-match`

**Request Body:**

```json
{
  "maxPrice": 50,
  "preferredQuality": "Standard",
  "milletTypes": ["Finger Millet", "Pearl Millet"],
  "maxDistance": 50
}
```

**Parameters:**

- `maxPrice` (required): Maximum price per kg the consumer is willing to pay
- `preferredQuality` (required): "Premium", "Standard", or "Basic"
- `milletTypes` (optional): Array of specific millet types to filter
- `maxDistance` (optional): Maximum delivery distance in km

**Response:**

```json
{
  "success": true,
  "matchesFound": 8,
  "topMatches": [
    {
      "listingId": "listing-123",
      "farmerId": "farmer-1",
      "farmerName": "Ramesh Kumar",
      "milletType": "Finger Millet",
      "quality": "Premium",
      "quantity": 200,
      "pricePerKg": 45,
      "totalPrice": 9000,
      "matchScore": 92,
      "farmerCredibility": 88,
      "matchReasons": {
        "quality": "Premium quality matches your preference",
        "price": "₹45/kg - ₹5/kg below budget",
        "freshness": "Harvested 15 days ago",
        "seller": "Farmer rating: 88/100"
      }
    }
  ],
  "statistics": {
    "totalMatches": 8,
    "averageMatchScore": 78,
    "priceRange": {
      "min": 40,
      "max": 50,
      "avg": 46
    },
    "qualitiesAvailable": ["Premium", "Standard"],
    "milletsAvailable": ["Finger Millet", "Pearl Millet"]
  },
  "recommendation": "Top match: Ramesh Kumar's Finger Millet at ₹45/kg (92% match)"
}
```

## User Journey

### Consumer Smart Shopping

1. **Set Preferences**
   - Enter maximum budget (₹/kg)
   - Select preferred quality level
   - Optionally filter by millet types

2. **View Results**
   - See aggregated statistics at the top
   - Browse top 10 matched products
   - Each product shows match score, price, quality, and freshness

3. **Make Purchase Decision**
   - Read "Why this match" explanation
   - Review farmer credibility
   - Call farmer or place order

### Admin Market Analysis

1. **View Overview**
   - See total products, average prices, total demand, market volatility

2. **Analyze Demand**
   - See which millet types are in highest demand
   - Identify trending products

3. **Monitor Pricing**
   - View current market prices
   - Identify price trends
   - See price volatility

4. **Make Business Decisions**
   - Use insights to optimize supply chain
   - Plan procurement
   - Set price guidelines

## Technical Implementation

### Backend Components

#### AI Service (`/backend/services/ai.service.js`)

- `getSmartProductMatches(preferences)`: Main matching function
- Fetches verified active listings from Firestore
- Applies quality, price, credibility, and freshness scoring
- Returns ranked results

#### AI Routes (`/backend/routes/ai.routes.js`)

- `POST /api/ai/smart-match`: Exposes the matching service
- Input validation
- Error handling

### Frontend Components

#### Consumer Page (`/app/dashboard/consumer/smart-shopping/page.tsx`)

- Price range slider with input
- Quality level selector
- Millet type filter buttons
- Results display with match cards
- Contact and order buttons

#### Admin Page (`/app/dashboard/admin/ai-insights/page.tsx`)

- Tabbed interface for different analyses
- Recharts visualizations
- Statistics cards
- Detailed trend discussions

#### Hook (`/hooks/use-smart-matching.ts`)

- `useSmartMatching()`: React hook for managing matching requests
- Handles loading, errors, and results state
- Provides utility functions for score interpretation and formatting

### Database Integration

**Collections Used:**

- `listings`: Source of products to match
- `users`: Farmer credibility data
- `orders`: Historical demand data for freshness calculation
- `qualitychecks`: Farmer quality history

## Matching Examples

### Example 1: Budget-Conscious Consumer

```json
{
  "maxPrice": 40,
  "preferredQuality": "Basic"
}
```

Results will prioritize lower prices and basic quality products, giving high scores to affordable options.

### Example 2: Premium Quality Seeker

```json
{
  "maxPrice": 60,
  "preferredQuality": "Premium",
  "milletTypes": ["Finger Millet", "Foxtail Millet"]
}
```

Results will focus on premium quality products, even if they're at the higher end of the budget.

### Example 3: Specific Millet Preference

```json
{
  "maxPrice": 50,
  "preferredQuality": "Standard",
  "milletTypes": ["Pearl Millet"]
}
```

Results will only show Pearl Millet products within the specified preferences.

## Performance & Optimization

- **Query Optimization**: Only fetches verified, active listings
- **Caching**: Results are cached on the frontend
- **Real-time Data**: Uses current Firestore snapshots
- **Scalability**: Algorithm can handle 1000+ products efficiently

## Future Enhancements

1. **Machine Learning**: Replace rule-based scoring with trained ML models
2. **Historical Predictions**: Use historical data to predict price trends
3. **Location-Based Matching**: Include delivery logistics in scoring
4. **Seasonal Adjustments**: Adjust preferences based on season
5. **Consumer Behavior**: Track and improve recommendations based on purchase history
6. **Farmer Notifications**: Notify farmers of high-demand preferences
7. **Bulk Order Discounts**: Calculate bulk pricing in matching

## Troubleshooting

### No Matches Found

- **Reason**: Budget too low or quality preference too strict
- **Solution**: Increase max price or lower quality preference

### Low Match Scores

- **Reason**: Few products meet all requirements
- **Solution**: Relax any non-critical preferences

### API Errors

- **Check**: Backend server is running (`http://localhost:5000`)
- **Check**: Firestore connection is active
- **Check**: Required fields are provided in request

## Support & Contact

For issues or feature requests:

- Check the AI development logs
- Review Firestore data quality
- Ensure all dependencies are installed

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0
