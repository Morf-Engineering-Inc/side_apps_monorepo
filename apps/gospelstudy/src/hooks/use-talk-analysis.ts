import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface TalkAnalysisInput {
	talkTitle?: string;
	talkText?: string;
	speaker?: string;
	question?: string;
	context?: string;
}

/**
 * Hook for AI-powered analysis of General Conference talks
 * Uses OpenAI GPT to provide insights, summaries, and answer questions
 */
export function useTalkAnalysis() {
	const [analysisResult, setAnalysisResult] = useState<string>("");

	const mutation = useMutation({
		mutationFn: async (input: TalkAnalysisInput) => {
			// If a question is provided, answer it using the context
			if (input.question && input.context) {
				const prompt = `You are a knowledgeable scripture study assistant specializing in LDS General Conference talks.

A user is studying General Conference talks and has asked the following question:

"${input.question}"

Here are the relevant talks for context:

${input.context}

Please provide a thoughtful, comprehensive answer to the question based on these talks. Include:
1. Direct quotes or references from the talks that address the question
2. Key principles and doctrines taught by the speakers
3. Practical applications or personal insights
4. Cross-references to related talks or scriptures if relevant

Keep your answer focused on the content of the provided talks.`;

				return await analyzeWithOpenAI(prompt);
			}

			// Otherwise, analyze a single talk
			if (input.talkText) {
				const prompt = `You are a scripture study assistant analyzing an LDS General Conference talk.

Title: ${input.talkTitle || "Untitled"}
Speaker: ${input.speaker || "Unknown"}

Full Text:
${input.talkText}

Please provide a comprehensive analysis including:

1. **Main Message**: What is the central theme or message of this talk?

2. **Key Doctrines & Principles**: What gospel doctrines and principles are taught?

3. **Scripture References**: Identify and explain the significance of any scriptures referenced.

4. **Personal Application**: How can listeners apply these teachings in their daily lives?

5. **Notable Quotes**: Extract 2-3 powerful or memorable quotes from the talk.

6. **Related Themes**: What other gospel topics or themes does this talk connect to?

7. **Questions for Reflection**: Provide 3-4 thought-provoking questions to help deepen understanding.

Format your response in a clear, organized way using markdown-style headers.`;

				return await analyzeWithOpenAI(prompt);
			}

			throw new Error(
				"Invalid input: must provide either a question with context, or talk text",
			);
		},
		onSuccess: (data) => {
			setAnalysisResult(data);
		},
	});

	return {
		...mutation,
		data: analysisResult,
	};
}

/**
 * Helper function to call OpenAI API
 * In production, this would use the actual OpenAI API
 */
async function analyzeWithOpenAI(prompt: string): Promise<string> {
	// Simulate AI analysis with a delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// For now, return a mock analysis
	// In production, this would call the OpenAI API
	const mockAnalysis = `# AI Analysis

${prompt.includes("question") ? "## Answer to Your Question" : "## Main Message"}

${generateMockAnalysis(prompt)}

---

*Note: This is a demonstration. In production, this would use OpenAI's GPT API to provide real AI-powered insights.*`;

	return mockAnalysis;
}

function generateMockAnalysis(prompt: string): string {
	if (prompt.includes("question")) {
		return `Based on the General Conference talks you've selected, here's what we can learn:

**Key Teachings:**
The speakers emphasize the importance of faith, obedience, and enduring to the end. They teach that through the Atonement of Jesus Christ, we can overcome our challenges and return to our Heavenly Father.

**Practical Applications:**
1. Strengthen your daily scripture study and prayer
2. Focus on keeping your covenants with integrity
3. Seek personal revelation through the Holy Ghost
4. Serve others with Christlike love and compassion

**Notable Principles:**
- Faith in Jesus Christ is the foundation of all gospel living
- The covenant path leads to eternal life
- God's tender mercies are available to all who seek them
- Peace comes through trusting in the Lord's plan

The speakers remind us that discipleship requires sacrifice, but the blessings far exceed the cost. By following the Savior's example and keeping our covenants, we can find joy, peace, and eternal life.`;
	}

	return `The central message of this talk focuses on fundamental gospel principles and their practical application in our lives.

**Key Doctrines:**
- The Atonement of Jesus Christ provides power to change and overcome
- Faith precedes the miracle
- Covenant-keeping brings blessings and divine protection
- Personal revelation is available to all who seek it

**Scripture Significance:**
The speaker references key scriptures that emphasize faith, obedience, and the promises of God to His covenant people. These references serve to anchor the teachings in scriptural truth and provide additional context for study.

**Personal Application:**
Listeners can apply these teachings by:
- Increasing daily prayer and scripture study
- Examining their lives for areas needing repentance
- Seeking to serve others with greater love
- Trusting God's timing and plan even when it's difficult

**Notable Quotes:**
1. "Faith in Jesus Christ is the foundation of all gospel living"
2. "The covenant path may be difficult, but it leads to eternal life"
3. "God's tender mercies are manifest in our daily lives when we watch for them"

**Related Themes:**
This talk connects to themes of revelation, the temple, family relationships, and building faith in times of trial.

**Reflection Questions:**
1. How can I better demonstrate my faith through action?
2. What covenants have I made, and how well am I keeping them?
3. In what ways have I experienced God's tender mercies recently?
4. How can I apply these principles to my current challenges?`;
}
