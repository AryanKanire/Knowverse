'use strict';

const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
	openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
	console.warn('⚠️  OPENAI_API_KEY not found. AI features will be limited.');
}

const DEFAULT_SUMMARY = 'This is a generated summary based on available transcript. AI quota limitations prevented a full analysis at this time.';

function isQuotaOrRateLimitError(error) {
	const status = error && (error.status || error.code);
	const type = error && (error.type || (error.error && error.error.type));
	const msg = (error && error.message) || '';
	return (
		status === 429 ||
		type === 'insufficient_quota' ||
		status === 'insufficient_quota' ||
		msg.toLowerCase().includes('quota') ||
		msg.toLowerCase().includes('rate')
	);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callChatWithRetry(messages, options = {}) {
	if (!openai) {
		throw new Error('OPENAI_NOT_CONFIGURED');
	}

	const {
		model = 'gpt-3.5-turbo',
		temperature = 0.3,
		max_tokens = 1000,
		retries = 2,
		initialDelayMs = 500
	} = options;

	let attempt = 0;
	let delay = initialDelayMs;
	while (true) {
		try {
			const completion = await openai.chat.completions.create({
				model,
				messages,
				temperature,
				max_tokens
			});
			return completion.choices[0].message.content;
		} catch (error) {
			if (isQuotaOrRateLimitError(error)) {
				// Bubble up a normalized error so callers can fallback
				const normalized = new Error('AI_QUOTA_OR_RATE_LIMIT');
				normalized.isQuotaOrRateLimit = true;
				normalized.original = error;
				throw normalized;
			}

			if (attempt >= retries) {
				throw error;
			}

			await sleep(delay);
			attempt += 1;
			delay *= 2;
		}
	}
}

function safeJsonParse(text) {
	if (!text) return null;
	// Try direct parse first
	try {
		return JSON.parse(text);
	} catch (_) {}

	// Try to extract JSON inside code fences
	const fenceMatch = text.match(/```[\s\S]*?\{([\s\S]*?)\}[\s\S]*?```/);
	if (fenceMatch) {
		const candidate = '{' + fenceMatch[1] + '}';
		try {
			return JSON.parse(candidate);
		} catch (_) {}
	}

	// Try to extract the first JSON object
	const start = text.indexOf('{');
	const end = text.lastIndexOf('}');
	if (start !== -1 && end !== -1 && end > start) {
		const candidate = text.slice(start, end + 1);
		try {
			return JSON.parse(candidate);
		} catch (_) {}
	}

	return null;
}

function buildMockSummaryFromTranscript(transcript) {
	const trimmed = (transcript || '').split('\n').join(' ').slice(0, 600);
	return {
		summary: DEFAULT_SUMMARY,
		keyPoints: [
			'Overview of the lecture topic',
			'Main concepts discussed',
			'Examples or applications mentioned',
			'Important terms introduced',
			'Practical takeaways'
		],
		concepts: ['concept1', 'concept2', 'concept3'],
		__mock: true,
		__excerpt: trimmed
	};
}

function buildMockAnswer(question, timestamp = 0) {
	return {
		answer: `This is a generated answer for the question: "${question}". AI quota limitations prevented a detailed AI response.`,
		context: 'General context based on the lecture transcript and summary.',
		timestamp: `Around ${Math.floor(timestamp)} seconds`,
		confidence: 0.5,
		__mock: true
	};
}

function buildMockQuestions() {
	return [
		'What is the main topic of this lecture?',
		'Which key concepts should I focus on?',
		'How can these ideas be applied in practice?',
		'What prior knowledge helps understand this material?',
		'What are the most important takeaways?'
	];
}

async function extractTranscript(videoUrl) {
	try {
		console.log('Transcript extraction requested for:', videoUrl);
		return `This is a placeholder transcript for the video: ${videoUrl}. In production, replace with actual transcript extraction.`;
	} catch (error) {
		console.error('Error extracting transcript:', error);
		throw new Error('Failed to extract video transcript');
	}
}

function extractVideoId(url) {
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	const match = url && url.match(regex);
	return match ? match[1] : null;
}

async function generateLectureSummary(transcript) {
	try {
		if (!openai) {
			return buildMockSummaryFromTranscript(transcript);
		}

		const userPrompt = `
Analyze the following lecture transcript and provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key points (5-7 bullet points)
3. Important concepts and terms

Transcript: ${transcript}

Please format your response as JSON:
{
  "summary": "detailed summary here",
  "keyPoints": ["point1", "point2", "point3"],
  "concepts": ["concept1", "concept2", "concept3"]
}`.trim();

		const content = await callChatWithRetry([
			{ role: 'system', content: 'You are an expert educational assistant. Analyze lecture content and provide clear, structured summaries and key points.' },
			{ role: 'user', content: userPrompt }
		], { model: 'gpt-3.5-turbo', temperature: 0.3, max_tokens: 1000, retries: 2 });

		const parsed = safeJsonParse(content);
		if (parsed && parsed.summary && parsed.keyPoints) {
			return parsed;
		}
		return buildMockSummaryFromTranscript(transcript);
	} catch (error) {
		if (error && error.isQuotaOrRateLimit) {
			return buildMockSummaryFromTranscript(transcript);
		}
		console.error('Error generating summary:', error);
		throw new Error('Failed to generate lecture summary');
	}
}

async function answerQuestion(question, transcript, summary, timestamp = 0) {
	try {
		if (!openai) {
			return buildMockAnswer(question, timestamp);
		}

		const userPrompt = `
Based on the following lecture content, answer the user's question.

Lecture Summary: ${summary}

Full Transcript: ${transcript}

Current Video Timestamp: ${Math.floor(timestamp)} seconds

User Question: ${question}

Please provide:
1. A direct answer to the question
2. Relevant context from the lecture
3. Timestamp references if applicable
4. Confidence level (0-1)

Format your response as JSON:
{
  "answer": "detailed answer here",
  "context": "relevant context",
  "timestamp": "relevant timestamp if applicable",
  "confidence": 0.85
}`.trim();

		const content = await callChatWithRetry([
			{ role: 'system', content: 'You are an expert teaching assistant. Answer questions about lecture content accurately and helpfully.' },
			{ role: 'user', content: userPrompt }
		], { model: 'gpt-3.5-turbo', temperature: 0.2, max_tokens: 500, retries: 2 });

		const parsed = safeJsonParse(content);
		if (parsed && parsed.answer) {
			return parsed;
		}
		return buildMockAnswer(question, timestamp);
	} catch (error) {
		if (error && error.isQuotaOrRateLimit) {
			return buildMockAnswer(question, timestamp);
		}
		console.error('Error answering question:', error);
		throw new Error('Failed to answer question');
	}
}

async function generateSuggestedQuestions(summary, keyPoints) {
	try {
		if (!openai) {
			return buildMockQuestions();
		}

		const userPrompt = `
Based on this lecture content, generate 5-7 thoughtful questions that students might ask:

Summary: ${summary}
Key Points: ${Array.isArray(keyPoints) ? keyPoints.join(', ') : ''}

Include different types of questions:
- Conceptual understanding
- Practical applications
- Clarifications
- Deeper exploration

Return as JSON array: ["question1", "question2", "question3"]`.trim();

		const content = await callChatWithRetry([
			{ role: 'system', content: 'You are an expert educator. Generate thoughtful questions that help students understand and engage with lecture content.' },
			{ role: 'user', content: userPrompt }
		], { model: 'gpt-3.5-turbo', temperature: 0.4, max_tokens: 300, retries: 2 });

		const parsed = safeJsonParse(content);
		if (Array.isArray(parsed)) {
			return parsed;
		}
		return buildMockQuestions();
	} catch (error) {
		if (error && error.isQuotaOrRateLimit) {
			return buildMockQuestions();
		}
		console.error('Error generating questions:', error);
		return [];
	}
}

module.exports = {
	isQuotaOrRateLimitError,
	extractTranscript,
	extractVideoId,
	generateLectureSummary,
	answerQuestion,
	generateSuggestedQuestions
};

