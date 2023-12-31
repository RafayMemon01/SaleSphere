import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
const __dirname = path.resolve();

import adminAuth from "./route/admin/auth.mjs";
import UserPostRouter from "./route/user/post.mjs";
import AdminPostRouter from "./route/admin/post.mjs";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/user/api/v1", UserPostRouter);

app.use("/admin/api/v1", adminAuth); //make sure this api was secure

app.use("/admin/api/v1/admin", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Example server listening on port ${PORT}`);
});
