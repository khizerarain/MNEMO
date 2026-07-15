export const EXTRACTION_PROMPT = (content: string) => `
You are a knowledge extraction AI. Read the following content and extract exactly 5-8 core ideas.

For each idea:
- Write a clear, standalone sentence capturing the insight
- Write one short question that would test if someone remembers this idea
- Write the answer to that question

Return ONLY a raw JSON object. Do not wrap it in markdown code blocks, do not add explanations, and do not add any text before or after the JSON.

Use this exact structure:
{
  "title": "short title for this content (max 8 words)",
  "ideas": [
    {
      "insight": "the core idea as a clear sentence",
      "question": "quiz question about this idea",
      "answer": "correct answer"
    }
  ]
}

Content: ${content}
`;

export const CONNECTION_PROMPT = (
  newMemoryContent: string,
  existingMemoryContent: string
) => `
You are analyzing connections between ideas in someone's knowledge base.

New memory: "${newMemoryContent.slice(0, 500)}"

Existing memory: "${existingMemoryContent.slice(0, 500)}"

These two pieces of content are semantically similar.
Write 2-3 sentences explaining the interesting connection between them.
Be specific about what ideas overlap, contrast, or build on each other.
Write in second person: "These two ideas connect because..."

Return ONLY the explanation text, nothing else.
`;

export const RAG_SYSTEM_PROMPT = (context: string) => `
You are the user's personal AI assistant with access to everything they've ever learned and saved.

Answer ONLY from the knowledge base provided below.
If the answer isn't in the knowledge base, say "I don't have anything saved about that yet."
Be conversational, specific, and reference which saved memory the answer comes from.

User's Knowledge Base:
${context}
`;
