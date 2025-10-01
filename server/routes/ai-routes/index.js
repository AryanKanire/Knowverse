const express = require('express');
const {
	analyzeLecture,
	getLectureAnalysis,
	askQuestion,
	getQARecord,
	getCourseAnalyses
} = require('../../controllers/ai-controller');
const { authenticate } = require('../../middelware/auth-middelware');

const router = express.Router();

router.use(authenticate);

router.post('/analyze', analyzeLecture);
router.get('/analysis/:courseId/:lectureId', getLectureAnalysis);
router.post('/ask', askQuestion);
router.get('/qa/:courseId/:lectureId', getQARecord);
router.get('/course/:courseId', getCourseAnalyses);

module.exports = router;

