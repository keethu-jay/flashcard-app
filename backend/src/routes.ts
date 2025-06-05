import express from "express";

const router = express.Router();

// Generate flashcards
router.post("/generate_flashcards", (req, res) => {
    const { topic } = req.body;
    res.json({ message: `Flashcards for ${topic} generated.` });
});

// Generate quiz
router.post("/generate_quiz", (req, res) => {
    const { topic } = req.body;
    res.json({ message: `Quiz for ${topic} created.` });
});

// Track progress
router.get("/track_progress", (req, res) => {
    res.json({ message: "User progress tracked." });
});

// Fetch saved topics
router.get("/get_library_data", (req, res) => {
    res.json({ message: "Library data fetched." });
});

export default router;
