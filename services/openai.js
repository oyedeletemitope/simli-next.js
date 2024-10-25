export async function getAIResponse(userInput) {
  try {
    if (!userInput) {
      throw new Error("User input is required");
    }

    const response = await fetch("/api/getAIResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      console.error("API Error Response:", errorData);

      throw new Error(
        `API request failed with status ${response.status}: ${
          errorData?.error || errorData?.message || response.statusText
        }`
      );
    }

    const data = await response.json();

    if (!data || !data.text) {
      throw new Error("Invalid response format from API");
    }

    return data.text;
  } catch (error) {
    console.error("Error in getAIResponse:", {
      message: error.message,
      stack: error.stack,
      userInput: userInput,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}
