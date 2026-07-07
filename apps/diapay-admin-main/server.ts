import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API endpoint to synchronize payment rail documentation using Gemini AI with Search Grounding
  app.post("/api/sync-docs", async (req, res) => {
    const {
      providerName,
      baseUrl,
      clientId,
      clientSecret,
      webhookUrl,
      webhookSecret,
      mode
    } = req.body;

    if (!providerName) {
      return res.status(400).json({ error: "providerName is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if GEMINI_API_KEY is not configured yet
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using high-quality local generator.");
      const simulatedMarkdown = `# ${providerName} API Integration Guide
> ⚠️ **Notice:** This documentation was generated locally because the \`GEMINI_API_KEY\` secret is not configured. To enable live AI-agent search grounding, add your key to **Settings > Secrets**.

---

## 1. Connection Configurations
Configure your system to route API payment requests to the following gateway endpoints:
- **API Base Endpoint:** \`${baseUrl || 'https://api.bantupay.com/v1/gateways'}\`
- **Credentials (Client ID):** \`${clientId || 'bantu_client_id_placeholder'}\`
- **Credentials (Client Secret):** \`${clientSecret || '••••••••••••••••'}\`
- **Current Mode:** \`${(mode || 'sandbox').toUpperCase()}\`

---

## 2. Authentication Request [POST] \`/auth/token\`
Exchange client credentials for a temporary API Session Token:

\`\`\`bash
curl -X POST "${baseUrl || 'https://api.bantupay.com/v1/gateways'}/auth/token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "${clientId || 'bantu_client_id_placeholder'}",
    "client_secret": "${clientSecret || 'bantu_client_secret_placeholder'}"
  }'
\`\`\`

---

## 3. Payment Dispatch Request [POST] \`/payments\`
**Headers:**
- \`Authorization: Bearer <your_session_token>\`
- \`Content-Type: application/json\`

**Body:**
\`\`\`json
{
  "amount": 1000.00,
  "currency": "KES",
  "external_id": "BANTU_DISPATCH_99018",
  "callback_url": "${webhookUrl || 'https://yourdomain.com/callbacks'}"
}
\`\`\`

---

## 4. Webhook Security Verification
Validate all callback signals sent to your webhook endpoint by checking signature HMACs against your security key:
- **Webhook URL:** \`${webhookUrl || 'https://yourdomain.com/callbacks'}\`
- **Webhook HMAC Signature Key:** \`${webhookSecret || 'bantu_webhook_secret_placeholder'}\`

*Generated locally at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}*`;

      return res.json({
        success: true,
        markdown: simulatedMarkdown,
        syncedAt: new Date().toLocaleTimeString(),
        source: "Local Generator (Offline)"
      });
    }

    try {
      // Lazy initialize GoogleGenAI with the runtime API key
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are an expert Payment Integration Engineer at BantuPay.
Generate an authoritative, detailed, production-ready API integration guide in Markdown format for the payment rail/provider: "${providerName}".

Please search the web for the latest, real-world API developer documentation for ${providerName} (e.g. Safaricom M-Pesa G2/Daraja API, MTN MoMo API, Flutterwave v3 API, Paystack API, Ozow EFT API) to locate authentic URL endpoints, headers, authentication methods, payload parameters, and webhook callback formats.

The user is integrating with this provider using these active credentials:
- Base API Endpoint URL: ${baseUrl || "Not configured"}
- Client ID / Key: ${clientId || "Not configured"}
- Client Secret / Private Key: ${clientSecret || "Not configured"}
- Webhook Callback URL: ${webhookUrl || "Not configured"}
- Webhook Secret Key: ${webhookSecret || "Not configured"}
- Environment Mode: ${mode || "sandbox"}

Requirements for the generated Markdown:
1. Embed the user's specific credentials and configuration values directly inside all code examples (such as cURL requests, JSON bodies, authentication flows) instead of using generic placeholder text.
2. Structure the document with distinct sections:
   - # ${providerName} API Integration Guide
   - ## 1. Credentials & Connection pool
   - ## 2. Authentication Protocol (e.g. fetch OAuth tokens or base64 headers)
   - ## 3. Transaction Dispatch payload (provide a real cURL snippet + actual JSON parameters found from search)
   - ## 4. Webhook Event Callback & Verification (explain how to verify the incoming signature with the Webhook Secret)
   - ## 5. Sync Grounding Metadata (include a brief log of the source and a confirmation that it was compiled live via Gemini 3.5-flash with Google Search on ${new Date().toLocaleDateString()})
3. Keep the output clean, complete, and formatted strictly in beautiful Markdown. Do not enclose the output in any code wrapper other than standard Markdown.`;

      console.log(`Syncing remote documentation for: ${providerName}...`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const generatedMarkdown = response.text;

      return res.json({
        success: true,
        markdown: generatedMarkdown,
        syncedAt: new Date().toLocaleTimeString(),
        source: "Gemini 3.5-Flash (Search Grounded)"
      });
    } catch (error: any) {
      console.error("Gemini documentation sync error:", error);
      return res.status(500).json({
        error: "Failed to synchronize documentation from remote servers.",
        details: error.message
      });
    }
  });

  // Vite middleware setup for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BantuPay Full-Stack Dev Server running on port ${PORT}`);
  });
}

startServer();
