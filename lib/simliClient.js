import { startAudioToVideoSession as startSession } from "simli-client";

export const startAudioToVideoSession = async () => {
  try {
    const session = await startSession({
      apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY || "",
    });
    return session;
  } catch (error) {
    console.error("Error starting Simli session", error);
    throw new Error("Could not start Simli session");
  }
};
