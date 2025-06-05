import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";



const app = express();
app.use("/api", routes);
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("TypeScript Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
