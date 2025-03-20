export interface ItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  interests: string[];
  userId?: string | null;
  additionalInfo?: string;
  isScheduled?: boolean;
}

export interface Activity {
  name: string;
  description: string;
  time?: string;
  estimatedTime: string;
  cost: string;
  location: string;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  startTime?: string;
  endTime?: string;
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
