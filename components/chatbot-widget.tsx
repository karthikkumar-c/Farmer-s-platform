"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { buildBackendUrl } from "@/lib/api"

interface Message {
  id: string
  type: "user" | "bot"
  text: string
  timestamp: Date
  suggestions?: Array<{ id?: string; name: string; emoji?: string }>
  millets?: Array<{ name: string; info: any }>
}

interface HealthGoal {
  id: string
  name: string
  emoji: string
  icon: string
  description: string
  millets: string[]
  benefits: string[]
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "recipes" | "mealplan" | "comparison">("chat")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedMillets, setSelectedMillets] = useState<string[]>([])
  const [comparisonResult, setComparisonResult] = useState<any>(null)

  // Fetch health goals on mount
  useEffect(() => {
    if (isOpen && healthGoals.length === 0) {
      fetchHealthGoals()
    }
  }, [isOpen, healthGoals.length])

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "bot",
          text: "Hello! 👋 I'm your millet health assistant. How can I help you find the perfect millet for your health goals?",
          timestamp: new Date(),
          suggestions: healthGoals.map((goal) => ({
            id: goal.id,
            name: goal.name,
            emoji: goal.emoji,
          })),
        },
      ])
    }
  }, [isOpen, healthGoals])

  async function fetchHealthGoals() {
    try {
      const response = await fetch(buildBackendUrl("/api/chatbot/health-goals"))
      const data = await response.json()
      if (data.success) {
        setHealthGoals(data.goals)
      }
    } catch (error) {
      console.error("Error fetching health goals:", error)
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(buildBackendUrl("/api/chatbot/message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      if (data.success && data.response) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: data.response.message,
          timestamp: new Date(),
          suggestions: data.response.suggestions || [],
          millets: data.response.suggestions || [],
        }
        setMessages((prev) => [...prev, botResponse])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleHealthGoalClick(goalId: string) {
    const userGoalClick: Message = {
      id: Date.now().toString(),
      type: "user",
      text:
        healthGoals.find((g) => g.id === goalId)?.name ||
        "Selected a health goal",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userGoalClick])
    setLoading(true)

    try {
      const response = await fetch(
        buildBackendUrl(`/api/chatbot/health-goals/${goalId}`)
      )
      const data = await response.json()

      if (data.success && data.goal) {
        const goal = data.goal
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: `Great! For **${goal.name}**, I recommend these millets:

${goal.millets.map((m: string) => `• **${m}**`).join("\n")}

**Key Benefits:** ${goal.benefits.join(", ")}

**Daily Recommendation:** ${goal.recommendedQuantity}

Which millet interests you? I can provide more detailed nutrition information.`,
          timestamp: new Date(),
          suggestions: goal.millets.map((millet: string) => ({
            name: millet,
          })),
        }
        setMessages((prev) => [...prev, botResponse])
      }
    } catch (error) {
      console.error("Error fetching health goal:", error)
      toast.error("Failed to load health goal information")
    } finally {
      setLoading(false)
    }
  }

  async function handleMilletClick(milletName: string) {
    const userClick: Message = {
      id: Date.now().toString(),
      type: "user",
      text: `Tell me more about ${milletName}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userClick])
    setLoading(true)

    try {
      const response = await fetch(
        buildBackendUrl(`/api/chatbot/millet/${encodeURIComponent(milletName)}`)
      )
      const data = await response.json()

      if (data.success && data.info) {
        const info = data.info
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: `## ${milletName}\n${info.tagline}\n\n**Nutrition per 100g:**\n• Calories: ${info.calories}\n• Protein: ${info.protein}\n• Fiber: ${info.fiber}\n\n**Rich in:** ${info.richIn.join(", ")}\n\n**Health Benefits:** ${info.healthBenefits.join(", ")}\n\n**Best for:** ${info.bestFor.join(", ")}\n\n**Cooking time:** ${info.cookingTime}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
      }
    } catch (error) {
      console.error("Error fetching millet info:", error)
      toast.error("Failed to load millet information")
    } finally {
      setLoading(false)
    }
  }

  async function getRecipesForMillet(milletName: string) {
    console.log("Fetching recipes for:", milletName)
    setErrorMessage(null)
    setLoading(true)
    try {
      const url = buildBackendUrl(`/api/chatbot/recipes/${encodeURIComponent(milletName)}`)
      console.log("Fetching from:", url)
      const response = await fetch(url)
      const data = await response.json()
      console.log("Recipe response:", data)

      if (data.success && data.recipes && data.recipes.length > 0) {
        const recipeText = data.recipes
          .map(
            (recipe: any) =>
              `**${recipe.name}** (${recipe.cookingTime})\n• Servings: ${recipe.servings}\n• Calories: ${recipe.calories}\n• Ingredients: ${recipe.ingredients.join(", ")}\n• Benefits: ${recipe.healthBenefits.join(", ")}`
          )
          .join("\n\n")

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: `## Recipes for ${milletName}\n\n${recipeText}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        console.log("Recipe message added")
      } else {
        const errorMsg = data.message || `No recipes found for ${milletName}`
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        console.log("No recipes in response:", data)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("Error fetching recipes:", error)
      setErrorMessage(`Failed to load recipes: ${errorMsg}`)
      toast.error("Failed to load recipes. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  async function getMealPlanForGoal(goalId: string) {
    console.log("Fetching meal plan for goal:", goalId)
    setErrorMessage(null)
    setLoading(true)
    try {
      const response = await fetch(
        buildBackendUrl(`/api/chatbot/meal-plan/${goalId}`)
      )
      const data = await response.json()
      console.log("Meal plan response:", data)

      if (data.success && data.mealPlan && data.mealPlan.length > 0) {
        const planText = data.mealPlan
          .map(
            (day: any) =>
              `**${day.day}**\n• Breakfast: ${day.breakfast}\n• Lunch: ${day.lunch}\n• Dinner: ${day.dinner}\n• Total: ${day.totalCalories}`
          )
          .join("\n\n")

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: `## Weekly Meal Plan for ${data.healthGoal}\n\n${planText}\n\n✅ **Tips:**\n${data.tips.map((tip: string) => `• ${tip}`).join("\n")}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
      } else {
        const errorMsg = data.message || "No meal plan available"
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("Error fetching meal plan:", error)
      setErrorMessage(`Failed: ${errorMsg}`)
      toast.error("Error: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function compareMilletsHandler() {
    console.log("Comparing millets:", selectedMillets)
    setErrorMessage(null)
    setComparisonResult(null)
    setLoading(true)
    try {
      const response = await fetch(buildBackendUrl("/api/chatbot/compare"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ millets: selectedMillets.length > 0 ? selectedMillets : undefined }),
      })
      const data = await response.json()
      console.log("Comparison response:", data, "Status:", response.status)

      if (!response.ok) {
        const errorMsg = data.message || `Request failed with status ${response.status}`
        console.error("API error:", errorMsg)
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        return
      }

      if (data.success && data.millets && data.millets.length > 0) {
        setComparisonResult(data)
        console.log("Comparison successful")
      } else {
        const errorMsg = data.message || "Failed to compare millets"
        console.error("Comparison failed:", errorMsg)
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("Error comparing millets:", error)
      setErrorMessage(`Failed to compare: ${errorMsg}`)
      toast.error("Error: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  function toggleMilletSelection(milletName: string) {
    setSelectedMillets((prev) => {
      if (prev.includes(milletName)) {
        return prev.filter((m) => m !== milletName)
      } else {
        if (prev.length < 3) {
          return [...prev, milletName]
        }
        return prev
      }
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 animate-bounce"
          title="Chat with health assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Dialog - Fixed Position, Non-Overlapping */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Panel */}
          <div className="fixed bottom-0 right-0 w-full md:w-[420px] md:bottom-6 md:right-6 h-screen md:h-[650px] bg-white rounded-none md:rounded-lg shadow-2xl border-t md:border border-gray-200 flex flex-col z-50 md:animate-in md:slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-none md:rounded-t-lg flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Millet Health Coach</h3>
                  <p className="text-xs text-green-100">AI-powered recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-md transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Feature Tabs */}
            <div className="flex gap-1 px-3 pt-3 border-b border-gray-200 flex-shrink-0 bg-gray-50 overflow-x-auto">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-2 text-xs font-medium rounded-t transition whitespace-nowrap ${
                  activeTab === "chat"
                    ? "bg-white text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab("recipes")}
                className={`px-3 py-2 text-xs font-medium rounded-t transition whitespace-nowrap ${
                  activeTab === "recipes"
                    ? "bg-white text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                🍳 Recipes
              </button>
              <button
                onClick={() => setActiveTab("mealplan")}
                className={`px-3 py-2 text-xs font-medium rounded-t transition whitespace-nowrap ${
                  activeTab === "mealplan"
                    ? "bg-white text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                🍽️ Meals
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-3 py-2 text-xs font-medium rounded-t transition whitespace-nowrap ${
                  activeTab === "comparison"
                    ? "bg-white text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                🥗 Compare
              </button>
            </div>

            {/* Messages Area - Chat Tab */}
            {activeTab === "chat" && (
              <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          message.type === "user"
                            ? "bg-green-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {message.text
                          .split("\n")
                          .map((line: string, idx: number) => (
                            <div key={idx} className="whitespace-pre-wrap break-words">
                              {line
                                .split(/\*\*(.*?)\*\//g)
                                .map((part: string, i: number) =>
                                  i % 2 === 1 ? (
                                    <strong key={i}>{part}</strong>
                                  ) : (
                                    part
                                  )
                                )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 px-2">
                        {message.suggestions.map(
                          (
                            suggestion: { id?: string; name: string; emoji?: string },
                            idx: number
                          ) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (suggestion.id) {
                                  handleHealthGoalClick(suggestion.id)
                                } else {
                                  handleMilletClick(suggestion.name)
                                }
                              }}
                              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition whitespace-nowrap"
                            >
                              {suggestion.emoji} {suggestion.name}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-gray-500 text-sm px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </ScrollArea>
            )}

            {/* Recipes Tab */}
            {activeTab === "recipes" && (
              <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-3">
                  <p className="font-semibold mb-2">Select a millet to see recipes:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Pearl Millet", "Finger Millet", "Foxtail Millet", "Barnyard Millet"].map((millet) => (
                      <button
                        key={millet}
                        onClick={() => {
                          console.log("🍳 Recipes button clicked for:", millet)
                          getRecipesForMillet(millet)
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition disabled:opacity-50"
                      >
                        🍳 {millet}
                      </button>
                    ))}
                  </div>
                </div>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                    ⚠️ {errorMessage}
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading recipes...
                  </div>
                )}
                {messages.length > 0 && !errorMessage && (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm whitespace-pre-wrap break-words">
                    {messages.slice().reverse().find((m) => m.text.includes("Recipes"))?.text || "Click a millet to see recipes"}
                  </div>
                )}
              </ScrollArea>
            )}

            {/* Meal Plan Tab */}
            {activeTab === "mealplan" && (
              <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-3">
                  <p className="font-semibold mb-2">Get meal plan for:</p>
                  <div className="flex flex-wrap gap-2">
                    {healthGoals.slice(0, 4).map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => {
                          console.log("🍽️ Meal Plan button clicked for:", goal.name)
                          getMealPlanForGoal(goal.id)
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition disabled:opacity-50"
                      >
                        🍽️ {goal.name}
                      </button>
                    ))}
                  </div>
                </div>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                    ⚠️ {errorMessage}
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating meal plan...
                  </div>
                )}
                {messages.length > 0 && !errorMessage && (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm whitespace-pre-wrap break-words">
                    {messages.slice().reverse().find((m) => m.text.includes("Meal Plan"))?.text || "Click a health goal for meal plan"}
                  </div>
                )}
              </ScrollArea>
            )}

            {/* Comparison Tab */}
            {activeTab === "comparison" && (
              <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-semibold mb-3">Select millets to compare (up to 3):</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {["Pearl Millet", "Finger Millet", "Foxtail Millet", "Barnyard Millet", "Little Millet", "Proso Millet"].map((millet) => (
                      <button
                        key={millet}
                        onClick={() => toggleMilletSelection(millet)}
                        className={`px-3 py-2 text-xs rounded-lg border-2 transition ${
                          selectedMillets.includes(millet)
                            ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                        } ${selectedMillets.length >= 3 && !selectedMillets.includes(millet) ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={selectedMillets.length >= 3 && !selectedMillets.includes(millet)}
                      >
                        {selectedMillets.includes(millet) ? "✓ " : ""}{millet}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={compareMilletsHandler}
                    disabled={loading || selectedMillets.length === 0}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition disabled:opacity-50 font-medium"
                  >
                    {loading ? "Comparing..." : selectedMillets.length > 0 ? `🥗 Compare ${selectedMillets.length} Millets` : "Select millets first"}
                  </button>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {loading && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Comparing millets...
                  </div>
                )}

                {comparisonResult && !errorMessage && (
                  <div className="space-y-4">
                    {/* Comparison Table */}
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-green-50 border-b">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Millet</th>
                            <th className="px-3 py-2 text-left font-semibold">Calories</th>
                            <th className="px-3 py-2 text-left font-semibold">Protein</th>
                            <th className="px-3 py-2 text-left font-semibold">Fiber</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonResult.millets.map((millet: any, idx: number) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="px-3 py-2 font-medium">{millet.name}</td>
                              <td className="px-3 py-2">{millet.calories}</td>
                              <td className="px-3 py-2">{millet.protein}</td>
                              <td className="px-3 py-2">{millet.fiber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Detailed Info */}
                    <div className="space-y-3">
                      {comparisonResult.millets.map((millet: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gradient-to-br from-green-50 to-white">
                          <h3 className="font-semibold text-green-700 mb-2">🌾 {millet.name}</h3>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p><strong>Tagline:</strong> {millet.tagline}</p>
                            <p><strong>Rich in:</strong> {millet.richIn.join(", ")}</p>
                            <p><strong>Benefits:</strong> {millet.healthBenefits.join(", ")}</p>
                            <p><strong>Cooking:</strong> {millet.cookingTime} • Taste: {millet.taste}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Insights */}
                    {comparisonResult.insights && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Insights</h4>
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>🥊 <strong>Highest Protein:</strong> {comparisonResult.insights.highestProtein.name}</p>
                          <p>🌊 <strong>Highest Fiber:</strong> {comparisonResult.insights.highestFiber.name}</p>
                          <p>⚡ <strong>Lowest Calories:</strong> {comparisonResult.insights.lowestCalories.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}

            {/* Input Area - Only for Chat Tab */}
            {activeTab === "chat" && (
              <div className="border-t p-4 space-y-3 flex-shrink-0 bg-white rounded-none md:rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ask about millets..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    disabled={loading}
                    className="text-sm flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Powered by AI • 24/7 Support
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
