import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  try {
    const prompt = `Analyze this receipt image. 
    Extract the following information:
    1. The subtotal amount (before tax).
    2. The tax amount.
    3. The total amount.
    4. A list of items purchased with their prices.
    
    If the subtotal is not explicitly listed, calculate it from the total - tax.
    Return the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ['total', 'tax'],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from Gemini");
    }

    const data = JSON.parse(jsonText) as ReceiptData;
    return data;
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw error;
  }
};