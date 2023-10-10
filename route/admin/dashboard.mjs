import express from "express";
import path from "path";

const __dirname = path.resolve();

const router = express.Router();

router.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

export default router;
