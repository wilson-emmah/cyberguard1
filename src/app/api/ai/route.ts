import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`You are CyberGuard AI Coach, a helpful cybersecurity expert assistant. Answer concisely: ${prompt}`);
    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}