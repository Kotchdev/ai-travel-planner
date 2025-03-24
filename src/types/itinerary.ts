export interface ItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: "budget" | "moderate" | "luxury";
  interests: string[];
  additionalInfo?: string;
}

export interface Activity {
  name: string;
  description: string;
  cost: string;
  duration: string;
  time?: string;
  location: string;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  accommodation: string;
  activities: string;
  food: string;
  transportation: string;
  total: string;
}

export interface Itinerary {
  destination: string;
  startDate: string;
  endDate: string;
  overview: string;
  days: DayPlan[];
  tips: string[];
  budget_breakdown?: BudgetBreakdown;
  error?: string;
}