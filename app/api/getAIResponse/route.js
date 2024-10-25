import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { userInput } = await request.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
      max_tokens: 100,
    });

    const responseText = completion.choices[0].message.content.trim();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Error in AI response:", error);

    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded" },
        { status: 402 }
      );
    }

    if (error.code === "invalid_api_key") {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch AI response", details: error.message },
      { status: 500 }
    );
  }
}
