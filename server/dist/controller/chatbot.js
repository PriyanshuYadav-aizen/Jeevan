"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = chatWithAI;
// Flexible validation - just check if it's not empty
function validateQuestion(question) {
    if (!question || question.trim().length === 0) {
        return { valid: false, message: "Please enter a question." };
    }
    // Very lenient - just check if it has at least 3 characters
    if (question.trim().length < 3) {
        return { valid: false, message: "Please enter a valid question." };
    }
    return { valid: true };
}
function chatWithAI(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const { message } = req.body;
            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Message is required" });
            }
            // Basic validation - just check if question exists
            const validation = validateQuestion(message);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.message });
            }
            // Check if API key is configured
            const apiKey = process.env.BLACKBOX_API_KEY; // Keep using BLACKBOX_API_KEY env var name
            if (!apiKey) {
                console.error("BLACKBOX_API_KEY (Gemini API Key) is not configured in environment variables");
                return res.status(500).json({ error: "Chatbot service is not configured" });
            }
            console.log("Calling Google Gemini API with message:", message.substring(0, 50) + "...");
            // Prepare request body with improved system prompt
            const requestBody = {
                contents: [{
                        parts: [{
                                text: `You are a friendly, helpful, and knowledgeable medical assistant chatbot. Your role is to provide comprehensive, accurate medical information in a conversational and easy-to-understand manner.

IMPORTANT GUIDELINES:
- Answer questions naturally and conversationally, just like a real chatbot
- Provide complete, detailed answers - don't truncate responses mid-sentence
- Understand questions even if they have spelling mistakes or are asked in casual ways
- You can understand medical questions in ANY format - formal, casual, with typos, abbreviations, etc.
- Do not include a brief disclaimer that you provide general information and are not a substitute for professional medical advice
- Be empathetic, clear, and thorough in your responses
- If a question seems medical/health-related (even if unclear), do your best to understand and answer it
- If a paitent is asking about a specific medicine, do your research and give the best medicines
-

User's question (may have typos or be in any format): ${message}

Please provide a complete, detailed, and helpful response:`
                            }]
                    }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2048, // Increased for full answers
                    topP: 0.95,
                    topK: 40,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };
            // First, try to list available models to see what's accessible
            let availableModels = [];
            try {
                const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                const listResponse = yield fetch(listUrl);
                const listData = yield listResponse.json();
                if (listResponse.ok && listData.models) {
                    availableModels = listData.models
                        .filter((m) => { var _a; return (_a = m.supportedGenerationMethods) === null || _a === void 0 ? void 0 : _a.includes("generateContent"); })
                        .map((m) => { var _a; return (_a = m.name) === null || _a === void 0 ? void 0 : _a.replace("models/", ""); });
                    console.log("Available models:", availableModels);
                }
            }
            catch (listError) {
                console.log("Could not list models, will try default models");
            }
            // Try different API versions and model names
            const apiVersions = ["v1beta", "v1"];
            const defaultModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
            const modelsToTry = availableModels.length > 0 ? availableModels : defaultModels;
            let data = null;
            let lastError = null;
            // Try each API version
            for (const version of apiVersions) {
                // Try each model
                for (const model of modelsToTry) {
                    try {
                        const geminiUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
                        console.log(`Trying ${version} with model: ${model}`);
                        const response = yield fetch(geminiUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        });
                        data = yield response.json();
                        if (!response.ok) {
                            console.error(`Gemini API Error for ${version}/${model}:`, JSON.stringify(data, null, 2));
                            lastError = data;
                            // Continue to next model
                            continue;
                        }
                        // Success! Break out of loops
                        console.log(`Successfully used ${version} with model: ${model}`);
                        break;
                    }
                    catch (fetchError) {
                        console.error(`Fetch error for ${version}/${model}:`, fetchError.message);
                        lastError = fetchError;
                        continue;
                    }
                }
                // If we got a successful response, break out of version loop
                if (data && data.candidates) {
                    break;
                }
            }
            // If all models failed
            if (!data || !data.candidates) {
                console.error("All Gemini models failed. Last error:", lastError);
                const errorMessage = ((_a = lastError === null || lastError === void 0 ? void 0 : lastError.error) === null || _a === void 0 ? void 0 : _a.message) || (lastError === null || lastError === void 0 ? void 0 : lastError.message) || "All model attempts failed";
                return res.status(500).json({
                    error: "Failed to process your question. Please try again later.",
                    details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
                });
            }
            // Extract response from Gemini API format
            const candidate = (_b = data.candidates) === null || _b === void 0 ? void 0 : _b[0];
            if (!candidate) {
                console.error("No candidate in Gemini API response:", JSON.stringify(data, null, 2));
                return res.status(500).json({
                    error: "Failed to generate a response. Please try again.",
                    details: process.env.NODE_ENV === "development" ? "No candidate in API response" : undefined,
                });
            }
            // Check if response was blocked or filtered
            if (candidate.finishReason && candidate.finishReason !== "STOP") {
                console.warn("Response finish reason:", candidate.finishReason);
                if (candidate.finishReason === "SAFETY") {
                    return res.status(400).json({
                        error: "Your question was blocked by safety filters. Please rephrase your question.",
                    });
                }
                if (candidate.finishReason === "MAX_TOKENS") {
                    console.warn("Response may be truncated due to token limit");
                }
            }
            const aiResponse = (_e = (_d = (_c = candidate.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
            if (!aiResponse) {
                console.error("No text in Gemini API response:", JSON.stringify(data, null, 2));
                return res.status(500).json({
                    error: "Failed to generate a response. Please try again.",
                    details: process.env.NODE_ENV === "development" ? "No text in API response" : undefined,
                });
            }
            return res.json({
                response: aiResponse,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error("Chatbot error:", error);
            console.error("Error stack:", error.stack);
            // Provide more detailed error in development
            const errorDetails = process.env.NODE_ENV === "development"
                ? {
                    message: error.message,
                    stack: error.stack,
                    apiKeyPresent: !!process.env.BLACKBOX_API_KEY,
                    apiKeyLength: ((_f = process.env.BLACKBOX_API_KEY) === null || _f === void 0 ? void 0 : _f.length) || 0,
                }
                : undefined;
            return res.status(500).json({
                error: "Failed to process your question. Please try again later.",
                details: errorDetails,
            });
        }
    });
}
