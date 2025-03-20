import type { NextApiRequest, NextApiResponse } from "next";
import {
  generateItinerary,
  generateFallbackItinerary,
} from "../../lib/deepseek";
import { ItineraryInput, Itinerary } from "../../types/itinerary";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract itinerary input from request body
    const itineraryInput: ItineraryInput = req.body;

    // Validate required fields
    const { destination, startDate, endDate, budget, interests } =
      itineraryInput;

    if (!destination || !startDate || !endDate || !budget || !interests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!interests.length) {
      return res
        .status(400)
        .json({ error: "At least one interest is required" });
    }

    // Log the request for troubleshooting on Vercel
    console.log("Generating itinerary for:", {
      destination,
      dates: `${startDate} to ${endDate}`,
      budget,
      interests: interests.join(", "),
    });

    try {
      // Try to generate itinerary with DeepSeek
      const itinerary = await generateItinerary(itineraryInput);

      // Validate the returned itinerary
      if (!itinerary.destination || itinerary.destination === "Unknown") {
        console.warn("Generated itinerary may be incomplete:", itinerary);
      }

      // Return the generated itinerary
      return res.status(200).json(itinerary);
    } catch (apiError) {
      console.error("Error with DeepSeek API, using fallback:", apiError);

      // Use fallback if DeepSeek fails
      const fallbackItinerary = await generateFallbackItinerary(itineraryInput);
      return res.status(200).json(fallbackItinerary);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in generate-itinerary API:", errorMessage);

    // Check if the error is related to the API key
    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("unauthorized")
    ) {
      return res.status(500).json({
        error:
          "API authentication error. Please check your DeepSeek API key configuration.",
      });
    }

    return res.status(500).json({ error: errorMessage });
  }
}
