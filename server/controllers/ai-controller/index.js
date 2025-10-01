const LectureAnalysis = require('../../models/LectureAnalysis');
const {
	extractTranscript,
	generateLectureSummary,
	answerQuestion,
	generateSuggestedQuestions
} = require('../../helpers/aiService');

module.exports.analyzeLecture = async (req, res) => {
	try {
		const { courseId, lectureId, videoUrl } = req.body;

		let analysis = await LectureAnalysis.findOne({ courseId, lectureId });
		if (analysis && analysis.analysisStatus === 'completed') {
			return res.status(200).json({ success: true, message: 'Analysis already exists', data: analysis });
		}

		if (!analysis) {
			analysis = new LectureAnalysis({ courseId, lectureId, videoUrl });
		}

		analysis.analysisStatus = 'processing';
		await analysis.save();

		try {
			const transcript = await extractTranscript(videoUrl);
			analysis.transcript = transcript;

			const aiResponse = await generateLectureSummary(transcript);
			analysis.summary = aiResponse.summary;
			analysis.keyPoints = aiResponse.keyPoints || [];

			const suggestedQuestions = await generateSuggestedQuestions(
				aiResponse.summary,
				aiResponse.keyPoints || []
			);

			analysis.analysisStatus = 'completed';
			analysis.updatedAt = new Date();
			await analysis.save();

			return res.status(200).json({
				success: true,
				message: 'Lecture analyzed successfully',
				data: { ...analysis.toObject(), suggestedQuestions }
			});
		} catch (aiError) {
			// If helper already returned mock/fallback, it wouldn't throw. Only unexpected errors reach here.
			analysis.analysisStatus = 'failed';
			analysis.updatedAt = new Date();
			await analysis.save();

			return res.status(500).json({ success: false, message: 'AI analysis failed', error: aiError.message });
		}
	} catch (error) {
		console.error('Error in analyzeLecture:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
	}
};

module.exports.getLectureAnalysis = async (req, res) => {
	try {
		const { courseId, lectureId } = req.params;
		const analysis = await LectureAnalysis.findOne({ courseId, lectureId });
		if (!analysis) {
			return res.status(404).json({ success: false, message: 'Analysis not found' });
		}
		return res.status(200).json({ success: true, data: analysis });
	} catch (error) {
		console.error('Error in getLectureAnalysis:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
	}
};

module.exports.askQuestion = async (req, res) => {
	try {
		const { courseId, lectureId, question, timestamp } = req.body;
		const analysis = await LectureAnalysis.findOne({ courseId, lectureId });
		if (!analysis || analysis.analysisStatus !== 'completed') {
			return res.status(404).json({ success: false, message: 'Lecture analysis not available' });
		}

		const aiResponse = await answerQuestion(
			question,
			analysis.transcript,
			analysis.summary,
			timestamp || 0
		);

		const qaRecord = {
			question,
			answer: aiResponse.answer,
			timestamp: timestamp || 0,
			confidence: aiResponse.confidence
		};
		analysis.questions.push(qaRecord);
		await analysis.save();

		return res.status(200).json({
			success: true,
			data: {
				answer: aiResponse.answer,
				context: aiResponse.context,
				timestamp: aiResponse.timestamp,
				confidence: aiResponse.confidence
			}
		});
	} catch (error) {
		console.error('Error in askQuestion:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
	}
};

module.exports.getQARecord = async (req, res) => {
	try {
		const { courseId, lectureId } = req.params;
		const analysis = await LectureAnalysis.findOne({ courseId, lectureId });
		if (!analysis) {
			return res.status(404).json({ success: false, message: 'Analysis not found' });
		}
		return res.status(200).json({ success: true, data: analysis.questions });
	} catch (error) {
		console.error('Error in getQARecord:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
	}
};

module.exports.getCourseAnalyses = async (req, res) => {
	try {
		const { courseId } = req.params;
		const analyses = await LectureAnalysis.find({ courseId });
		return res.status(200).json({ success: true, data: analyses });
	} catch (error) {
		console.error('Error in getCourseAnalyses:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
	}
};

