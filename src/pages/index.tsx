import React, { useState } from "react";
import Head from "next/head";
import ItineraryForm from "../components/ItineraryForm";
import ItineraryDisplay from "../components/ItineraryDisplay";
import { ItineraryInput, Itinerary } from "../types/itinerary";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (data: ItineraryInput) => {
    setIsLoading(true);
    setError(null);
    setShowForm(false);

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate itinerary");
      }

      const generatedItinerary = await response.json();
      setItinerary(generatedItinerary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error generating itinerary:", err);
      setShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Travel Planner</title>
        <meta
          name="description"
          content="Generate personalized travel itineraries with AI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">AI Travel Planner</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {!isLoading && itinerary && !showForm ? (
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <button onClick={handleReset} className="btn-secondary">
                  Plan Another Trip
                </button>
              </div>
            ) : (
              <ItineraryForm onSubmit={handleSubmit} isLoading={isLoading} />
            )}
          </div>

          <div>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-600">
                    Generating your personalized itinerary...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    This may take up to a minute
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && itinerary && (
              <ItineraryDisplay itinerary={itinerary} />
            )}

            {!isLoading && !error && !itinerary && (
              <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Your Itinerary Will Appear Here
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form and click "Generate Itinerary" to get
                    started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AI Travel Planner. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
