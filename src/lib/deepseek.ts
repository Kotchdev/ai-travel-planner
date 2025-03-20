import { ItineraryInput, Itinerary } from "../types/itinerary";
import axios from "axios";

// Generate a prompt for the DeepSeek API
export function generatePrompt(input: ItineraryInput): string {
  const {
    destination,
    startDate,
    endDate,
    budget,
    interests,
    userId,
    additionalInfo,
  } = input;

  // Personalized introduction based on user ID
  const intro = userId
    ? "You are an expert travel planner creating a personalized itinerary for a user with specific preferences."
    : "You are an expert travel planner.";

  // Budget-specific instructions
  const budgetInstructions =
    budget === "Luxury"
      ? "\nThis is a LUXURY itinerary. Include high-end restaurants (with Michelin stars if available), 5-star hotels, exclusive experiences, and VIP services. Focus on premium locations and unique, expensive activities."
      : budget === "Budget"
      ? "\nThis is a BUDGET itinerary. Focus on free attractions, affordable local restaurants, public transportation, and budget-friendly accommodations. Include money-saving tips."
      : "\nThis is a MODERATE budget itinerary. Balance cost with experience. Include mid-range restaurants, comfortable hotels, and a mix of paid and free attractions.";

  // Schedule preferences text
  const schedulePreferences = additionalInfo
    ? `\nSCHEDULE PREFERENCES: ${additionalInfo}\nPlease adjust the daily schedules according to these timing preferences.`
    : "";

  return `${intro}

Create a detailed travel itinerary for a trip to ${destination} 
from ${startDate} to ${endDate} with a ${budget} budget.${budgetInstructions}

The traveler is interested in: ${interests.join(", ")}.
${schedulePreferences}
${
  userId
    ? "\nThis user has used your service before and prefers their itineraries to include their selected interests and budget preferences. Please prioritize these preferences in your recommendations."
    : ""
}

For each day, provide a detailed schedule including:
1. Morning activities with specific venues and times:
   - Breakfast recommendations at actual restaurants
   - Morning attractions or activities
2. Lunch recommendations at specific restaurants
3. Afternoon activities with exact locations
4. Dinner recommendations at budget-appropriate restaurants
5. Evening activities or entertainment options

For EACH activity, you MUST include:
- Specific venue name (e.g., "The Louvre Museum" not just "museum")
- Exact location or address
- Detailed description including what to see/do
- Precise costs in local currency
- Realistic duration including travel time
- Type of activity (hotel, restaurant, attraction, transportation)
- Relevant tags (e.g., "art", "history", "fine-dining")

IMPORTANT REQUIREMENTS:
1. All venues must be real places that exist
2. All costs must be accurate and current
3. All times must be realistic including travel time
4. All activities must match the budget level
5. Activities should align with the user's interests
6. Include specific exhibits, dishes, or experiences at each venue
7. Consider opening hours and seasonal availability
8. Add transportation details between venues

The response MUST be in valid JSON format with this structure:
{
  "destination": "Full City Name, Country",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "overview": "Detailed overview with specific districts and seasonal information",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "startTime": "09:00 AM",
      "endTime": "10:00 PM",
      "activities": [
        {
          "id": "unique_id",
          "name": "Full Name of Venue/Activity",
          "type": "hotel|restaurant|attraction|transportation",
          "time": "09:00 AM",
          "description": "Detailed description with specific highlights",
          "estimatedTime": "2 hours (including 15 min travel time)",
          "cost": "Exact cost in local currency",
          "location": "Full address or specific location details",
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ],
  "budget": "Detailed budget breakdown with specific costs",
  "tips": ["Specific, actionable tips with location names and exact costs"]
}`;
}

// Process the response from DeepSeek API
export function processResponse(response: string): Itinerary {
  try {
    // Look for JSON content within the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try to parse the full response
    return JSON.parse(response);
  } catch (error) {
    console.error("Error parsing response:", error);
    console.log("Raw response:", response);

    // If JSON parsing fails, create a basic structure
    const fallbackItinerary: Itinerary = {
      destination: "Unknown",
      startDate: "Unknown",
      endDate: "Unknown",
      days: [],
      budget: "Information not available",
      overview:
        "We couldn't generate a proper itinerary. Please try again with different parameters.",
      tips: [
        "Try selecting different interests",
        "Consider a different destination or date range",
      ],
    };

    // Try to extract some information if possible
    const lines = response.split("\n");

    // Extract destination if possible
    const destinationLine = lines.find(
      (line) => line.includes("DESTINATION") || line.includes("destination")
    );
    if (destinationLine) {
      const match = destinationLine.match(/:\s*(.*)/);
      if (match) fallbackItinerary.destination = match[1].trim();
    }

    return fallbackItinerary;
  }
}

// Main function to call DeepSeek API and generate itinerary
export async function generateItinerary(
  input: ItineraryInput
): Promise<Itinerary> {
  // First, try to use DeepSeek API
  try {
    const prompt = generatePrompt(input);

    // Check if the DEEPSEEK_API_KEY is available
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn("DEEPSEEK_API_KEY is not defined, using fallback generator");
      return generateFallbackItinerary(input);
    }

    const response = await axios.post(
      "https://api.deepinfra.com/v1/openai/chat/completions",
      {
        model: "deepseek-coder-33b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a travel planning assistant that helps create detailed itineraries. ALWAYS respond with VALID JSON only, no other text. The JSON must match the structure shown in the user's prompt.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 60000, // 60 second timeout
      }
    );

    // Extract the response from DeepSeek API
    const generatedText = response.data.choices[0].message.content;
    console.log("Successful response from DeepSeek API");

    // Process and structure the response
    return processResponse(generatedText);
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);

    if (axios.isAxiosError(error)) {
      console.error(
        "API Error Details:",
        error.response?.data || error.message
      );

      // Check if we need to retry with a fallback - using optional chaining
      if (
        error.code === "ECONNABORTED" ||
        error.response?.status === 429 ||
        (error.response?.status ?? 0) >= 500
      ) {
        console.log("API error encountered, using fallback generator");
        return generateFallbackItinerary(input);
      }
    }

    // Use fallback for all errors
    console.log("Unknown error, using fallback generator");
    return generateFallbackItinerary(input);
  }
}

// Fallback function to generate a placeholder itinerary when the API fails
export async function generateFallbackItinerary(
  input: ItineraryInput
): Promise<Itinerary> {
  const { destination, startDate, endDate, budget, interests } = input;

  // Budget-specific activities
  const getBudgetSpecificActivity = () => {
    switch (budget) {
      case "Luxury":
        return {
          morning: {
            id: "luxury-morning-tour",
            name: "Private City Tour with Expert Guide",
            type: "attraction" as const,
            time: "09:00 AM",
            description: `Exclusive guided tour of ${destination}'s highlights with a certified historian, including skip-the-line access to major attractions`,
            estimatedTime: "3 hours",
            cost: "$300 per person",
            location: "Hotel Pickup Service",
            tags: ["luxury", "guided-tour", "private"],
          },
          lunch: {
            id: "luxury-lunch",
            name: "Michelin-Starred Dining Experience",
            type: "restaurant" as const,
            time: "12:30 PM",
            description:
              "Exquisite tasting menu at a prestigious Michelin-starred restaurant",
            estimatedTime: "2 hours",
            cost: "$200-300 per person",
            location: "Fine Dining District",
            tags: ["luxury", "fine-dining", "michelin-star"],
          },
          afternoon: {
            id: "luxury-shopping",
            name: "VIP Shopping Experience",
            type: "attraction" as const,
            time: "03:00 PM",
            description: "Personal shopping assistant at luxury boutiques",
            estimatedTime: "3 hours",
            cost: "Variable (luxury goods)",
            location: "Premium Shopping District",
            tags: ["luxury", "shopping", "vip-service"],
          },
        };
      case "Budget":
        return {
          morning: {
            id: "budget-morning-tour",
            name: "Free Walking Tour",
            type: "attraction" as const,
            time: "09:00 AM",
            description: `Explore ${destination}'s highlights with a local guide (tip-based)`,
            estimatedTime: "2.5 hours",
            cost: "Free (suggested tip: $10-15)",
            location: "Main Square Meeting Point",
            tags: ["budget", "walking-tour", "guided"],
          },
          lunch: {
            id: "budget-lunch",
            name: "Local Street Food Experience",
            type: "restaurant" as const,
            time: "12:00 PM",
            description: "Sample authentic street food from local vendors",
            estimatedTime: "1 hour",
            cost: "$5-10 per person",
            location: "Food Market District",
            tags: ["budget", "local-food", "street-food"],
          },
          afternoon: {
            id: "budget-museum",
            name: "Self-Guided Museum Tour",
            type: "attraction" as const,
            time: "02:00 PM",
            description: "Visit during free/reduced admission hours",
            estimatedTime: "2 hours",
            cost: "Free - $10",
            location: "City Museum",
            tags: ["budget", "culture", "self-guided"],
          },
        };
      default: // Moderate
        return {
          morning: {
            id: "moderate-morning-tour",
            name: "Guided Group Tour",
            type: "attraction" as const,
            time: "09:30 AM",
            description: `Comprehensive tour of ${destination}'s main attractions`,
            estimatedTime: "2.5 hours",
            cost: "$45 per person",
            location: "Tourist Information Center",
            tags: ["moderate", "guided-tour", "group"],
          },
          lunch: {
            id: "moderate-lunch",
            name: "Mid-Range Restaurant Experience",
            type: "restaurant" as const,
            time: "12:30 PM",
            description: "Quality local cuisine in a comfortable setting",
            estimatedTime: "1.5 hours",
            cost: "$25-40 per person",
            location: "Restaurant District",
            tags: ["moderate", "local-food", "casual-dining"],
          },
          afternoon: {
            id: "moderate-cultural",
            name: "Cultural Site Visit",
            type: "attraction" as const,
            time: "02:30 PM",
            description: "Explore major cultural attractions",
            estimatedTime: "2 hours",
            cost: "$20-30 entrance fee",
            location: "Historic Center",
            tags: ["moderate", "culture", "history"],
          },
        };
    }
  };

  const activities = getBudgetSpecificActivity();

  // Budget-specific overview
  const getBudgetOverview = () => {
    switch (budget) {
      case "Luxury":
        return `${destination} offers world-class luxury experiences, from Michelin-starred restaurants to exclusive shopping districts. This itinerary features VIP tours, premium accommodations, and high-end dining venues perfect for the discerning traveler interested in ${interests.join(
          ", "
        )}.`;
      case "Budget":
        return `${destination} can be thoroughly enjoyed on a budget, with numerous free attractions, affordable local eateries, and efficient public transportation. This itinerary focuses on authentic experiences and smart money-saving opportunities while exploring ${interests.join(
          ", "
        )}.`;
      default:
        return `${destination} provides a perfect balance of quality experiences at moderate prices. This itinerary combines comfortable accommodations, good restaurants, and key attractions, ideal for travelers interested in ${interests.join(
          ", "
        )}.`;
    }
  };

  // Create a placeholder itinerary with budget-specific details
  const placeholderItinerary: Itinerary = {
    destination: destination,
    startDate: startDate,
    endDate: endDate,
    budget: `${budget} range - ${
      budget === "Luxury"
        ? "Expect to spend $500+ per day"
        : budget === "Budget"
        ? "Expect to spend $50-100 per day"
        : "Expect to spend $100-300 per day"
    }`,
    overview: getBudgetOverview(),
    days: [
      {
        day: 1,
        date: startDate,
        startTime: "09:00 AM",
        endTime: "09:00 PM",
        activities: [
          activities.morning,
          activities.lunch,
          activities.afternoon,
        ],
      },
    ],
    tips: [
      budget === "Luxury"
        ? "Many luxury hotels offer private car services - worth the splurge for convenience"
        : budget === "Budget"
        ? "Get a public transportation pass to save on travel costs"
        : "Mix rideshare services with public transport for best value",
      `Best time to visit attractions in ${destination} is early morning to avoid crowds`,
      budget === "Luxury"
        ? "Consider hiring a private guide for personalized experiences"
        : budget === "Budget"
        ? "Many museums have free admission days - plan accordingly"
        : "Look for combination tickets to save on multiple attractions",
      `For ${interests[0]} enthusiasts, check local event calendars for special exhibitions`,
    ],
  };

  // Simulate a delay to make it feel like it's fetching data
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return placeholderItinerary;
}
