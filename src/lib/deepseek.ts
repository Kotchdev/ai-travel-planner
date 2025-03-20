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
    ? "Create a personalized travel itinerary based on this user's preferences and past activity."
    : "Create a detailed travel itinerary for a new user.";

  // Format interests for prompt
  const interestsText = interests.join(", ");

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
    : "\nPlease create a detailed schedule with specific times for each activity.";

  // Generate the prompt
  return `${intro}
  
DESTINATION: ${destination}
DATES: ${startDate} to ${endDate}
BUDGET LEVEL: ${budget}${budgetInstructions}
INTERESTS: ${interestsText}${schedulePreferences}

Create a comprehensive travel itinerary with SPECIFIC details:

1. Overview:
   - Brief but specific overview of the destination
   - Mention actual neighborhoods or districts that will be visited
   - Include relevant seasonal information for the given dates

2. Day-by-day activities with EXACT locations and establishments:
   - Specific time for each activity (e.g., "09:00 AM - The Louvre Museum")
   - Full names of attractions, restaurants, and venues
   - Exact addresses or notable landmarks for each location
   - Realistic duration for each activity including travel time
   - Specific costs in local currency or USD (e.g., "€15 entrance fee" not just "entrance fee")
   - For restaurants, name actual establishments that match the budget level
   - For attractions, include specific exhibits or highlights to see

3. Budget-Appropriate Recommendations:
   ${
     budget === "Luxury"
       ? "- Focus on Michelin-starred restaurants, 5-star hotels, and exclusive experiences\n   - Include VIP tours and premium services\n   - Suggest high-end shopping venues and luxury brands\n   - Recommend exclusive or private transportation options"
       : budget === "Budget"
       ? "- Prioritize free walking tours and public spaces\n   - Include affordable local eateries and street food\n   - Focus on budget accommodation options\n   - Suggest money-saving travel passes or cards"
       : "- Mix of moderate restaurants and casual dining\n   - Include both paid attractions and free activities\n   - Suggest comfortable mid-range hotels\n   - Balance public transport with occasional taxis"
   }

4. Practical Tips:
   - Specific transportation advice between locations
   - Local customs and etiquette
   - Money-saving strategies appropriate for the budget level
   - Safety tips for specific areas
   - Best times to visit each attraction

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
          "name": "Full Name of Venue/Activity",
          "time": "09:00 AM",
          "description": "Detailed description with specific highlights",
          "estimatedTime": "2 hours (including 15 min travel time)",
          "cost": "Exact cost in local currency or USD",
          "location": "Full address or specific location details"
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
            name: "Private City Tour with Expert Guide",
            time: "09:00 AM",
            description: `Exclusive guided tour of ${destination}'s highlights with a certified historian, including skip-the-line access to major attractions`,
            estimatedTime: "3 hours",
            cost: "$300 per person",
            location: "Hotel Pickup Service",
          },
          lunch: {
            name:
              budget === "Luxury"
                ? "Michelin-Starred Dining Experience"
                : "Local Restaurant",
            time: "12:30 PM",
            description:
              budget === "Luxury"
                ? "Exquisite tasting menu at a prestigious Michelin-starred restaurant"
                : "Traditional local cuisine",
            estimatedTime: "2 hours",
            cost:
              budget === "Luxury" ? "$200-300 per person" : "$30-50 per person",
            location:
              budget === "Luxury" ? "Fine Dining District" : "City Center",
          },
          afternoon: {
            name:
              budget === "Luxury" ? "VIP Shopping Experience" : "Cultural Tour",
            time: "03:00 PM",
            description:
              budget === "Luxury"
                ? "Personal shopping assistant at luxury boutiques"
                : "Visit to main cultural sites",
            estimatedTime: "3 hours",
            cost:
              budget === "Luxury"
                ? "Variable (luxury goods)"
                : "$20-40 entrance fees",
            location:
              budget === "Luxury"
                ? "Premium Shopping District"
                : "Historic District",
          },
        };
      case "Budget":
        return {
          morning: {
            name: "Free Walking Tour",
            time: "09:00 AM",
            description: `Explore ${destination}'s highlights with a local guide (tip-based)`,
            estimatedTime: "2.5 hours",
            cost: "Free (suggested tip: $10-15)",
            location: "Main Square Meeting Point",
          },
          lunch: {
            name: "Local Street Food Experience",
            time: "12:00 PM",
            description: "Sample authentic street food from local vendors",
            estimatedTime: "1 hour",
            cost: "$5-10 per person",
            location: "Food Market District",
          },
          afternoon: {
            name: "Self-Guided Museum Tour",
            time: "02:00 PM",
            description: "Visit during free/reduced admission hours",
            estimatedTime: "2 hours",
            cost: "Free - $10",
            location: "City Museum",
          },
        };
      default: // Moderate
        return {
          morning: {
            name: "Guided Group Tour",
            time: "09:30 AM",
            description: `Comprehensive tour of ${destination}'s main attractions`,
            estimatedTime: "2.5 hours",
            cost: "$45 per person",
            location: "Tourist Information Center",
          },
          lunch: {
            name: "Mid-Range Restaurant Experience",
            time: "12:30 PM",
            description: "Quality local cuisine in a comfortable setting",
            estimatedTime: "1.5 hours",
            cost: "$25-40 per person",
            location: "Restaurant District",
          },
          afternoon: {
            name: "Cultural Site Visit",
            time: "02:30 PM",
            description: "Explore major cultural attractions",
            estimatedTime: "2 hours",
            cost: "$20-30 entrance fee",
            location: "Historic Center",
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
