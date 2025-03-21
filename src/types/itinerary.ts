export interface ItineraryInput { destination: string; startDate: string; endDate: string; budget: "budget" | "moderate" | "luxury"; interests: string[]; additionalInfo?: string; } export interface Activity { name: string; description: string; cost: number; duration: string; time?: string; } export interface DayPlan { day: number; date: string; activities: Activity[]; } export interface Itinerary { destination: string; days: DayPlan[]; totalCost: number; error?: string; }
