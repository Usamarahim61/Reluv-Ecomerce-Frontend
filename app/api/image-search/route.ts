// import { GEMINI_API_KEY, GEMINI_MODEL } from "../../../next-env"
import { NextRequest, NextResponse } from "next/server";

// Fallback order: Primary -> 3.5 Flash -> 3.1 Flash-Lite
const MODEL_FALLBACK_LIST = [
   "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

async function generateContentWithModel(
  model: string,
  apiKey: string,
  mediaType: string,
  cleanedBase64: string
) {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Identify the clothing/fashion item in this image. Reply with ONLY a short search query (3-6 words), no punctuation, no explanation — e.g. 'blue denim jacket' or 'floral summer dress'.",
              },
              {
                inline_data: {
                  mime_type: mediaType,
                  data: cleanedBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 30,
        },
      }),
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = '';

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing GEMINI_API_KEY configuration" },
        { status: 500 }
      );
    }

    const { base64Data, mediaType } = await req.json();

    if (!base64Data || !mediaType) {
      return NextResponse.json(
        { error: "Missing required image data or media type" },
        { status: 400 }
      );
    }

    const cleanedBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    let response: Response | null = null;
    let lastErrorText = "";

    // Loop through fallback models until one succeeds
    for (const model of MODEL_FALLBACK_LIST) {
      response = await generateContentWithModel(
        model,
        apiKey,
        mediaType,
        cleanedBase64
      );

      if (response.ok) {
        break; // Request succeeded!
      }

      lastErrorText = await response.text();
      console.warn(`Model ${model} failed with status ${response.status}. Trying next fallback...`);
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Gemini API failed across all attempted models`, details: lastErrorText },
        { status: response ? response.status : 500 }
      );
    }

    const data = await response.json();
    console.log("Gemini API response data:", data);
    const title: string =
      data

    return NextResponse.json({ title });
  } catch (err: any) {
    console.error("image-search route exception:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}