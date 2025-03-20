import { ItineraryInput, Itinerary } from "../types/itinerary";
import axios from "axios";

// Generate a prompt for the DeepSeek API
export function generatePrompt(input: ItineraryInput): string {
  const { destination, startDate, endDate, budget, interests, userId } = input;

  // Personalized introduction based on user ID
  const intro = userId
    ? "Create a personalized travel itinerary based on this user's preferences and past activity."
    : "Create a detailed travel itinerary for a new user.";

  // Format interests for prompt
  const interestsText = interests.join(", ");

  // Generate the prompt
  return `${intro}
  
DESTINATION: ${destination}
DATES: ${startDate} to ${endDate}
BUDGET: ${budget}
INTERESTS: ${interestsText}

Please create a comprehensive travel itinerary with the following:
1. A brief overview of the destination (2-3 sentences)
2. Day-by-day activities, including:
   - Attractions to visit
   - Estimated time for each activity
   - Approximate cost
   - Locations
3. Practical travel tips for the destination
4. Budget considerations

The response MUST be in valid JSON format with this structure:
{
  "destination": "City, Country",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "overview": "Brief overview of the destination",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "name": "Activity name",
          "description": "Brief description",
          "estimatedTime": "X hours",
          "cost": "Cost in local currency or USD",
          "location": "Location within the city"
        }
      ]
    }
  ],
  "budget": "Budget considerations",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
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
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
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
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 30000, // 30 second timeout
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

  // Create a placeholder itinerary
  const placeholderItinerary: Itinerary = {
    destination: destination,
    startDate: startDate,
    endDate: endDate,
    budget: `${budget} range`,
    overview: `${destination} is a wonderful place to visit, especially for travelers interested in ${interests.join(
      ", "
    )}. The city offers a perfect blend of culture, history, and modern attractions.`,
    days: [
      {
        day: 1,
        date: startDate,
        activities: [
          {
            name: "Morning City Tour",
            description: `Explore the historic center of ${destination}`,
            estimatedTime: "3 hours",
            cost: "Free - $30",
            location: "City Center",
          },
          {
            name: "Local Cuisine Experience",
            description: "Try the famous local dishes for lunch",
            estimatedTime: "1.5 hours",
            cost: "$20 - $40",
            location: "Old Town District",
          },
          {
            name: "Museum Visit",
            description: `Visit the main ${destination} museum`,
            estimatedTime: "2 hours",
            cost: "$15",
            location: "Museum District",
          },
        ],
      },
      {
        day: 2,
        date: endDate,
        activities: [
          {
            name: "Nature Excursion",
            description: `Explore the natural beauty around ${destination}`,
            estimatedTime: "4 hours",
            cost: "$25 - $50",
            location: "Outside City Center",
          },
          {
            name: "Shopping Time",
            description: "Visit local markets and shops",
            estimatedTime: "2 hours",
            cost: "Varies",
            location: "Shopping District",
          },
          {
            name: "Farewell Dinner",
            description: "Enjoy a nice dinner at a recommended restaurant",
            estimatedTime: "2 hours",
            cost: "$30 - $60",
            location: "Riverside Area",
          },
        ],
      },
    ],
    tips: [
      `The best time to visit attractions in ${destination} is early morning to avoid crowds.`,
      "Always carry some cash as not all places accept credit cards.",
      "Public transportation is reliable and a cost-effective way to get around.",
      `If you're interested in ${interests[0]}, make sure to check local event calendars for special exhibitions.`,
    ],
  };

  // Simulate a delay to make it feel like it's fetching data
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return placeholderItinerary;
}
