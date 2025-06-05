import express, { Request, Response } from "express";
import { generateStudyMaterials, summarizePerformance } from "../services/aiService"; // Import AI functions


const router = express.Router();

// Generate flashcards
router.post("/generate_flashcards", async (req: Request, res: Response) => {
    const { topic } = req.body;
    try {
        const flashcards = await generateStudyMaterials(topic);
        res.json({ flashcards });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate flashcards" });
    }
});

router.post("/summarize_performance", async (req: Request, res: Response) => {
    const { studyData } = req.body;
    try {
        const summary = await summarizePerformance(studyData);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: "Failed to summarize study performance" });
    }
});


// Track progress
router.get("/track_progress", async (req: Request, res: Response) => {
    res.json({ message: "User progress tracked." });
});


// Fetch saved topics
router.get("/get_library_data", async (req: Request, res: Response) => {
    res.json({ message: "Library data fetched." });
});


export default router;
