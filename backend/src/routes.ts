import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

// Summarize study performance using Python service
router.post("/summarize_performance", async (req: Request, res: Response) => {
    const { studyData } = req.body;
    try {
        const response = await axios.post("http://localhost:5001/summarize", { text: studyData });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to summarize study performance" });
    }
});

// Generate flashcards using Python service
router.post("/generate_flashcards", async (req: Request, res: Response) => {
    const { topic } = req.body;
    try {
        const response = await axios.post("http://localhost:5001/generate_flashcards", { topic });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate flashcards" });
    }
});

export default router;
