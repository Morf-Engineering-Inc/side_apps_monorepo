import { OpenAIGPTChat } from "@/components/api/schemas/OpenAIGPTChat/index";
import { getAuthToken } from "@/lib/auth-integration";
import { useMutation } from "@tanstack/react-query";

// Base request interface for all chat operations
export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface ChatRequest {
	model?: string;
	messages: ChatMessage[];
}

// API Response interface (from the generated types)
export interface ChatResponse {
	id: string;
	object: "chat.completion";
	created: number;
	model: string;
	system_fingerprint?: string | null;
	choices: Array<{
		index: number;
		logprobs?: Record<string, unknown> | null;
		message: {
			role: "assistant";
			content: string;
			reasoning_content?: string | null;
			function_call?: Record<string, unknown> | null;
			tool_calls?: Array<Record<string, unknown>> | null;
			reasoning_details?: Record<string, unknown> | null;
		};
		finish_reason:
			| "stop"
			| "length"
			| "function_call"
			| "content_filter"
			| "null";
		native_finish_reason?: string | null;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
		completion_tokens_details?: {
			reasoning_tokens: number;
		};
		prompt_tokens_details?: Record<string, unknown> | null;
	};
}

// Specialized interfaces for study companion features
export interface ContentAnalysisInput {
	notes: string;
	analysisType?: "concepts" | "terms" | "definitions" | "all";
}

export interface ContentAnalysisOutput {
	concepts: string[];
	terms: string[];
	definitions: { term: string; definition: string }[];
	keyPoints: string[];
}

export interface StudyGuideInput {
	notes: string;
	subject?: string;
	level?: "beginner" | "intermediate" | "advanced";
	format?: "outline" | "detailed" | "summary";
}

export interface StudyGuideOutput {
	title: string;
	sections: {
		heading: string;
		content: string;
		subsections?: { subheading: string; content: string }[];
	}[];
	summary: string;
}

export interface MCQInput {
	notes: string;
	questionCount?: number;
	difficulty?: "easy" | "medium" | "hard";
	subject?: string;
}

export interface MCQOutput {
	questions: {
		question: string;
		options: string[];
		correctAnswer: number;
		explanation: string;
		difficulty: "easy" | "medium" | "hard";
	}[];
}

export interface FlashcardInput {
	notes: string;
	cardCount?: number;
	cardType?: "definition" | "concept" | "mixed";
}

export interface FlashcardOutput {
	cards: {
		front: string;
		back: string;
		category?: string;
		difficulty?: "easy" | "medium" | "hard";
	}[];
}

// Utility function to create chat request
function createChatRequest(
	systemPrompt: string,
	userInput: string,
	model = "gpt-4",
): ChatRequest {
	return {
		model,
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: userInput,
			},
		],
	};
}

// Utility function to parse JSON response safely
function parseJSONResponse<T>(content: string): T {
	try {
		// Remove markdown code blocks if present
		const cleanContent = content.replace(/```(?:json)?\n?/g, "").trim();
		return JSON.parse(cleanContent);
	} catch (error) {
		throw new Error(
			`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// Base chat completion hook
export function useOpenAIGPTChatMutation() {
	return useMutation<ChatResponse, Error, ChatRequest>({
		mutationFn: async (params: ChatRequest): Promise<ChatResponse> => {
			// Validate input
			if (!params.messages || params.messages.length === 0) {
				throw new Error("Messages array is required and cannot be empty");
			}

			// Validate message structure
			for (const message of params.messages) {
				if (!message.role || !message.content) {
					throw new Error("Each message must have role and content");
				}
				if (!["system", "user", "assistant"].includes(message.role)) {
					throw new Error("Message role must be system, user, or assistant");
				}
			}

			// Initialize API client with authentication
			const apiClient = new OpenAIGPTChat({
				TOKEN: getAuthToken() || "",
			});

			// Use generated API client to create chat completion
			const response = await apiClient.default.createChatCompletion({
				model: params.model || "gpt-4",
				messages: params.messages,
			});

			return response;
		},
	});
}

// Content Analysis Hook
export function useContentAnalysisMutation() {
	const chatMutation = useOpenAIGPTChatMutation();

	return useMutation<ContentAnalysisOutput, Error, ContentAnalysisInput>({
		mutationFn: async (
			params: ContentAnalysisInput,
		): Promise<ContentAnalysisOutput> => {
			if (!params.notes || params.notes.trim().length === 0) {
				throw new Error("Notes content is required for analysis");
			}

			const systemPrompt = `You are an expert study assistant. Analyze the provided notes and extract key educational elements.

Your task is to:
1. Identify main concepts and topics
2. Extract important terms and their definitions
3. List key points that should be remembered

Return your analysis in the following JSON format:
{
  "concepts": ["concept1", "concept2", ...],
  "terms": ["term1", "term2", ...],
  "definitions": [{"term": "term1", "definition": "definition1"}, ...],
  "keyPoints": ["point1", "point2", ...]
}

Focus on educational value and ensure all extracted information is directly relevant to the subject matter.`;

			const userPrompt = `Please analyze these notes:\n\n${params.notes}`;

			const chatRequest = createChatRequest(systemPrompt, userPrompt);
			const response = await chatMutation.mutateAsync(chatRequest);

			if (!response.choices || response.choices.length === 0) {
				throw new Error("No response generated from AI");
			}

			const content = response.choices[0].message.content;
			return parseJSONResponse<ContentAnalysisOutput>(content);
		},
	});
}

// Study Guide Generation Hook
export function useStudyGuideMutation() {
	const chatMutation = useOpenAIGPTChatMutation();

	return useMutation<StudyGuideOutput, Error, StudyGuideInput>({
		mutationFn: async (params: StudyGuideInput): Promise<StudyGuideOutput> => {
			if (!params.notes || params.notes.trim().length === 0) {
				throw new Error("Notes content is required for study guide generation");
			}

			const level = params.level || "intermediate";
			const format = params.format || "outline";
			const subject = params.subject || "General Studies";

			const systemPrompt = `You are an expert educational content creator. Create a comprehensive study guide from the provided notes.

Study guide requirements:
- Level: ${level}
- Format: ${format}
- Subject: ${subject}

Create a well-structured study guide that helps students understand and retain the material. Include:
1. Clear hierarchical organization
2. Key concepts and explanations
3. Important details and examples
4. Summary of main points

Return the study guide in the following JSON format:
{
  "title": "Study Guide Title",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Section content and explanation",
      "subsections": [
        {
          "subheading": "Subsection Title", 
          "content": "Detailed content"
        }
      ]
    }
  ],
  "summary": "Comprehensive summary of all key points"
}`;

			const userPrompt = `Create a study guide from these notes:\n\n${params.notes}`;

			const chatRequest = createChatRequest(systemPrompt, userPrompt);
			const response = await chatMutation.mutateAsync(chatRequest);

			if (!response.choices || response.choices.length === 0) {
				throw new Error("No response generated from AI");
			}

			const content = response.choices[0].message.content;
			return parseJSONResponse<StudyGuideOutput>(content);
		},
	});
}

// Multiple Choice Questions Hook
export function useMCQMutation() {
	const chatMutation = useOpenAIGPTChatMutation();

	return useMutation<MCQOutput, Error, MCQInput>({
		mutationFn: async (params: MCQInput): Promise<MCQOutput> => {
			if (!params.notes || params.notes.trim().length === 0) {
				throw new Error("Notes content is required for MCQ generation");
			}

			const questionCount = params.questionCount || 5;
			const difficulty = params.difficulty || "medium";
			const subject = params.subject || "General Knowledge";

			if (questionCount < 1 || questionCount > 20) {
				throw new Error("Question count must be between 1 and 20");
			}

			const systemPrompt = `You are an expert test creator. Generate multiple choice questions based on the provided notes.

Requirements:
- Generate exactly ${questionCount} questions
- Difficulty level: ${difficulty}
- Subject area: ${subject}
- Each question should have 4 options (A, B, C, D)
- Include explanations for correct answers
- Ensure questions test understanding, not just memorization

Return the questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct",
      "difficulty": "${difficulty}"
    }
  ]
}

Make sure all questions are clear, unambiguous, and directly related to the content in the notes.`;

			const userPrompt = `Generate multiple choice questions from these notes:\n\n${params.notes}`;

			const chatRequest = createChatRequest(systemPrompt, userPrompt);
			const response = await chatMutation.mutateAsync(chatRequest);

			if (!response.choices || response.choices.length === 0) {
				throw new Error("No response generated from AI");
			}

			const content = response.choices[0].message.content;
			return parseJSONResponse<MCQOutput>(content);
		},
	});
}

// Flashcard Generation Hook
export function useFlashcardMutation() {
	const chatMutation = useOpenAIGPTChatMutation();

	return useMutation<FlashcardOutput, Error, FlashcardInput>({
		mutationFn: async (params: FlashcardInput): Promise<FlashcardOutput> => {
			if (!params.notes || params.notes.trim().length === 0) {
				throw new Error("Notes content is required for flashcard generation");
			}

			const cardCount = params.cardCount || 10;
			const cardType = params.cardType || "mixed";

			if (cardCount < 1 || cardCount > 30) {
				throw new Error("Card count must be between 1 and 30");
			}

			const systemPrompt = `You are an expert educational content creator specializing in flashcards. Create effective flashcards from the provided notes.

Requirements:
- Generate exactly ${cardCount} flashcards
- Card type: ${cardType}
- Each flashcard should have a clear, concise front (question/prompt) and back (answer/explanation)
- Focus on key concepts, definitions, and important facts
- Vary difficulty levels to provide comprehensive coverage

Flashcard types:
- definition: Term on front, definition on back
- concept: Concept question on front, explanation on back  
- mixed: Combination of definitions, concepts, and factual questions

Return the flashcards in the following JSON format:
{
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "category": "Topic category",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Ensure each flashcard is self-contained and tests a specific piece of knowledge.`;

			const userPrompt = `Create flashcards from these notes:\n\n${params.notes}`;

			const chatRequest = createChatRequest(systemPrompt, userPrompt);
			const response = await chatMutation.mutateAsync(chatRequest);

			if (!response.choices || response.choices.length === 0) {
				throw new Error("No response generated from AI");
			}

			const content = response.choices[0].message.content;
			return parseJSONResponse<FlashcardOutput>(content);
		},
	});
}
