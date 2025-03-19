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

// Call DeepSeek API to generate an itinerary
export async function generateItinerary(
  input: ItineraryInput
): Promise<Itinerary> {
  const prompt = generatePrompt(input);

  try {
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
      }
    );

    // Extract the response from DeepSeek API
    const generatedText = response.data.choices[0].message.content;

    // Process and structure the response
    return processResponse(generatedText);
  } catch (error) {
    console.error("Error generating itinerary:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error("API Response:", error.response.data);
      throw new Error(
        `API Error: ${error.response.data.error?.message || error.message}`
      );
    }

    throw new Error("Failed to generate itinerary. Please try again later.");
  }
}
