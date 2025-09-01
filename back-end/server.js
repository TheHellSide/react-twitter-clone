import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import connect_mongodb from "./db/connect-mongodb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json()); // to parse 'req.body'.
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}.`);
    connect_mongodb();
})