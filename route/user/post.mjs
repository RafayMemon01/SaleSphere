import express from "express";
import { customAlphabet } from "nanoid";
import pineconeClient from "./../../pinecone.mjs";
import openaiClient from "./../../openai.mjs";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);


const pcIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
console.log(
  "process.env.PINECONE_INDEX_NAME: ",
  process.env.PINECONE_INDEX_NAME
);

let router = express.Router();


router.get("/posts", async (req, res, next) => {


  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: "",
    });
    const vector = response?.data[0]?.embedding;
    console.log("vector: ", vector);
    const queryResponse = await pcIndex.query({
      vector: vector,
      // id: "vec1",
      topK: 10000,
      includeValues: false,
      includeMetadata: true,
    });

    queryResponse.matches.map((eachMatch) => {
      console.log(
        `score ${eachMatch.score.toFixed(1)} => ${JSON.stringify(
          eachMatch.metadata
        )}\n\n`
      );
    });
    console.log(`${queryResponse.matches.length} records found `);

    const formattedOutput = queryResponse.matches.map((eachMatch) => ({
      text: eachMatch?.metadata?.text,
      title: eachMatch?.metadata?.title,
      _id: eachMatch?.id,
    }));

    res.send(formattedOutput);
  } catch (e) {
    console.log("error getting data pinecone: ", e);
    res.status(500).send("server error, please try later");
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: req.query.q,
    });
    const vector = response?.data[0]?.embedding;
    console.log("vector: ", vector);
    const queryResponse = await pcIndex.query({
      vector: vector,
      // id: "vec1",
      topK: 20,
      includeValues: false,
      includeMetadata: true,
    });

    queryResponse.matches.map((eachMatch) => {
      console.log(
        `score ${eachMatch.score.toFixed(3)} => ${JSON.stringify(
          eachMatch.metadata
        )}\n\n`
      );
    });
    console.log(`${queryResponse.matches.length} records found `);

    const formattedOutput = queryResponse.matches.map((eachMatch) => ({
      text: eachMatch?.metadata?.text,
      title: eachMatch?.metadata?.title,
      _id: eachMatch?.id,
    }));

    res.send(formattedOutput);
  } catch (e) {
    console.log("error getting data pinecone: ", e);
    res.status(500).send("server error, please try later");
  }
});

// [92133,92254, 92255 ]

router.get("/post/:postId", async (req, res, next) => {
  console.log("this is signup!", new Date());

  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }



  try {
    let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
    console.log("result: ", result);
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});



export default router;
