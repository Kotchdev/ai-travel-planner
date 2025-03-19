import type { NextApiRequest, NextApiResponse } from "next";
import { generateItinerary } from "../../lib/deepseek";
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

    // Generate itinerary
    const itinerary = await generateItinerary(itineraryInput);

    // Return the generated itinerary
    return res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error in generate-itinerary API:", error);
    return res.status(500).json({ error: "Failed to generate itinerary" });
  }
}
