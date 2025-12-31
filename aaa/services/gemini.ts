
import { GoogleGenAI, Type } from "@google/genai";
import { Lore } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchSectorLore = async (level: number): Promise<Lore> => {
  const isBossLevel = level % 5 === 0;
  const prompt = isBossLevel 
    ? `Generate a terrifying name for a massive alien boss and a one-sentence tactical warning for Level ${level}. The boss is a "Nexus Commander".`
    : `Generate a short science fiction sector name and a one-sentence lore description for a space battle at Level ${level}. Keep it epic and high-tech.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return {
      title: data.title || (isBossLevel ? "ELITE NEXUS" : `Sector ${level * 7}`),
      description: data.description || (isBossLevel ? "Critical threat detected. Engage with extreme caution." : "Entering unknown hostile territory."),
      isBossLevel
    };
  } catch (error) {
    console.error("Gemini error:", error);
    return {
      title: isBossLevel ? "BOSS DETECTED" : `Sector ${level * 7}`,
      description: isBossLevel ? "Tactical scan failed. Anomaly imminent." : "Communications intercepted. Hostiles inbound.",
      isBossLevel
    };
  }
};
