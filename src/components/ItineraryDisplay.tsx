import React from "react";
import { Itinerary, DayPlan, Activity } from "../types/itinerary";
import { format } from "date-fns";

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const headerStyle = {
    backgroundColor: "var(--primary-600)",
    color: "white",
    padding: "1rem 1.5rem",
  };

  const textLightStyle = {
    color: "var(--primary-100)",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div style={headerStyle}>
        <h2 className="text-2xl font-bold">
          {itinerary.destination} Itinerary
        </h2>
        <p style={textLightStyle}>
          {itinerary.startDate} to {itinerary.endDate}
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Overview</h3>
          <p className="text-gray-600">{itinerary.overview}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Daily Itinerary
          </h3>

          {itinerary.days.length > 0 ? (
            <div className="space-y-6">
              {itinerary.days.map((day) => (
                <DayCard key={day.day} day={day} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No daily plan available</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Travel Tips
          </h3>
          {itinerary.tips.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {itinerary.tips.map((tip, index) => (
                <li key={index} className="text-gray-600">
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No tips available</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Budget Consideration
          </h3>
          <p className="text-gray-600">{itinerary.budget}</p>
        </div>
      </div>
    </div>
  );
};

const DayCard: React.FC<{ day: DayPlan }> = ({ day }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h4 className="font-medium text-gray-800">
          Day {day.day}: {day.date}
        </h4>
      </div>

      <div className="divide-y divide-gray-200">
        {day.activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h5 className="font-medium text-gray-800">{activity.name}</h5>
        <span className="text-sm text-gray-500">{activity.estimatedTime}</span>
      </div>

      <p className="text-gray-600 mt-1">{activity.description}</p>

      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-500">Location: {activity.location}</span>
        <span className="text-gray-500">Cost: {activity.cost}</span>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
