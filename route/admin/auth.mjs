import express from "express";
import path from "path";

let router = express.Router();

router.get("/login", (req, res) => {
  res.sendFile(path.resolve("public/login.html"));
});

router.post("/adminlogin", (req, res) => {
  res.status(200).send("logedin");
});

export default router;
