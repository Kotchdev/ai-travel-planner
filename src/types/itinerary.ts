export interface ItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  interests: string[];
  userId?: string | null;
  additionalInfo?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: "hotel" | "restaurant" | "attraction" | "transportation";
  description: string;
  time: string;
  location: string;
  cost: string;
  estimatedTime: string;
  tags: string[];
}

export interface DayPlan {
  day: number;
  date: string;
  startTime: string;
  endTime: string;
  activities: Activity[];
}

export interface Itinerary {
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  budget: string;
  overview: string;
  tips: string[];
}
