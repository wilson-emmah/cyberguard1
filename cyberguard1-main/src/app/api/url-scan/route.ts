import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

    // VirusTotal requires the URL to be base64 encoded
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    // Query VirusTotal's database
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.data) {
      const stats = data.data.attributes.last_analysis_stats;
      return NextResponse.json({
        malicious: stats.malicious,
        suspicious: stats.suspicious,
        harmless: stats.harmless,
        undetected: stats.undetected,
        total: stats.malicious + stats.suspicious + stats.harmless + stats.undetected
      });
    } else {
      return NextResponse.json({ error: "URL not found in threat databases (Likely safe/new)." });
    }
  } catch (error) {
    console.error("URL Scan Error:", error);
    return NextResponse.json({ error: "Failed to scan URL" }, { status: 500 });
  }
}