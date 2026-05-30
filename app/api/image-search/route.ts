import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { base64Data, mediaType } = await req.json();

    if (!base64Data || !mediaType) {
      return NextResponse.json({ error: "Missing base64Data or mediaType", title: "" }, { status: 400 });
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // cheapest vision model, uses least credits
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Data}`,
                  detail: "low",   // use low detail to save credits
                },
              },
              {
                type: "text",
                text: `You are a product search assistant for a second-hand fashion marketplace.
Look at this image and respond with ONLY a short product search query (2–5 words) that best describes what you see — brand, item type, and color if visible.
Examples: "Gucci leather handbag", "Nike Air Max white", "floral midi dress".
Do NOT include any explanation, punctuation, or extra words. Just the search query.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("=== OpenAI API Response ===");
    console.log("HTTP Status:", response.status);
    console.log("Body:", JSON.stringify(data, null, 2));
    console.log("===========================");

    if (!response.ok || data?.error) {
      const msg = data?.error?.message ?? "Unknown OpenAI error";
      console.error("OpenAI error:", msg);
      return NextResponse.json({ error: msg, title: "" }, { status: 500 });
    }

    const text: string = data?.choices?.[0]?.message?.content ?? "";

    console.log("Extracted title:", `"${text.trim()}"`);

    return NextResponse.json({ title: text.trim() });

  } catch (error) {
    console.error("OpenAI route error:", error);
    return NextResponse.json({ error: "Failed to analyze image", title: "" }, { status: 500 });
  }
}