import React, { useState, useEffect } from "react";
import { ItineraryInput } from "../types/itinerary";

interface ItineraryFormProps {
  onSubmit: (input: ItineraryInput) => void;
  isLoading: boolean;
}

const DEFAULT_INTERESTS = [
  "History",
  "Culture",
  "Food",
  "Nature",
  "Shopping",
  "Art",
  "Adventure",
  "Relaxation",
  "Nightlife",
  "Local Experience"
];

const ItineraryForm: React.FC<ItineraryFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ItineraryInput>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "moderate",
    interests: [],
    additionalInfo: "",
  });

  const [numberOfDays, setNumberOfDays] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string>("");

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setDateError("End date must be after start date");
        setNumberOfDays(null);
      } else {
        setDateError("");
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setNumberOfDays(days);
      }
    } else {
      setDateError("");
      setNumberOfDays(null);
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateError && formData.interests.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <input
          type="text"
          id="destination"
          name="destination"
          required
          value={formData.destination}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Paris, France"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            required
            value={formData.endDate}
            onChange={handleInputChange}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
      {numberOfDays && (
        <p className="text-sm text-gray-600">
          Duration: {numberOfDays} day{numberOfDays > 1 ? "s" : ""}
        </p>
      )}

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Budget
        </label>
        <select
          id="budget"
          name="budget"
          required
          value={formData.budget}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="budget">Budget</option>
          <option value="moderate">Moderate</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interests (select at least one)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {DEFAULT_INTERESTS.map((interest) => (
            <label
              key={interest}
              className="inline-flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => handleInterestChange(interest)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
        {formData.interests.length === 0 && (
          <p className="text-red-500 text-sm mt-1">Please select at least one interest</p>
        )}
      </div>

      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
          Additional Information (Optional)
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleInputChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Any specific preferences or requirements..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !!dateError || formData.interests.length === 0}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
          isLoading || !!dateError || formData.interests.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
      >
        {isLoading ? "Generating Itinerary..." : "Generate Itinerary"}
      </button>
    </form>
  );
};

export default ItineraryForm;