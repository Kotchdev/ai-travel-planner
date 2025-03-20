import React, { useState } from "react";
import { Itinerary } from "../types/itinerary";
interface ItineraryDisplayProps {
  itinerary: Itinerary;
}
const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {" "}
      <div className="bg-blue-500 text-white p-6">
        {" "}
        <div className="max-w-4xl mx-auto">
          {" "}
          <h1 className="text-3xl font-bold mb-2">
            {itinerary.destination} Itinerary
          </h1>{" "}
          <p className="text-lg">
            {itinerary.startDate} to {itinerary.endDate}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="p-6">
        {" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-bold mb-4">Overview</h2>{" "}
          <p className="text-gray-700 text-lg">{itinerary.overview}</p>{" "}
        </section>{" "}
        <section>
          {" "}
          <h2 className="text-2xl font-bold mb-4">Daily Itinerary</h2>{" "}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {" "}
            {itinerary.days.map((day, index) => (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(index)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${selectedDayIndex === index ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {" "}
                Day {index + 1}{" "}
                <span className="block text-sm">{day.date}</span>{" "}
              </button>
            ))}{" "}
          </div>{" "}
          {itinerary.days[selectedDayIndex] && (
            <div className="space-y-6">
              {" "}
              <h3 className="text-xl font-bold mb-4">
                Day {selectedDayIndex + 1}:{" "}
                {itinerary.days[selectedDayIndex].date}
              </h3>{" "}
              <div className="space-y-6">
                {" "}
                {itinerary.days[selectedDayIndex].activities.map(
                  (activity, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      {" "}
                      <div className="flex justify-between items-start mb-4">
                        {" "}
                        <div>
                          {" "}
                          <h4 className="text-xl font-semibold text-gray-900">
                            {activity.description}
                          </h4>{" "}
                          <p className="text-gray-600 mt-1">
                            Location: {activity.location}
                          </p>{" "}
                        </div>{" "}
                        <span className="text-gray-500">
                          {activity.time}
                        </span>{" "}
                      </div>{" "}
                      <div className="flex justify-between text-sm text-gray-500">
                        {" "}
                        <span>Cost: {activity.cost}</span>{" "}
                      </div>{" "}
                    </div>
                  ),
                )}{" "}
              </div>{" "}
            </div>
          )}{" "}
        </section>{" "}
        <section className="mt-8">
          {" "}
          <h2 className="text-2xl font-bold mb-4">Travel Tips</h2>{" "}
          <ul className="list-disc pl-5 space-y-2">
            {" "}
            {itinerary.tips.map((tip, index) => (
              <li key={index} className="text-gray-700">
                {tip}
              </li>
            ))}{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mt-8">
          {" "}
          <h2 className="text-2xl font-bold mb-4">Budget Breakdown</h2>{" "}
          <div className="space-y-2">
            {" "}
            <p className="text-gray-700">
              Accommodation: {itinerary.budget_breakdown?.accommodation}
            </p>{" "}
            <p className="text-gray-700">
              Activities: {itinerary.budget_breakdown?.activities}
            </p>{" "}
            <p className="text-gray-700">
              Food: {itinerary.budget_breakdown?.food}
            </p>{" "}
            <p className="text-gray-700">
              Transportation: {itinerary.budget_breakdown?.transportation}
            </p>{" "}
            <p className="font-semibold text-gray-900">
              Total: {itinerary.budget_breakdown?.total}
            </p>{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
    </div>
  );
};
export default ItineraryDisplay;
