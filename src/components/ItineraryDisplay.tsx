import React, { useState } from "react";
import { Itinerary, DayPlan, Activity } from "../types/itinerary";
import { format } from "date-fns";

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const [selectedDay, setSelectedDay] = useState(1);

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="bg-blue-500 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {itinerary.destination} Itinerary
          </h1>
          <p className="text-lg">
            {itinerary.startDate} to {itinerary.endDate}
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 text-lg">{itinerary.overview}</p>
        </section>

        {/* Daily Itinerary Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Daily Itinerary</h2>

          {/* Day Selector */}
          <div className="flex gap-4 mb-6">
            {itinerary.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-4 py-2 rounded-md ${
                  selectedDay === day.day
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Day {day.day}
                <span className="block text-sm">{day.date}</span>
              </button>
            ))}
          </div>

          {/* Selected Day's Activities */}
          {itinerary.days
            .filter((day) => day.day === selectedDay)
            .map((day) => (
              <div key={day.day} className="space-y-6">
                <h3 className="text-xl font-bold mb-4">
                  Day {day.day}: {day.date}
                </h3>
                <div className="space-y-6">
                  {day.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {activity.name}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-gray-500">
                          {activity.estimatedTime}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Location: {activity.location}</span>
                        <span>Cost: {activity.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Tips Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Travel Tips</h2>
          <ul className="list-disc pl-5 space-y-2">
            {itinerary.tips.map((tip, index) => (
              <li key={index} className="text-gray-700">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Budget Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Budget Consideration</h2>
          <p className="text-gray-700">{itinerary.budget}</p>
        </section>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
