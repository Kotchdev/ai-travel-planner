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
1. A brief overview of the destination
2. Day-by-day activities, including:
   - Attractions to visit
   - Estimated time for each activity
   - Approximate cost
   - Locations
3. Practical travel tips for the destination
4. Budget considerations

Format the response as a structured itinerary that can be parsed as JSON.`;
}

// Process the response from DeepSeek API
export function processResponse(response: string): Itinerary {
  try {
    // Try to parse as JSON first
    return JSON.parse(response);
  } catch (error) {
    // If not valid JSON, extract structured data manually
    // This is a simplified parsing logic - you might need to enhance it
    const lines = response.split("\n");

    // Extract destination and dates (simplified)
    const destination =
      lines
        .find((line) => line.includes("DESTINATION"))
        ?.split(":")[1]
        ?.trim() || "Unknown";
    const dateInfo =
      lines
        .find((line) => line.includes("DATES"))
        ?.split(":")[1]
        ?.trim() || "";
    const [startDate, endDate] = dateInfo.split("to").map((d) => d.trim());

    // Extract budget
    const budget =
      lines
        .find((line) => line.includes("BUDGET"))
        ?.split(":")[1]
        ?.trim() || "Unknown";

    // Extract overview (simplified)
    const overviewIndex = lines.findIndex((line) => line.includes("Overview"));
    const overview =
      overviewIndex >= 0 ? lines[overviewIndex + 1] : "No overview provided";

    // Simple extraction of tips
    const tipsSection = response.split("Tips:")[1] || "";
    const tips = tipsSection
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("-") || line.trim().startsWith("*")
      )
      .map((tip) => tip.replace(/^[-*]\s*/, "").trim());

    // Create a basic structure - this would need refinement
    return {
      destination,
      startDate: startDate || "Unknown",
      endDate: endDate || "Unknown",
      days: [], // Would need more complex parsing
      budget,
      overview,
      tips: tips.length ? tips : ["No specific tips provided"],
    };
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
              "You are a travel planning assistant that helps create detailed itineraries. Respond with well-structured, detailed travel plans that include daily activities, costs, and practical tips.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    throw new Error("Failed to generate itinerary. Please try again later.");
  }
}
