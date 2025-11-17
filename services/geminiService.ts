
import { GoogleGenAI, Modality, Content } from "@google/genai";
import { Message } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to format message history for the Gemini API
const formatHistoryForApi = (history: Message[]): Content[] => {
  // Filter out the initial bot greeting as the API doesn't need it as history,
  // and any empty bot messages used as placeholders for streaming.
  const relevantHistory = history.filter(
    msg => msg.id !== 'init' && !(msg.sender === 'bot' && msg.text === '')
  );

  return relevantHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
};

/**
 * Gets a streamed text-only response from the model.
 * @param prompt The user's text prompt.
 * @param history The previous messages in the chat.
 * @returns An async iterator of the bot's response chunks.
 */
export const getChatResponseStream = async (prompt: string, history: Message[]) => {
  const formattedHistory = formatHistoryForApi(history);
  const contents: Content[] = [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }];

  return ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: 'You are a friendly, helpful, and slightly witty AI assistant. You can handle text, voice, and image-based queries. Keep your responses concise but informative.',
      }
  });
};


/**
 * Gets a streamed response based on an image and a text prompt (VQA).
 * @param base64Image The base64 encoded image string.
 * @param prompt The user's text prompt about the image.
 * @returns An async iterator of the bot's response chunks.
 */
export const getVqaResponseStream = async (base64Image: string, prompt: string) => {
  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1], // remove the data URI prefix
      mimeType: 'image/jpeg',
    },
  };
  
  const textPart = { text: prompt };

  return ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
  });
};

/**
 * Converts text to speech using the Gemini TTS model.
 * @param text The text to convert to speech.
 * @returns A base64 encoded string of the raw audio data.
 */
export const getTextToSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from TTS API.");
    }

    return base64Audio;
};
