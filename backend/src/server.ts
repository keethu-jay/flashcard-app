import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Use routes
app.use("/api", router);

app.get("/", (req, res) => {
    res.send("TypeScript Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
