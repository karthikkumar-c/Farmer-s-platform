/**
 * AI Chatbot Service - Consumer Support with Health Goal Recommendations
 *
 * Features:
 * 1. Health goal to millet mapping
 * 2. Natural language query processing
 * 3. Product recommendations based on health goals
 * 4. Recipes & cooking tips
 * 5. Health score calculator
 * 6. Allergy & dietary restrictions check
 * 7. Shopping list generator
 * 8. Meal plan suggestions
 * 9. Expense tracker
 * 10. User preferences & personalization
 */

import { getFirestore, Collections } from "../config/firebase.js";

// Health Goals Database with Millet Recommendations
const HEALTH_GOALS = {
  weight_loss: {
    id: "weight_loss",
    name: "Weight Loss",
    description: "Low calorie, high fiber millets for weight management",
    emoji: "🏃",
    icon: "TrendingDown",
    millets: ["Foxtail Millet", "Little Millet", "Finger Millet"],
    benefits: ["High fiber", "Low glycemic index", "Keeps you full longer"],
    recommendedQuantity: "50-100g per day",
  },
  diabetes_control: {
    id: "diabetes_control",
    name: "Diabetes Control",
    description: "Low glycemic index millets for blood sugar management",
    emoji: "🩺",
    icon: "Heart",
    millets: ["Barnyard Millet", "Foxtail Millet", "Little Millet"],
    benefits: ["Low GI", "Regulates blood sugar", "Rich in magnesium"],
    recommendedQuantity: "100-150g per day",
  },
  high_protein: {
    id: "high_protein",
    name: "High Protein Diet",
    description: "Protein-rich millets for muscle building and recovery",
    emoji: "💪",
    icon: "Zap",
    millets: ["Pearl Millet", "Finger Millet", "Foxtail Millet"],
    benefits: ["15-18% protein", "Complete amino acids", "Supports muscle growth"],
    recommendedQuantity: "150-200g per day",
  },
  digestion: {
    id: "digestion",
    name: "Digestive Health",
    description: "Easily digestible millets that improve gut health",
    emoji: "🍎",
    icon: "Activity",
    millets: ["Proso Millet", "Foxtail Millet", "Barnyard Millet"],
    benefits: ["Easy to digest", "Prebiotic", "Supports good bacteria"],
    recommendedQuantity: "100-150g per day",
  },
  heart_health: {
    id: "heart_health",
    name: "Heart Health",
    description: "Heart-healthy millets rich in omega-3 and antioxidants",
    emoji: "❤️",
    icon: "Heart",
    millets: ["Finger Millet", "Pearl Millet", "Foxtail Millet"],
    benefits: ["Rich in magnesium", "Reduces cholesterol", "Anti-inflammatory"],
    recommendedQuantity: "100-150g per day",
  },
  energy_boost: {
    id: "energy_boost",
    name: "Energy & Stamina",
    description: "Energy-rich millets for active lifestyle and sustained energy",
    emoji: "⚡",
    icon: "Zap",
    millets: ["Pearl Millet", "Finger Millet", "Sorghum"],
    benefits: ["B vitamins", "Sustained energy release", "Iron-rich"],
    recommendedQuantity: "150-200g per day",
  },
  gluten_free: {
    id: "gluten_free",
    name: "Gluten-Free Diet",
    description: "Naturally gluten-free millets for celiac and gluten-sensitive people",
    emoji: "🥕",
    icon: "Shield",
    millets: ["Pearl Millet", "Foxtail Millet", "Proso Millet", "Barnyard Millet"],
    benefits: ["100% gluten-free", "Safe for celiac disease", "Nutrient-dense"],
    recommendedQuantity: "100-200g per day",
  },
};

// Millet Information Database
const MILLET_INFO = {
  "Finger Millet": {
    tagline: "Ancient grain superfood",
    calories: "330 per 100g",
    protein: "12.3%",
    fiber: "8.5%",
    richIn: ["Calcium", "Iron", "Magnesium"],
    healthBenefits: ["Bone health", "Diabetes control", "Energy boost"],
    cookingTime: "25-30 minutes",
    taste: "Nutty, earthy",
    bestFor: ["Breakfast", "Porridges", "Flour"],
  },
  "Pearl Millet": {
    tagline: "Protein powerhouse",
    calories: "363 per 100g",
    protein: "17.3%",
    fiber: "2.3%",
    richIn: ["Protein", "B vitamins", "Iron"],
    healthBenefits: ["Muscle building", "Energy", "Heart health"],
    cookingTime: "20-25 minutes",
    taste: "Mild, slightly sweet",
    bestFor: ["Meals", "Flour", "Porridges"],
  },
  "Foxtail Millet": {
    tagline: "Weight loss champion",
    calories: "331 per 100g",
    protein: "13.2%",
    fiber: "6.5%",
    richIn: ["Fiber", "Vitamin B6", "Phosphorus"],
    healthBenefits: ["Weight loss", "Digestion", "Low GI"],
    cookingTime: "20-25 minutes",
    taste: "Mild, pleasant",
    bestFor: ["Upma", "Porridges", "Flour"],
  },
  "Barnyard Millet": {
    tagline: "Diabetes management friend",
    calories: "325 per 100g",
    protein: "13.8%",
    fiber: "10.1%",
    richIn: ["Fiber", "Magnesium", "Zinc"],
    healthBenefits: ["Blood sugar control", "Weight loss", "Digestion"],
    cookingTime: "25-30 minutes",
    taste: "Nutty, earthy",
    bestFor: ["Meals", "Flour"],
  },
  "Little Millet": {
    tagline: "Nutrition in tiny package",
    calories: "329 per 100g",
    protein: "12.5%",
    fiber: "7.6%",
    richIn: ["Vitamin B1", "Phosphorus", "Magnesium"],
    healthBenefits: ["Weight loss", "Energy", "Digestion"],
    cookingTime: "15-20 minutes",
    taste: "Mild, sweet",
    bestFor: ["Rice-like meals", "Porridges"],
  },
};

// FAQ Database for Common Questions
const FAQ_DATABASE = [
  {
    pattern: /which millet.*weight loss|millet.*lose weight|best.*weight loss/i,
    response:
      "For weight loss, I recommend **Foxtail Millet**. It's high in fiber, has a low glycemic index, and keeps you feeling full. Other great options are Little Millet and Finger Millet. Start with 50-100g per day.",
    healthGoal: "weight_loss",
  },
  {
    pattern: /diabetic|diabetes|blood sugar|high blood sugar/i,
    response:
      "For diabetes control, **Barnyard Millet** is excellent with its low GI and high magnesium content. Foxtail Millet and Little Millet are also good choices. Aim for 100-150g per day.",
    healthGoal: "diabetes_control",
  },
  {
    pattern: /protein|muscle|strength|muscle building|gym/i,
    response:
      "For high protein diet, **Pearl Millet** is your best choice with 17.3% protein! Finger Millet and Foxtail Millet are also protein-rich. Consume 150-200g daily for fitness goals.",
    healthGoal: "high_protein",
  },
  {
    pattern: /gluten.*free|celiac|gluten.*sensitive|gluten.*allergy/i,
    response:
      "All millets are naturally **100% gluten-free**! Pearl Millet, Foxtail Millet, Proso Millet, and Barnyard Millet are all safe. They're perfect for celiac disease and gluten sensitivity.",
    healthGoal: "gluten_free",
  },
  {
    pattern: /digest|stomach|gut|ibs|constipation/i,
    response:
      "For digestive health, try **Foxtail Millet** or **Barnyard Millet** - both are high in fiber and prebiotics. Proso Millet is also easy to digest. 100-150g per day supports a healthy gut.",
    healthGoal: "digestion",
  },
  {
    pattern: /energy|stamina|fatigue|tired|exercise/i,
    response:
      "For energy and stamina, **Pearl Millet** is rich in B vitamins and iron. Finger Millet provides sustained energy release. Consume 150-200g daily for optimal energy levels.",
    healthGoal: "energy_boost",
  },
  {
    pattern: /heart|cholesterol|blood pressure|cardiovascular/i,
    response:
      "For heart health, **Finger Millet** is rich in magnesium and reduces cholesterol. Pearl Millet and Foxtail Millet are also heart-healthy. 100-150g per day supports cardiovascular health.",
    healthGoal: "heart_health",
  },
  {
    pattern: /how.*cook|cooking|recipe|prepare|preparation/i,
    response:
      "Most millets take 20-30 minutes to cook. Foxtail and Little Millets cook faster in 15-20 minutes. Popular ways: boil like rice, make upma, porridge, flour in baking, or sprouted. Would you like specific recipes?",
  },
  {
    pattern: /nutritional.*value|nutrition|calories|compare/i,
    response:
      "Millets are nutrient-dense! Pearl Millet has the most protein (17.3%), Barnyard Millet has the most fiber (10.1%). All are low GI, gluten-free, and rich in minerals. Would you like to compare specific millets?",
  },
  {
    pattern: /how much|quantity|serving|portion|daily/i,
    response:
      "General recommendation: 100-150g per day for most health goals. For weight loss: 50-100g. For protein/energy: 150-200g. Start with smaller portions and adjust based on your preference.",
  },
];

// Common conversational responses
const CONVERSATIONAL_RESPONSES = {
  greeting: [
    "Hello! 👋 I'm your millet health assistant. How can I help you today?",
    "Hi there! 🌾 I'm here to help you find the perfect millet for your health goals.",
    "Welcome! 🎯 Let's find the best millet for your needs.",
  ],
  help: [
    "I can help you:\n• Find millets for specific health goals\n• Answer nutrition questions\n• Recommend the best millet for you\n• Provide dietary advice\n\nWhat interests you?",
  ],
  unknown: [
    "I'm not sure about that. Let me help you with:\n• Weight loss recommendations\n• Diabetes management\n• High protein options\n• Digestive health\n• Heart health\n• Energy boost\n• Gluten-free choices",
  ],
};

/**
 * Match user input against FAQ patterns
 */
function matchFAQPattern(message) {
  const cleanMessage = String(message || "").toLowerCase().trim();

  for (const faq of FAQ_DATABASE) {
    if (faq.pattern.test(cleanMessage)) {
      return {
        type: "faq",
        response: faq.response,
        healthGoal: faq.healthGoal,
      };
    }
  }

  return null;
}

/**
 * Get random conversational response
 */
function getConversationalResponse(type) {
  const responses = CONVERSATIONAL_RESPONSES[type] || CONVERSATIONAL_RESPONSES.unknown;
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Extract health goal from user message
 */
function extractHealthGoal(message) {
  const cleanMessage = String(message || "").toLowerCase();

  const patterns = {
    weight_loss: /weight.*loss|slim|slim down|lose weight|fat loss|diet/i,
    diabetes_control: /diabetes|blood sugar|sugar level|diabetic/i,
    high_protein: /protein|muscle|gym|fitness|strength|body building/i,
    gluten_free: /gluten.*free|celiac|gluten.*sensitive/i,
    digestion: /digest|stomach|gut|ibs|bowel|constipation/i,
    heart_health: /heart|cholesterol|blood pressure|cardio|cardiovascular/i,
    energy_boost: /energy|stamina|fatigue|tired|exercise|workout/i,
  };

  for (const [goalId, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanMessage)) {
      return goalId;
    }
  }

  return null;
}

/**
 * Process chat message and generate response
 */
export async function processChat(message) {
  const cleanMessage = String(message || "").toLowerCase().trim();

  // Check for greeting
  if (/^(hi|hello|hey|greetings|thanks|thank you|hey there)$/i.test(cleanMessage)) {
    return {
      type: "greeting",
      message: getConversationalResponse("greeting"),
      suggestions: Object.values(HEALTH_GOALS).map((goal) => ({
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
      })),
    };
  }

  // Check for help request
  if (/^(help|assist|guide|how can you help|what can you do)$/i.test(cleanMessage)) {
    return {
      type: "help",
      message: getConversationalResponse("help"),
      suggestions: Object.values(HEALTH_GOALS).map((goal) => ({
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
      })),
    };
  }

  // Try to match FAQ patterns (rules-based)
  const faqMatch = matchFAQPattern(cleanMessage);
  if (faqMatch) {
    return {
      type: "answer",
      message: faqMatch.response,
      healthGoal: faqMatch.healthGoal,
    };
  }

  // Try to extract health goal and provide recommendations
  const extractedGoal = extractHealthGoal(cleanMessage);
  if (extractedGoal) {
    const goal = HEALTH_GOALS[extractedGoal];
    if (goal) {
      return {
        type: "recommendation",
        message: `Based on your interest in ${goal.name.toLowerCase()}, here are the best millets:\n\n${goal.millets
          .map((m) => `• **${m}**: ${MILLET_INFO[m]?.tagline || "Excellent choice"}`)
          .join("\n")}\n\n**Benefits:** ${goal.benefits.join(", ")}\n**Daily recommendation:** ${goal.recommendedQuantity}`,
        healthGoal: extractedGoal,
        millets: goal.millets,
        suggestions: goal.millets.map((m) => ({
          name: m,
          info: MILLET_INFO[m],
        })),
      };
    }
  }

  // Fallback for unknown query
  return {
    type: "unknown",
    message: getConversationalResponse("unknown"),
    suggestions: Object.values(HEALTH_GOALS).map((goal) => ({
      id: goal.id,
      name: goal.name,
      emoji: goal.emoji,
    })),
  };
}

/**
 * Get recommendations for a specific health goal
 */
export async function getHealthGoalRecommendation(goalId) {
  const goal = HEALTH_GOALS[goalId];
  if (!goal) {
    return {
      success: false,
      message: "Health goal not found",
    };
  }

  return {
    success: true,
    goal,
    millets: goal.millets.map((name) => ({
      name,
      info: MILLET_INFO[name],
    })),
  };
}

/**
 * Get millet information
 */
export async function getMilletInfo(milletName) {
  const millet = MILLET_INFO[milletName];
  if (!millet) {
    return {
      success: false,
      message: "Millet not found",
    };
  }

  return {
    success: true,
    name: milletName,
    info: millet,
  };
}

/**
 * Get all health goals
 */
export function getAllHealthGoals() {
  return Object.values(HEALTH_GOALS).map((goal) => ({
    id: goal.id,
    name: goal.name,
    emoji: goal.emoji,
    icon: goal.icon,
    description: goal.description,
    millets: goal.millets,
    benefits: goal.benefits,
  }));
}

/**
 * Find millets that match a query
 */
export async function searchMillets(query) {
  const cleanQuery = String(query || "").toLowerCase();

  return {
    success: true,
    results: Object.entries(MILLET_INFO)
      .filter(
        ([name, info]) =>
          name.toLowerCase().includes(cleanQuery) ||
          info.tagline.toLowerCase().includes(cleanQuery) ||
          info.healthBenefits.some((b) =>
            b.toLowerCase().includes(cleanQuery)
          ),
      )
      .map(([name, info]) => ({
        name,
        info,
      })),
  };
}

// ==================== NEW FEATURES ====================

// Recipes Database
const MILLET_RECIPES = {
  "Finger Millet": [
    {
      name: "Finger Millet Porridge",
      time: "20 mins",
      servings: 2,
      ingredients: ["Finger millet flour", "Milk", "Honey", "Ghee"],
      instructions: "Mix flour with water, cook until thick, add milk and honey",
      healthBenefits: ["Easy to digest", "High calcium", "Bone health"],
      calories: "150 per bowl",
    },
    {
      name: "Finger Millet Dosa",
      time: "30 mins",
      servings: 4,
      ingredients: ["Finger millet", "Rice", "Urad dal", "Salt"],
      instructions: "Soak, grind into batter, ferment, cook on griddle",
      healthBenefits: ["Protein-rich", "Crispy", "Tasty breakfast"],
      calories: "120 per dosa",
    },
  ],
  "Pearl Millet": [
    {
      name: "Pearl Millet Upma",
      time: "20 mins",
      servings: 3,
      ingredients: ["Pearl millet", "Onions", "Carrots", "Ginger", "Oil"],
      instructions: "Roast millet, add veggies, cook with water until fluffy",
      healthBenefits: ["High protein", "Energy boost", "Quick meal"],
      calories: "180 per plate",
    },
    {
      name: "Pearl Millet Khichdi",
      time: "25 mins",
      servings: 2,
      ingredients: ["Pearl millet", "Moong dal", "Vegetables", "Ghee"],
      instructions: "Pressure cook millet with dal and veggies, serve hot",
      healthBenefits: ["Easy digestion", "Light meal", "Comforting"],
      calories: "160 per bowl",
    },
  ],
  "Foxtail Millet": [
    {
      name: "Foxtail Millet Salad",
      time: "25 mins",
      servings: 2,
      ingredients: ["Foxtail millet", "Tomatoes", "Cucumber", "Lemon", "Herbs"],
      instructions: "Cook millet, cool, mix with fresh veggies and dressing",
      healthBenefits: ["Weight loss", "Low calorie", "Refreshing"],
      calories: "140 per serving",
    },
  ],
  "Barnyard Millet": [
    {
      name: "Barnyard Millet Rice",
      time: "15 mins",
      servings: 3,
      ingredients: ["Barnyard millet", "Coconut", "Ginger", "Turmeric"],
      instructions: "Boil until cooked, add tempering with mustard and curry leaves",
      healthBenefits: ["Low GI", "Blood sugar control", "Tasty"],
      calories: "170 per plate",
    },
  ],
};

// Allergy & Dietary Restrictions Database
const DIETARY_RESTRICTIONS = {
  gluten_free: {
    safe: ["Finger Millet", "Pearl Millet", "Foxtail Millet", "Barnyard Millet", "Little Millet", "Proso Millet"],
    warning: [],
    note: "All millets are naturally gluten-free",
  },
  vegan: {
    safe: ["All millets"],
    restrictions: "Use plant-based options instead of ghee/dairy",
    note: "Use vegetable oil instead of ghee",
  },
  low_carb: {
    safe: ["Foxtail Millet", "Little Millet"],
    caution: ["Pearl Millet", "Barnyard Millet"],
    note: "Foxtail has lowest carbs, 50-100g portion recommended",
  },
  dairy_free: {
    safe: "All millets",
    restrictions: "Avoid milk-based recipes",
    replacement: "Use plant milk (almond, coconut) instead",
  },
  nut_allergy: {
    safe: "All millets",
    note: "Check recipe ingredients for hidden nuts",
  },
};

// User Preferences Structure
const USER_PREFERENCES_TEMPLATE = {
  userId: "",
  healthGoals: [],
  dietaryRestrictions: [],
  allergies: [],
  favoriteMillets: [],
  weeklyMealPlan: [],
  shoppingList: [],
  lastUpdated: null,
  purchaseHistory: [],
};

// Meal Plans by Health Goal
const MEAL_PLANS = {
  weight_loss: [
    {
      day: "Monday",
      breakfast: "Foxtail Millet Salad (140 cal)",
      lunch: "Little Millet Upma with veggies (160 cal)",
      dinner: "Finger Millet Porridge with honey (150 cal)",
      totalCalories: "450 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Foxtail Millet Porridge (140 cal)",
      lunch: "Mixed millet salad (130 cal)",
      dinner: "Barnyard Millet Rice (170 cal)",
      totalCalories: "440 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Little Millet Flakes with milk (120 cal)",
      lunch: "Foxtail Millet Khichdi (150 cal)",
      dinner: "Finger Millet Dosa (110 cal)",
      totalCalories: "380 cal",
    },
  ],
  high_protein: [
    {
      day: "Monday",
      breakfast: "Pearl Millet Upma with egg (280 cal)",
      lunch: "Pearl Millet Khichdi (160 cal)",
      dinner: "Finger Millet Dosa (120 cal)",
      totalCalories: "560 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Pearl Millet Porridge with nuts (300 cal)",
      lunch: "Finger Millet with paneer curry (240 cal)",
      dinner: "Pearl Millet Salad (150 cal)",
      totalCalories: "690 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Finger Millet Dosa with sambhar (200 cal)",
      lunch: "Pearl Millet Rice with dal (220 cal)",
      dinner: "Foxtail Millet with chicken (250 cal)",
      totalCalories: "670 cal",
    },
  ],
  diabetes_control: [
    {
      day: "Monday",
      breakfast: "Barnyard Millet Porridge (150 cal)",
      lunch: "Foxtail Millet Rice (170 cal)",
      dinner: "Little Millet Upma (160 cal)",
      totalCalories: "480 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Finger Millet with cinnamon (140 cal)",
      lunch: "Barnyard Millet Salad (150 cal)",
      dinner: "Foxtail Millet Upma (160 cal)",
      totalCalories: "450 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Little Millet Porridge (130 cal)",
      lunch: "Barnyard Millet Rice (160 cal)",
      dinner: "Finger Millet Khichdi (150 cal)",
      totalCalories: "440 cal",
    },
  ],
  digestion: [
    {
      day: "Monday",
      breakfast: "Proso Millet Porridge with banana (160 cal)",
      lunch: "Foxtail Millet Rice with ghee (170 cal)",
      dinner: "Barnyard Millet Khichdi (150 cal)",
      totalCalories: "480 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Finger Millet Dosa (140 cal)",
      lunch: "Proso Millet Upma (160 cal)",
      dinner: "Foxtail Millet with yogurt (120 cal)",
      totalCalories: "420 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Barnyard Millet Porridge (150 cal)",
      lunch: "Proso Millet Rice (170 cal)",
      dinner: "Little Millet Khichdi (140 cal)",
      totalCalories: "460 cal",
    },
  ],
  heart_health: [
    {
      day: "Monday",
      breakfast: "Finger Millet Porridge with almonds (180 cal)",
      lunch: "Pearl Millet Rice with turmeric (190 cal)",
      dinner: "Foxtail Millet Salad with olive oil (160 cal)",
      totalCalories: "530 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Pearl Millet Upma with ginger (170 cal)",
      lunch: "Finger Millet with vegetables (180 cal)",
      dinner: "Foxtail Millet Rice (170 cal)",
      totalCalories: "520 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Foxtail Millet with berries (150 cal)",
      lunch: "Pearl Millet Khichdi (160 cal)",
      dinner: "Finger Millet Porridge (150 cal)",
      totalCalories: "460 cal",
    },
  ],
  energy_boost: [
    {
      day: "Monday",
      breakfast: "Pearl Millet with honey and nuts (250 cal)",
      lunch: "Pearl Millet Upma with vegetables (220 cal)",
      dinner: "Sorghum Rice with dal (200 cal)",
      totalCalories: "670 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Finger Millet Porridge with jaggery (240 cal)",
      lunch: "Pearl Millet Rice (220 cal)",
      dinner: "Sorghum with chicken curry (240 cal)",
      totalCalories: "700 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Pearl Millet Salad (200 cal)",
      lunch: "Sorghum Upma (220 cal)",
      dinner: "Finger Millet with paneer (240 cal)",
      totalCalories: "660 cal",
    },
  ],
  gluten_free: [
    {
      day: "Monday",
      breakfast: "Pearl Millet Porridge (150 cal)",
      lunch: "Foxtail Millet Rice (160 cal)",
      dinner: "Barnyard Millet Salad (140 cal)",
      totalCalories: "450 cal",
    },
    {
      day: "Tuesday",
      breakfast: "Proso Millet Upma (140 cal)",
      lunch: "Pearl Millet Khichdi (150 cal)",
      dinner: "Foxtail Millet Porridge (130 cal)",
      totalCalories: "420 cal",
    },
    {
      day: "Wednesday",
      breakfast: "Barnyard Millet Dosa (130 cal)",
      lunch: "Proso Millet Rice (160 cal)",
      dinner: "Pearl Millet Salad (140 cal)",
      totalCalories: "430 cal",
    },
  ],
};

/**
 * Get recipes for a millet
 */
export async function getRecipes(milletName) {
  const recipes = MILLET_RECIPES[milletName];
  if (!recipes) {
    return {
      success: false,
      message: `No recipes found for ${milletName}`,
    };
  }

  return {
    success: true,
    millet: milletName,
    recipes: recipes.map((recipe) => ({
      name: recipe.name,
      cookingTime: recipe.time,
      servings: recipe.servings,
      calories: recipe.calories,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      healthBenefits: recipe.healthBenefits,
    })),
  };
}

/**
 * Calculate Health Score based on current diet
 */
export async function calculateHealthScore(userDiet) {
  const score = {
    score: 65,
    grade: "Good",
    breakdown: {
      varietyScore: 60,
      nutrientScore: 75,
      calorieScore: 70,
      proteinScore: 65,
    },
    recommendations: [
      "Include more high-protein millets (Pearl Millet)",
      "Add fiber-rich millets (Foxtail) for digestion",
      "Reduce overall portion size for weight loss",
    ],
  };
  return { success: true, ...score };
}

/**
 * Check dietary restrictions and allergies
 */
export async function checkDietaryRestrictions(restrictions) {
  if (!restrictions || restrictions.length === 0) {
    return {
      success: true,
      message: "All millets are safe for you!",
      safeMillets: Object.keys(MILLET_INFO),
      warnings: [],
    };
  }

  const allSafe = new Set();
  const warnings = [];

  restrictions.forEach((restriction) => {
    const info = DIETARY_RESTRICTIONS[restriction.toLowerCase()];
    if (info) {
      if (Array.isArray(info.safe)) {
        info.safe.forEach((m) => allSafe.add(m));
      } else {
        Object.keys(MILLET_INFO).forEach((m) => allSafe.add(m));
      }

      if (info.warning) warnings.push(info.warning);
      if (info.note) warnings.push(info.note);
    }
  });

  return {
    success: true,
    restrictions: restrictions,
    safeMillets: Array.from(allSafe),
    warnings: warnings,
  };
}

/**
 * Generate shopping list
 */
export async function generateShoppingList(healthGoal, days = 7) {
  const goal = HEALTH_GOALS[healthGoal];
  if (!goal) {
    return { success: false, message: "Health goal not found" };
  }

  const shoppingList = goal.millets.map((millet) => ({
    item: millet,
    quantity: days * 100 + "g",
    estimatedPrice: Math.floor(Math.random() * 200 + 100),
    priority: "High",
    healthBenefit: goal.benefits[0],
  }));

  // Add common accompaniments
  shoppingList.push(
    { item: "Vegetables (Onion, Tomato)", quantity: "1kg", estimatedPrice: 60, priority: "High" },
    { item: "Cooking Oil/Ghee", quantity: "500ml", estimatedPrice: 200, priority: "Medium" },
    { item: "Salt & Spices", quantity: "As needed", estimatedPrice: 100, priority: "Medium" }
  );

  const totalEstimatedBudget = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);

  return {
    success: true,
    healthGoal: goal.name,
    duration: `${days} days`,
    shoppingList,
    totalEstimatedBudget: `₹${totalEstimatedBudget}`,
    savings: "Buy from farmers for 20-30% discount",
  };
}

/**
 * Get meal plan for health goal
 */
export async function getMealPlan(healthGoal) {
  const plan = MEAL_PLANS[healthGoal];
  if (!plan) {
    return {
      success: false,
      message: `No meal plan for ${healthGoal}`,
    };
  }

  return {
    success: true,
    healthGoal: HEALTH_GOALS[healthGoal]?.name || healthGoal,
    mealPlan: plan,
    tips: [
      "Drink plenty of water",
      "Exercise regularly",
      "Maintain consistent meal times",
      "Monitor your health metrics",
    ],
  };
}

/**
 * Compare nutrition between multiple millets
 */
export async function compareMillets(milletNames = []) {
  // If no millets specified, return default comparison
  if (!milletNames || milletNames.length === 0) {
    milletNames = ["Pearl Millet", "Foxtail Millet", "Finger Millet"];
  }

  // Limit to 3 millets for comparison
  milletNames = milletNames.slice(0, 3);

  const comparison = {
    success: true,
    millets: [],
    metrics: [
      "calories",
      "protein",
      "fiber",
      "richIn"
    ]
  };

  milletNames.forEach((name) => {
    const millet = MILLET_INFO[name];
    if (millet) {
      comparison.millets.push({
        name: name,
        tagline: millet.tagline,
        calories: millet.calories,
        protein: millet.protein,
        fiber: millet.fiber,
        richIn: millet.richIn,
        healthBenefits: millet.healthBenefits,
        cookingTime: millet.cookingTime,
        taste: millet.taste,
        bestFor: millet.bestFor,
      });
    }
  });

  if (comparison.millets.length === 0) {
    return {
      success: false,
      message: "No valid millets found for comparison"
    };
  }

  // Add summary insights
  comparison.insights = {
    highestProtein: comparison.millets.reduce((prev, current) => {
      const prevProtein = parseFloat(prev.protein);
      const currProtein = parseFloat(current.protein);
      return prevProtein > currProtein ? prev : current;
    }),
    highestFiber: comparison.millets.reduce((prev, current) => {
      const prevFiber = parseFloat(prev.fiber);
      const currFiber = parseFloat(current.fiber);
      return prevFiber > currFiber ? prev : current;
    }),
    lowestCalories: comparison.millets.reduce((prev, current) => {
      const prevCal = parseFloat(prev.calories);
      const currCal = parseFloat(current.calories);
      return prevCal < currCal ? prev : current;
    })
  };

  return comparison;
}

/**
 * Track expense and savings
 */
export async function trackExpense(purchase) {
  // Calculate savings vs market price
  const marketPrice = purchase.quantity * 150; // Assumed market rate
  const savings = marketPrice - (purchase.quantity * purchase.pricePerKg);

  return {
    success: true,
    purchase: {
      ...purchase,
      purchaseDate: new Date().toISOString(),
    },
    savings: {
      amount: savings,
      percentage: ((savings / marketPrice) * 100).toFixed(1),
      comparison: "vs average market price",
    },
    monthlyBudget: {
      spent: purchase.quantity * purchase.pricePerKg,
      budget: 3000,
      remaining: 3000 - (purchase.quantity * purchase.pricePerKg),
    },
  };
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(userId, preferences) {
  const userPref = {
    ...USER_PREFERENCES_TEMPLATE,
    userId,
    ...preferences,
    lastUpdated: new Date().toISOString(),
  };

  // In production, save to Firestore
  // await getFirestore().collection('user_preferences').doc(userId).set(userPref);

  return {
    success: true,
    message: "Preferences saved successfully",
    preferences: userPref,
  };
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId) {
  // In production, fetch from Firestore
  return {
    success: true,
    preferences: {
      ...USER_PREFERENCES_TEMPLATE,
      userId,
    },
  };
}
