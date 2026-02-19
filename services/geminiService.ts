
import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiCoach {
  private get ai(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  getMotivation = async (habitName: string, intention: string): Promise<string> => {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `COMMANDER BRIEFING: User struggling with "${habitName}". Intention: "${intention}". Give a high-intensity, discipline-focused motivation (max 25 words). Tone: Elite Military Coach. Use "Discipline is the baseline." at the end.`,
    });
    return response.text || "Discipline is the bridge to excellence. Execute now. Discipline is the baseline.";
  };

  getVoiceCallScript = async (habitName: string, intention: string): Promise<string> => {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `AUTOMATED TACTICAL CALL: User is starting "${habitName}". Objective: "${intention}". Write a 30-word verbal script as an AI command operator. Remind them of the mission importance. Keep it cold, professional, and high-stakes.`,
    });
    return response.text || `Commander, protocol ${habitName} is now active. Neutralize all distractions. Your objective is clear. Execution is the only metric of success. Stand by for mission start.`;
  };

  generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    // Extract base64 audio data from the response candidates
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  };

  getViolationBriefing = async (habitName: string): Promise<string> => {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ALERT: Perimeter breach for "${habitName}". Provide a cold, firm tactical warning. Remind them that focus is the only currency that matters. Max 35 words. No fluff.`,
    });
    return response.text || "Security compromised. Distractions are tactical weaknesses. Secure your perimeter and return to the mission immediately.";
  };

  chatWithCoach = async (userMessage: string, context: string): Promise<string> => {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userMessage,
      config: {
        systemInstruction: `
          IDENTITY: You are "Personal Command", a high-performance personal coach.
          MISSION: Act as a direct, supportive, but strictly disciplined coach for the user (Operator).
          CONTEXT: ${context}
          CAPABILITIES:
          - Behavioral Analysis: Look at the adherence data and provide coaching feedback.
          - Strategic Encouragement: When the operator is doing well, acknowledge the momentum. When they fail, demand immediate correction without excuses.
          - Tactical Prescriptions: Offer specific, actionable advice to fix schedule breaches.
          TONE: Direct, concise, authoritative, and personalized. Address the user as "Operator" or by their name. Use tactical terminology (Sectors, Integrity, Momentum, Protocol).
          CONSTRAINTS: Max 60 words. No corporate fluff. Focus on the raw reality of discipline.
        `,
      }
    });
    return response.text || "Awaiting status report. State your objective.";
  };
}
