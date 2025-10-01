const mongoose = require("mongoose");

const QASchema = new mongoose.Schema({
	question: String,
	answer: String,
	timestamp: Number,
	confidence: Number,
	createdAt: { type: Date, default: Date.now }
});

const LectureAnalysisSchema = new mongoose.Schema({
	courseId: String,
	lectureId: String,
	videoUrl: String,
	transcript: String,
	summary: String,
	keyPoints: [String],
	questions: [QASchema],
	analysisStatus: {
		type: String,
		enum: ['pending', 'processing', 'completed', 'failed'],
		default: 'pending'
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LectureAnalysis", LectureAnalysisSchema);

