// app/api/generate-avatar/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, style } = await request.json(); // Parse incoming JSON request
    console.log("Request received:", { name, style });

    // Fetch avatar from Silmi API (replace with the actual Silmi API URL)
    const response = await fetch("https://api.silmi.com/v1/avatars/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILMI_API_KEY}`,
      },
      body: JSON.stringify({ name, style }),
    });

    if (!response.ok) {
      console.error("Error response from Silmi API:", response.statusText);
      throw new Error("Failed to generate avatar");
    }

    const data = await response.json();
    console.log("Response from Silmi API:", data);
    return NextResponse.json({ avatarUrl: data.avatarUrl });
  } catch (error) {
    console.error("Error in API route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
