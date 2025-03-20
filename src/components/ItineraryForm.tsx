import React, { useState } from "react";
import { ItineraryInput } from "../types/itinerary";

interface ItineraryFormProps {
  onSubmit: (data: ItineraryInput) => void;
  isLoading: boolean;
}

const DEFAULT_INTERESTS = [
  "Sightseeing",
  "Food & Dining",
  "Museums",
  "Shopping",
  "Nature",
  "Adventure",
  "History",
  "Art & Culture",
  "Nightlife",
  "Relaxation",
];

const ItineraryForm: React.FC<ItineraryFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ItineraryInput>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: [],
    additionalInfo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const currentInterests = [...prev.interests];

      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...currentInterests, interest],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form after submission
    setFormData({
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
      interests: [],
      additionalInfo: "",
    });
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontWeight: 500,
    backgroundColor:
      isLoading || formData.interests.length === 0 ? "#93c5fd" : "#0284c7",
    color: "white",
    border: "none",
    cursor:
      isLoading || formData.interests.length === 0 ? "not-allowed" : "pointer",
    opacity: isLoading || formData.interests.length === 0 ? 0.5 : 1,
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan Your Trip</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            value={formData.destination}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Paris, France"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Budget
          </label>
          <select
            id="budget"
            name="budget"
            required
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select your budget</option>
            <option value="Budget">Budget</option>
            <option value="Moderate">Moderate</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Interests (select at least one)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_INTERESTS.map((interest) => (
              <div key={interest} className="flex items-center">
                <input
                  id={`interest-${interest}`}
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`interest-${interest}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="additionalInfo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule Preferences
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Specify any timing preferences (e.g., 'Start at 3 PM on day 2', 'Free morning on day 1', 'Prefer early dinners around 6 PM')"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || formData.interests.length === 0}
          style={buttonStyle}
        >
          {isLoading ? "Generating Itinerary..." : "Generate Itinerary"}
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm;
