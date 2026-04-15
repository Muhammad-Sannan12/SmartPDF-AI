import { Groq } from "groq-sdk";
import { vectorStore } from "./prepare.js";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export async function chat(userInput) {
  while (true) {
    if (userInput.toLowerCase() === "/bye") {
      console.log("Exiting chat...");
      break;
    }
    // retrieval step would go here
    const relevantResult = await vectorStore.similaritySearch(userInput, 3); //
    const context = relevantResult
      .map((chunk) => chunk.pageContent)
      .join("/n/n");
     const SYSTEM_PROMPT = `You are a personal assistant to answer
      questions about the company based on the context provided.
      If you don't know the answer, just say that you don't know.
      Do not make up answers.`;

    const userQuery = `question: ${userInput}
relevant Information: ${context}
Answer:`;
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });
    return (`${chatCompletion.choices[0].message.content}`);
  }
}
