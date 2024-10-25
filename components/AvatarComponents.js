"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimliClient } from "simli-client";

const AvatarComponent = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const MAX_RETRIES = 3;

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const initializeSimliClient = async () => {
    try {
      // Clear any existing client
      if (simliClientRef.current) {
        simliClientRef.current.close();
        simliClientRef.current = null;
      }

      setStatus("Initializing...");
      console.log("Creating new SimliClient instance");

      const client = new SimliClient();
      simliClientRef.current = client;

      const simliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: "04d062bc-00ce-4bb0-ace9-76880e3987ec",
        handleSilence: true,
        maxSessionLength: 3600,
        maxIdleTime: 600,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      console.log("Initializing with config");
      await client.Initialize(simliConfig);

      // Set up event listeners
      client.on("connected", () => {
        console.log("Connected successfully");
        setStatus("Connected");
        setConnectionAttempts(0);
        clearRetryTimeout();
      });

      client.on("disconnected", () => {
        console.log("Disconnected");
        setStatus("Disconnected");
        handleReconnect();
      });

      client.on("failed", (error) => {
        console.error("Connection failed:", error);
        setStatus(`Connection failed: ${error}`);
        handleReconnect();
      });

      // Start the connection
      console.log("Starting connection");
      await client.start();
      setStatus("Starting...");
    } catch (error) {
      console.error("Initialization error:", error);
      setStatus(`Error: ${error.message}`);
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    clearRetryTimeout();

    if (connectionAttempts >= MAX_RETRIES) {
      setStatus("Max reconnection attempts reached. Please refresh the page.");
      return;
    }

    setConnectionAttempts((prev) => prev + 1);
    setStatus(
      `Reconnecting... Attempt ${connectionAttempts + 1}/${MAX_RETRIES}`
    );

    retryTimeoutRef.current = setTimeout(() => {
      initializeSimliClient();
    }, 5000);
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SIMLI_API_KEY) {
      setStatus("Error: Simli API key not configured");
      return;
    }

    initializeSimliClient();

    return () => {
      clearRetryTimeout();
      if (simliClientRef.current) {
        simliClientRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-gray-100 p-4 mb-4 rounded">
        <p className="font-medium">Status: {status}</p>
        {connectionAttempts > 0 && connectionAttempts < MAX_RETRIES && (
          <p className="text-sm text-gray-600 mt-1">
            Attempt {connectionAttempts} of {MAX_RETRIES}
          </p>
        )}
      </div>

      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <audio ref={audioRef} autoPlay className="hidden" />

        {status.includes("Error") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <button
              onClick={() => {
                setConnectionAttempts(0);
                initializeSimliClient();
              }}
              className="px-4 py-2 bg-white rounded hover:bg-gray-100"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarComponent;
