/**
 * Chatbot Routes - AI Consumer Support Endpoints
 *
 * Endpoints:
 * 1. POST /api/chatbot/message - Process user message
 * 2. GET /api/chatbot/health-goals - Get all health goals
 * 3. GET /api/chatbot/health-goals/:id - Get specific health goal
 * 4. GET /api/chatbot/millet/:name - Get millet information
 * 5. GET /api/chatbot/search - Search millets
 * 6. GET /api/chatbot/recipes/:millet - Get recipes for millet
 * 7. POST /api/chatbot/health-score - Calculate health score
 * 8. POST /api/chatbot/dietary-check - Check dietary restrictions
 * 9. POST /api/chatbot/shopping-list - Generate shopping list
 * 10. GET /api/chatbot/meal-plan/:goalId - Get meal plan
 * 11. POST /api/chatbot/track-expense - Track purchase expense
 * 12. POST /api/chatbot/preferences - Save user preferences
 * 13. GET /api/chatbot/preferences/:userId - Get user preferences
 */

import express from "express";
import {
  processChat,
  getHealthGoalRecommendation,
  getMilletInfo,
  getAllHealthGoals,
  searchMillets,
  getRecipes,
  calculateHealthScore,
  checkDietaryRestrictions,
  generateShoppingList,
  getMealPlan,
  compareMillets,
  trackExpense,
  saveUserPreferences,
  getUserPreferences,
} from "../services/chatbot.service.js";

const router = express.Router();

/**
 * POST /api/chatbot/message
 * Process user message and generate AI response
 *
 * Body: {
 *   message: string (user's question or statement)
 * }
 */
router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Invalid message",
        message: "Please provide a valid message",
      });
    }

    const response = await processChat(message);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Chatbot message error:", error);
    res.status(500).json({
      error: "Failed to process message",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/health-goals
 * Get all available health goals
 */
router.get("/health-goals", async (req, res) => {
  try {
    const goals = getAllHealthGoals();

    res.json({
      success: true,
      goals,
      count: goals.length,
    });
  } catch (error) {
    console.error("Get health goals error:", error);
    res.status(500).json({
      error: "Failed to fetch health goals",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/health-goals/:id
 * Get specific health goal with millet recommendations
 */
router.get("/health-goals/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getHealthGoalRecommendation(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get health goal error:", error);
    res.status(500).json({
      error: "Failed to fetch health goal",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/millet/:name
 * Get detailed information about a specific millet
 *
 * Example: GET /api/chatbot/millet/Finger%20Millet
 */
router.get("/millet/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);

    const result = await getMilletInfo(decodedName);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get millet info error:", error);
    res.status(500).json({
      error: "Failed to fetch millet information",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/search
 * Search for millets by query
 *
 * Query param: q=weight loss
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        error: "Invalid search query",
        message: "Please provide a search query",
      });
    }

    const result = await searchMillets(q);

    res.json(result);
  } catch (error) {
    console.error("Search millets error:", error);
    res.status(500).json({
      error: "Failed to search millets",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/recipes/:millet
 * Get recipes for a specific millet
 *
 * Example: GET /api/chatbot/recipes/Pearl%20Millet
 */
router.get("/recipes/:millet", async (req, res) => {
  try {
    const { millet } = req.params;
    const decodedMillet = decodeURIComponent(millet);

    const result = await getRecipes(decodedMillet);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({
      error: "Failed to fetch recipes",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/health-score
 * Calculate health score based on current diet
 *
 * Body: {
 *   currentDiet: string,
 *   exercise: string,
 *   healthMetrics: object
 * }
 */
router.post("/health-score", async (req, res) => {
  try {
    const { currentDiet } = req.body;

    const result = await calculateHealthScore(currentDiet);

    res.json(result);
  } catch (error) {
    console.error("Health score error:", error);
    res.status(500).json({
      error: "Failed to calculate health score",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/dietary-check
 * Check dietary restrictions and allergies
 *
 * Body: {
 *   restrictions: ["gluten_free", "vegan"],
 *   allergies: ["nuts"]
 * }
 */
router.post("/dietary-check", async (req, res) => {
  try {
    const { restrictions } = req.body;

    const result = await checkDietaryRestrictions(restrictions);

    res.json(result);
  } catch (error) {
    console.error("Dietary check error:", error);
    res.status(500).json({
      error: "Failed to check dietary restrictions",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/shopping-list
 * Generate shopping list for health goal
 *
 * Body: {
 *   healthGoal: "weight_loss",
 *   days: 7
 * }
 */
router.post("/shopping-list", async (req, res) => {
  try {
    const { healthGoal, days = 7 } = req.body;

    if (!healthGoal) {
      return res.status(400).json({
        error: "Missing health goal",
        message: "Please specify a health goal",
      });
    }

    const result = await generateShoppingList(healthGoal, days);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Shopping list error:", error);
    res.status(500).json({
      error: "Failed to generate shopping list",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/meal-plan/:goalId
 * Get meal plan for specific health goal
 *
 * Example: GET /api/chatbot/meal-plan/weight_loss
 */
router.get("/meal-plan/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;

    const result = await getMealPlan(goalId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Meal plan error:", error);
    res.status(500).json({
      error: "Failed to fetch meal plan",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/compare
 * Compare nutrition facts between millets
 *
 * Body: {
 *   millets: ["Pearl Millet", "Foxtail Millet", "Finger Millet"]
 * }
 */
router.post("/compare", async (req, res) => {
  try {
    const { millets = [] } = req.body;

    const result = await compareMillets(millets);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(500).json({
      error: "Failed to compare millets",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/track-expense
 * Track purchase expense and calculate savings
 *
 * Body: {
 *   millet: "Pearl Millet",
 *   quantity: 1,
 *   pricePerKg: 120
 * }
 */
router.post("/track-expense", async (req, res) => {
  try {
    const { millet, quantity, pricePerKg } = req.body;

    if (!millet || !quantity || !pricePerKg) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["millet", "quantity", "pricePerKg"],
      });
    }

    const result = await trackExpense({ millet, quantity, pricePerKg });

    res.json(result);
  } catch (error) {
    console.error("Expense tracking error:", error);
    res.status(500).json({
      error: "Failed to track expense",
      message: error.message,
    });
  }
});

/**
 * POST /api/chatbot/preferences
 * Save user health preferences
 *
 * Body: {
 *   userId: "user123",
 *   healthGoals: ["weight_loss"],
 *   dietaryRestrictions: ["gluten_free"],
 *   favoriteMillets: ["Pearl Millet"]
 * }
 */
router.post("/preferences", async (req, res) => {
  try {
    const { userId, ...preferences } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Missing userId",
        message: "Please provide a user ID",
      });
    }

    const result = await saveUserPreferences(userId, preferences);

    res.json(result);
  } catch (error) {
    console.error("Save preferences error:", error);
    res.status(500).json({
      error: "Failed to save preferences",
      message: error.message,
    });
  }
});

/**
 * GET /api/chatbot/preferences/:userId
 * Get user health preferences
 *
 * Example: GET /api/chatbot/preferences/user123
 */
router.get("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await getUserPreferences(userId);

    res.json(result);
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      error: "Failed to fetch preferences",
      message: error.message,
    });
  }
});

export default router;
