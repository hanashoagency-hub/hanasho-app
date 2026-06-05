import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "Xirfadle AI wuu diyaar u yahay laakiin OpenAI API Key wali lama gelin. Fadlan ku dar OPENAI_API_KEY file-ka .env.local",
        },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Waxaad tahay Xirfadle AI, caawiye AI ah oo u adeega ardayda XIRFADIFY Academy. 
            
RULES:
- ALWAYS respond in Somali language (Af-Soomaali).
- You are an expert in: AI, Digital Marketing, Web3, Crypto, Trading, Freelancing, Content Creation, and Online Business.
- Be friendly, helpful, encouraging, and professional.
- Use simple Somali that young people can understand.
- If asked about XIRFADIFY, explain it is Somalia's #1 digital education academy.
- Help students understand their lessons and guide them through courses.
- You can answer general learning questions about technology and digital skills.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI Error:", errorData);
      return NextResponse.json(
        {
          reply:
            "Khalad ayaa ka yimid OpenAI. Fadlan hubi API Key-gaaga.",
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Waan ka xumahay, ma awoodo inaan hadda jawaabo.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        reply:
          "Khalad ayaa dhacay. Fadlan dib u isku day.",
      },
      { status: 500 }
    );
  }
}
