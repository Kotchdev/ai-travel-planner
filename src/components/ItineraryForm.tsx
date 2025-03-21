import React, { useState, useEffect } from 'react';
import { ItineraryInput } from '../types/itinerary';

interface ItineraryFormProps {
  onSubmit: (data: ItineraryInput) => void;
  isLoading: boolean;
}

const DEFAULT_INTERESTS = [
  'Sightseeing',
  'Food & Dining',
  'Museums',
  'Shopping',
  'Nature',
  'Adventure',
  'History',
  'Art & Culture',
  'Nightlife',
  'Relaxation',
];

const ItineraryForm: React.FC<ItineraryFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ItineraryInput>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'economy',
    interests: [],
    additionalInfo: '',
  });

  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        setDateError('End date must be after start date');
        setNumberOfDays(0);
      } else {
        setDateError('');
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setNumberOfDays(diffDays);
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (dateError) return;
    onSubmit(formData);
    setFormData({
      destination: '',
      startDate: '',
      endDate: '',
      budget: 'economy',
      interests: [],
      additionalInfo: '',
    });
    setNumberOfDays(0);
  };

  const isDisabled = isLoading || formData.interests.length === 0 || cat src/components/ItineraryForm.tsxdateError;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan Your Trip</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            value={formData.destination}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Paris, France"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {dateError ? (
          <p className="text-red-500 text-sm mb-4">{dateError}</p>
        ) : numberOfDays > 0 ? (
          <p className="text-green-600 text-sm mb-4">
            Planning a {numberOfDays}-day itinerary
          </p>
        ) : null}

        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Budget
          </label>
          <select
            id="budget"
            name="budget"
            required
            value={formData.budget}
            onChange={handleChange}
            className="form-input"
          >
            <option value="economy">Budget</option>
            <option value="medium">Moderate</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Interests (select at least one)
          </span>
          <div className="interest-grid">
            {DEFAULT_INTERESTS.map((interest) => (
              <div key={interest} className="interest-item">
                <input
                  id={}
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="interest-checkbox"
                />
                <label htmlFor={} className="interest-label">
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Preferences
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="form-input"
            rows={4}
            placeholder={}
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className={}
        >
          {isLoading ? 'Generating Itinerary...' : 'Generate Itinerary'}
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm;