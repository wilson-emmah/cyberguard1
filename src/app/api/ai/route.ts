import { NextResponse } from 'next/server';
import SerpApi from 'google-search-results-nodejs';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ text: "SerpApi key is missing. Please configure the backend." }, { status: 500 });
    }

    return new Promise((resolve) => {
      const params = {
        engine: "google",
        q: `cybersecurity ${prompt}`, // Prefix to keep searches security-focused
        api_key: apiKey,
        num: 5 // Get top 5 results to keep the response concise
      };

      const serpApi = new SerpApi.Search(params, "json");
      serpApi.json((data: any) => {
        // Check if we got organic search results
        if (data.organic_results && data.organic_results.length > 0) {
          // Format the top 3 results into a readable AI response
          const formattedResponse = data.organic_results.slice(0, 3).map((result: any, index: number) => {
            return `**${index + 1}. ${result.title}**\n${result.snippet || 'No preview available.'}\nSource: ${result.link}`;
          }).join('\n\n');

          const finalText = `Here is the latest cybersecurity intelligence regarding "${prompt}":\n\n${formattedResponse}\n\n*Always verify sources and stay vigilant.*`;
          
          resolve(NextResponse.json({ text: finalText }));
        } else if (data.answer_box) {
          // If Google returned an answer box, use that directly
          resolve(NextResponse.json({ text: data.answer_box.snippet || data.answer_box.answer }));
        } else {
          resolve(NextResponse.json({ text: "I couldn't find any specific threat intelligence for that query. Please try rephrasing your question." }));
        }
      });
    });

  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ error: "Failed to fetch threat intelligence." }, { status: 500 });
  }
}
