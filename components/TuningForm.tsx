// components/TuningForm.tsx
"use client"; // Required for useState, useEffect, event handlers

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

// Define a type for the expected operation structure (adjust based on actual API response)
interface TuningOperation {
  name: string;
  metadata?: any; // You can define a more specific type for metadata if needed
  done: boolean;
  error?: { code: number; message: string; details?: any[] };
  response?: { name?: string; [key: string]: any }; // Tuned model details if successful
}

function TuningForm() {
  const [displayName, setDisplayName] = useState("");
  const [trainingDataUri, setTrainingDataUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [operationName, setOperationName] = useState<string | null>(null);
  const [tuningStatus, setTuningStatus] = useState<TuningOperation | null>(
    null
  );
  const [pollIntervalId, setPollIntervalId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [tunedModelName, setTunedModelName] = useState<string | null>(null);

  const startTuning = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("Starting tuning job...");
    setOperationName(null);
    setTuningStatus(null);
    setTunedModelName(null);
    if (pollIntervalId) clearInterval(pollIntervalId);
    setPollIntervalId(null);

    try {
      const response = await fetch("/api/tune/start", {
        // Calls the App Router endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          // trainingDataUri,
          // Optionally pass baseModel or hyperparameters here too
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use error message from API response if available
        throw new Error(
          data.error || `Failed to start tuning. Status: ${response.status}`
        );
      }

      if (!data.operation || !data.operation.name) {
        throw new Error(
          "API response did not include a valid operation object."
        );
      }

      setMessage(`Tuning job initiated. Operation: ${data.operation.name}`);
      setOperationName(data.operation.name);
      // Start polling immediately
      pollStatus(data.operation.name);
      console.log("API response:", data);
    } catch (error: any) {
      console.error("Failed to start tuning:", error);
      setMessage(`Error starting tuning: ${error.message}`);
      setIsLoading(false); // Stop loading on initial failure
    }
    // Keep isLoading=true while polling starts
  };

  const checkStatus = async (opName: string) => {
    if (!opName) return;

    console.log(`Checking status for ${opName}...`);
    try {
      // Encode the operation name for the query parameter - good practice
      const encodedOpName = encodeURIComponent(opName);
      const response = await fetch(`/api/tune/status?name=${encodedOpName}`); // Calls the App Router endpoint
      const data: TuningOperation = await response.json(); // Assume response matches TuningOperation interface

      if (!response.ok) {
        console.error(
          "Error checking status:",
          data?.error || `HTTP Status ${response.status}`
        );
        // Decide if you want to stop polling on error or just report and continue
        setMessage(
          `Error checking status: ${
            data?.error?.message || `HTTP ${response.status}`
          }. Will retry polling.`
        );
        // Potentially implement backoff here instead of fixed interval retry
        return;
      }

      setTuningStatus(data); // Store the latest operation status

      if (data.done) {
        console.log("Operation finished:", data);
        setIsLoading(false);
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          setPollIntervalId(null); // Clear interval ID state
        }

        if (data.error) {
          setMessage(`Tuning failed: ${data.error.message}`);
          console.error("Tuning Operation Error:", data.error);
        } else {
          // Success! Extract the tuned model name from the response field
          const finishedModelName = data.response?.name; // e.g., "tunedModels/your-model-123"
          if (finishedModelName) {
            setTunedModelName(finishedModelName);
            setMessage(
              `Tuning completed successfully! Model Ready: ${finishedModelName}`
            );
          } else {
            setMessage(
              `Tuning completed, but model name not found in response.`
            );
            console.warn(
              "Tuning operation successful but response structure might be unexpected:",
              data.response
            );
          }
          console.log("Tuning Operation Success:", data.response);
        }
      } else {
        // Still running
        const progressMetadata = data.metadata
          ? ` (Metadata: ${JSON.stringify(data.metadata).substring(0, 100)}...)`
          : "";
        setMessage(
          `Tuning in progress... Operation: ${opName}${progressMetadata}`
        );
        // Update progress based on metadata if available and understood
        // e.g., data.metadata?.pipelineRunDetails?.state
      }
    } catch (error: any) {
      console.error("Client-side error checking status:", error);
      // Maybe stop polling after several consecutive client-side errors
      setMessage(
        `Error checking status: ${error.message}. Check console and network tab.`
      );
      // Consider stopping polling if it's a persistent client error
      // setIsLoading(false);
      // if (pollIntervalId) clearInterval(pollIntervalId);
    }
  };

  const pollStatus = (opName: string) => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId); // Clear previous interval if any
    }

    // Perform the first check immediately without waiting for the interval
    checkStatus(opName);
    console.log(opName);

    // Set up the interval to poll periodically (e.g., every 30 seconds)
    // Adjust interval based on expected tuning time and API limits
    const intervalId = setInterval(() => {
      // Check if the operation name still exists before polling
      // This handles cases where the component state might reset unexpectedly
      // Re-read operationName from state in case it was cleared
      setOperationName((currentOpName) => {
        if (currentOpName) {
          checkStatus(currentOpName);
        } else {
          // Operation name was lost, stop polling
          if (intervalId) clearInterval(intervalId);
          setPollIntervalId(null);
        }
        return currentOpName; // Return current value for the state setter
      });
    }, 30000); // 30 seconds

    setPollIntervalId(intervalId);
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    // This function runs when the component unmounts or when pollIntervalId changes
    return () => {
      if (pollIntervalId) {
        console.log("Clearing polling interval...");
        clearInterval(pollIntervalId);
      }
    };
  }, [pollIntervalId]); // Dependency array ensures cleanup runs correctly

  return (
    <div>
      <h2>Start Model Tuning (App Router)</h2>
      <form onSubmit={startTuning}>
        <div>
          <label htmlFor="displayName">Display Name for Tuned Model:</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="my-awesome-tuned-model"
            style={{ width: "300px", margin: "5px 0" }}
          />
        </div>
        {/* <div>
          <label htmlFor="trainingDataUri">Training Data GCS URI:</label>
          <input
            id="trainingDataUri"
            type="text"
            value={trainingDataUri}
            onChange={(e) => setTrainingDataUri(e.target.value)}
            required
            placeholder="gs://your-bucket-name/training-data.jsonl"
            style={{ width: "400px", margin: "5px 0" }}
          />
        </div> */}
        <Button type="submit" disabled={isLoading || !displayName}>
          {isLoading ? "Processing..." : "Start Tuning Job"}
        </Button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          Status: {message}
        </p>
      )}

      {/* Optionally display the raw operation status for debugging */}
      {tuningStatus && (
        <details
          style={{ marginTop: "10px", background: "#f0f0f0", padding: "5px" }}
        >
          <summary>Show Raw Operation Details</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "0.8em",
            }}
          >
            {JSON.stringify(tuningStatus, null, 2)}
          </pre>
        </details>
      )}

      {tunedModelName && (
        <p style={{ marginTop: "15px", color: "green", fontWeight: "bold" }}>
          ✅ Model Tuned! Use this name in generation calls:
          <br />
          <code>{tunedModelName}</code>
        </p>
      )}

      {operationName && !tuningStatus?.done && !isLoading && (
        <button
          onClick={() => checkStatus(operationName)}
          disabled={isLoading}
          style={{ marginLeft: "10px" }}
        >
          Check Status Now
        </button>
      )}
    </div>
  );
}

export default TuningForm;
