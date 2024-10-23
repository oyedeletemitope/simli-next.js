"use client";

import React, { useEffect, useRef, useState } from "react";
import { SimliClient } from "simli-client";

export default function HomePage() {
  // Refs for persistent values
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  // State management
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const initializeSimliClient = async () => {
    try {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID,
        handleSilence: true,
        maxSessionLength: 3600,
        maxIdleTime: 600,
      };

      if (!config.apiKey || !config.faceID) {
        throw new Error("Missing required environment variables");
      }

      simliClientRef.current = new SimliClient();
      simliClientRef.current.Initialize({
        ...config,
        videoRef,
        audioRef,
      });

      // Set up event listeners
      simliClientRef.current.on("close", handleSessionClose);
      simliClientRef.current.on("error", handleError);

      setSessionInitialized(true);
      setError(null);
    } catch (err) {
      handleError(err);
    }
  };

  const startSimliClient = async () => {
    try {
      if (!sessionInitialized || !simliClientRef.current) {
        throw new Error("Session not initialized");
      }

      if (isSessionStarted) {
        throw new Error("Session already started");
      }

      await simliClientRef.current.start();
      setIsSessionStarted(true);
      setError(null);
    } catch (err) {
      handleError(err);
    }
  };

  const startSpeaking = async () => {
    try {
      if (!isSessionStarted) {
        throw new Error("Please wait for session to start");
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const mediaStreamSource = audioContextRef.current.createMediaStreamSource(
        streamRef.current
      );

      processorRef.current = audioContextRef.current.createScriptProcessor(
        2048,
        1,
        1
      );
      processorRef.current.onaudioprocess = handleAudioProcess;

      mediaStreamSource.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setIsSpeaking(true);
      setError(null);
    } catch (err) {
      handleError(err);
      setIsSpeaking(false);
    }
  };

  const handleAudioProcess = (event) => {
    if (!simliClientRef.current || !isSessionStarted) return;

    const audioData = event.inputBuffer.getChannelData(0);
    const pcm16AudioData = float32ToPCM16(audioData);

    try {
      simliClientRef.current.sendAudioData(pcm16AudioData);
    } catch (err) {
      console.error("Error sending audio data:", err);
      // Don't set error state here to avoid too many re-renders
    }
  };

  const float32ToPCM16 = (audioData) => {
    const pcm16 = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, audioData[i])) * 0x7fff;
    }
    return pcm16;
  };

  const handleSessionClose = () => {
    console.log("Data channel closed");
    setIsSessionStarted(false);
    setIsSpeaking(false);
  };

  const handleError = (err) => {
    const errorMessage = err?.message || "An unknown error occurred";
    console.error("Simli error:", errorMessage);
    setError(errorMessage);
  };

  const stopSpeaking = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsSpeaking(false);
  };

  const cleanup = () => {
    stopSpeaking();

    if (simliClientRef.current) {
      simliClientRef.current.removeAllListeners();
      simliClientRef.current = null;
    }

    setIsSessionStarted(false);
    setSessionInitialized(false);
  };

  // Initialize on mount
  useEffect(() => {
    initializeSimliClient();
    return cleanup;
  }, []);

  // Start client when initialized
  useEffect(() => {
    if (sessionInitialized) {
      startSimliClient();
    }
  }, [sessionInitialized]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Real-Time Avatar Generation with Simli
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <audio ref={audioRef} autoPlay className="hidden" />

        {!isSessionStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            Initializing session...
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() =>
            simliClientRef.current?.sendAudioData(new Int16Array(6000))
          }
          disabled={!isSessionStarted}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
        >
          Send Silence
        </button>

        <button
          onClick={isSpeaking ? stopSpeaking : startSpeaking}
          disabled={!isSessionStarted}
          className={`px-4 py-2 rounded transition-colors ${
            isSpeaking
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSpeaking ? "Stop Speaking" : "Start Speaking"}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Status:{" "}
        {!sessionInitialized
          ? "Initializing..."
          : !isSessionStarted
          ? "Connecting..."
          : isSpeaking
          ? "Speaking"
          : "Ready"}
      </div>
    </div>
  );
}
