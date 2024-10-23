"use client";

import React, { useEffect, useRef, useState } from "react";
import { SimliClient } from "simli-client";

const simliClient = new SimliClient();

export default function HomePage() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false); // Track session initialization

  // 1: Initialize SimliClient with necessary configurations
  const initializeSimliClient = () => {
    const simliConfig = {
      apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY, // Replace with your API key from .env.local
      faceID: "FACE-ID", // Replace this with the desired Face ID from Simli's available faces
      handleSilence: true, // Automatically handle silence in audio
      maxSessionLength: 3600, // Max session length (in seconds)
      maxIdleTime: 600, // Max idle time (in seconds)
      videoRef: videoRef,
      audioRef: audioRef,
    };

    // Initialize the Simli client with the given configuration
    simliClient.Initialize(simliConfig);
    setSessionInitialized(true);

    // Handle SimliClient events (e.g., on close)
    simliClient.on("close", () => {
      console.log("Data channel closed");
      setIsSessionStarted(false);
    });
  };

  // 2: Start the WebRTC connection and begin streaming
  const startSimliClient = () => {
    if (sessionInitialized && !isSessionStarted) {
      simliClient
        .start()
        .then(() => {
          console.log("Simli session started");
          setIsSessionStarted(true);
        })
        .catch((error) => {
          console.error("Error starting Simli session:", error);
        });
    } else if (!sessionInitialized) {
      console.warn("Simli session not initialized. Please wait.");
    } else {
      console.warn("Session already started");
    }
  };

  // 3: Use the effect hook to initialize and start the client when the component mounts
  useEffect(() => {
    initializeSimliClient();
    startSimliClient();
  }, [sessionInitialized]); // Ensure that startSimliClient is only called after initialization is complete

  // 4: A function to send audio data (e.g., silence or real audio data)
  const sendAudioData = (audioData) => {
    if (isSessionStarted) {
      simliClient.sendAudioData(audioData);
    } else {
      console.error("Session not initialized. Ignoring audio data.");
    }
  };

  return (
    <div>
      <h1>Real-Time Avatar Generation with Simli</h1>
      <div>
        {/* The video and audio streams will be rendered in these elements */}
        <video ref={videoRef} autoPlay playsInline></video>
        <audio ref={audioRef} autoPlay></audio>
      </div>

      {/* Example to send empty audio data */}
      <button onClick={() => sendAudioData(new Uint8Array(6000).fill(0))}>
        Send Silence Audio Data
      </button>
    </div>
  );
}
