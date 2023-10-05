import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
const __dirname = path.resolve();


import UserPostRouter from "./route/user/post.mjs";
import AdminPostRouter from "./route/admin/post.mjs";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/user/api/v1", UserPostRouter);


app.use("/admin/api/v1", AdminPostRouter); //make sure this api was secure

// app.use(express.static(path.join(__dirname, "web/build")));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Example server listening on port ${PORT}`);
});