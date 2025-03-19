import React from "react";

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1
        style={{
          color: "#0284c7",
          fontSize: "2.5rem",
          marginBottom: "1rem",
        }}
      >
        AI Travel Planner
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#666",
          maxWidth: "600px",
          marginBottom: "2rem",
        }}
      >
        Welcome to your personalized travel planning assistant
      </p>
      <button
        style={{
          backgroundColor: "#0284c7",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.375rem",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => alert("Coming soon!")}
      >
        Start Planning
      </button>
    </div>
  );
}
