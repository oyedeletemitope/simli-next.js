"use client";
import React, { useState } from "react";
import { getAIResponse } from "@/services/openai";

const InputHandler = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse(input);
      setResponse(aiResponse);
    } catch (error) {
      console.error("Error in handleTextSubmit:", error);
      setResponse("Sorry, there was an error getting the response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setResponse("Listening...");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setResponse("Sorry, there was an error with speech recognition.");
    };

    recognition.onend = () => {
      if (response === "Listening...") {
        setResponse("No speech was detected. Please try again.");
      }
    };

    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      console.log("User said:", userInput);
      setInput(userInput);

      setIsLoading(true);
      try {
        const aiResponse = await getAIResponse(userInput);
        setResponse(aiResponse);
      } catch (error) {
        console.error("Error in speech recognition result:", error);
        setResponse("Sorry, there was an error getting the response.");
      } finally {
        setIsLoading(false);
      }
    };

    recognition.start();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleTextSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Asking..." : "Ask"}
          </button>
        </div>
      </form>

      <button
        onClick={handleSpeechInput}
        disabled={isLoading}
        className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Use Speech"}
      </button>

      {response && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2">AI Response:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};

export default InputHandler;
