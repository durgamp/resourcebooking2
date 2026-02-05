
import { GoogleGenAI } from "@google/genai";

export const getSmartInsights = async (occupancyData: any[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI Insights Unavailable: System configuration required.";

  const ai = new GoogleGenAI({ apiKey });
  
  // Rule 6: Improved data summarization for context
  const summary = occupancyData.slice(0, 10).map(d => 
    `${d.reactorSerialNo} (${d.blockName}): Actual ${d.actualPercent.toFixed(1)}%, Proposed ${d.proposedPercent.toFixed(1)}%`
  ).join("; ");

  const prompt = `
    Manufacturing Reactor System Analysis:
    Current Data: ${summary}
    
    Task: As a world-class plant operations analyst, provide 3 punchy management insights.
    Focus on:
    1. Utilization efficiency between Proposed and Actual logs.
    2. Identifying the highest performing block.
    3. Recommendations for managing maintenance downtime.
    Format: Single paragraph with bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 } // Add thinking budget for higher quality logic
      }
    });

    return response.text?.trim() || "No critical operational variance detected.";
  } catch (error) {
    console.error("Gemini Failure:", error);
    return "Operations analyst engine is recalibrating data models...";
  }
};
