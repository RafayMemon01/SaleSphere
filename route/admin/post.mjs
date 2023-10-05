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

// POST    /api/v1/post
router.post("/post", async (req, res, next) => {
  console.log("this is signup!", new Date());

  if (!req.body.title || !req.body.text) {
    res.status(403);
    res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
    return;
  }

  try {
    // const insertResponse = await col.insertOne({
    //     // _id: "7864972364724b4h2b4jhgh42",
    //     title: req.body.title,
    //     text: req.body.text,
    //     createdOn: new Date()
    // });
    // console.log("insertResponse: ", insertResponse);

    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: `${req.body.title} ${req.body.text}`,
    });
    const vector = response?.data[0]?.embedding;
    console.log("vector: ", vector);

    const upsertResponse = await pcIndex.upsert([
      {
        id: nanoid(), // unique id
        values: vector,
        metadata: {
          title: req.body.title,
          text: req.body.text,
          createdOn: new Date().getTime(),
        },
      },
    ]);
    console.log("upsertResponse: ", upsertResponse);

    res.send({ message: "post created" });
  } catch (e) {
    console.log("error inserting mongodb: ", e);
    res.status(500).send({ message: "server error, please try later" });
  }
});

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
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

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


router.get("/post/:postId", async (req, res, next) => {
  console.log("this is signup!", new Date());

  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

    try {
    let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
    console.log("result: ", result); // [{...}] []
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});



router.put("/post/:postId", async (req, res, next) => {


  if (!req.body.text && !req.body.title) {
    res.status(403)
      .send(`required parameter missing, atleast one key is required.
        example put body: 
        PUT     /api/v1/post/:postId
        {
            title: "updated title",
            text: "updated text"
        }
        `);
  }

  

  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: `${req.body.title} ${req.body.text}`,
    });
    const vector = response?.data[0]?.embedding;
    console.log("vector: ", vector);

    const upsertResponse = await pcIndex.upsert([
      {
        id: req.params.postId,
        values: vector,
        metadata: {
          title: req.body.title,
          text: req.body.text,
        },
      },
    ]);
    console.log("upsertResponse: ", upsertResponse);

    res.send({ message: "post created" });
  } catch (e) {
    console.log("error inserting mongodb: ", e);
    res.status(500).send({ message: "server error, please try later" });
  }
});

// DELETE  /api/v1/post/:postId
router.delete("/post/:postId", async (req, res, next) => {
  // if (!ObjectId.isValid(req.params.postId)) {
  //     res.status(403).send(`Invalid post id`);
  //     return;
  // }



  const deleteResponse = await pcIndex.deleteOne(req.params.postId);
  console.log("deleteResponse: ", deleteResponse);

  res.send("post deleted");
});

export default router;
