const { GoogleGenAI } = require("@google/genai");

async function testModel() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hi"
    });
    console.log("SUCCESS:", res.text);
  } catch (e) {
    console.log("ERROR STATUS:", e.status);
    console.log("ERROR MESSAGE:", e.message);
  }
}

testModel();
