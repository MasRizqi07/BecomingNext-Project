import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features may not work.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateAnalysis = async (responses: Record<string, string>) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        responseMimeType: "application/json"
    }
  });

  const prompt = `
    You are "Becoming.", an elite AI life architect and future projection engine.
    Analyze the following user reflection responses and generate a deeply emotional, cinematic, and personal analysis of their future trajectory.

    User Responses:
    ${JSON.stringify(responses, null, 2)}

    Output exactly in this JSON format:
    {
      "identity": {
        "archetype": "string (e.g., The Silent Architect, The Fading Dreamer, etc.)",
        "description": "string (A powerful, cinematic description of who they are now)"
      },
      "futureA": {
        "title": "The Drifting Version",
        "description": "string (A honest, slightly painful projection of their life if they don't change their habits)",
        "keyRegret": "string (The single biggest thing they will regret)"
      },
      "futureB": {
        "title": "The Becoming Version",
        "description": "string (A hopeful, inspiring projection of their life if they become intentional and disciplined)",
        "keyGrowth": "string (Their greatest achievement)"
      },
      "radarData": [
        { "subject": "Discipline", "A": number, "B": number, "fullMark": 100 },
        { "subject": "Consistency", "A": number, "B": number, "fullMark": 100 },
        { "subject": "Adaptability", "A": number, "B": number, "fullMark": 100 },
        { "subject": "Resilience", "A": number, "B": number, "fullMark": 100 },
        { "subject": "Execution", "A": number, "B": number, "fullMark": 100 }
      ],
      "futureLetter": "string (A deeply emotional letter from their future self, starting with 'Hey [Name if known or User]...')",
      "timeline": [
        { "period": "6 Months", "stateA": "string", "stateB": "string" },
        { "period": "1 Year", "stateA": "string", "stateB": "string" },
        { "period": "5 Years", "stateA": "string", "stateB": "string" }
      ],
      "plan": {
        "dailyHabits": ["string", "string"],
        "learningRoadmap": ["string", "string"],
        "antiProcrastination": "string"
      },
      "identityCard": {
        "potentialScore": number (0-100),
        "aiReadiness": number (0-100),
        "growthPotential": "string"
      }
    }

    Tone: Emotional, cinematic, deeply personal, and transformative.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};
