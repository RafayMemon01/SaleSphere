import express from "express";
import { nanoid } from "nanoid";
import { client } from "./../../mongodb.mjs";
import { ObjectId } from "mongodb";

const db = client.db("salespheredb2");
const col = db.collection("posts");

let router = express.Router();

// POST    /api/v1/post
router.post("/post", async (req, res, next) => {
  console.log("this is signup!", new Date());

  if (!req.body.title || !req.body.text || !req.body.link) {
    res.status(403);
    res.send(`required parameters missing, 
        example request body:
        {
          productName: "Your Product Name",
          productDescription: "Your Product Description",
          affiliateLink: "Your Affiliate Link",
          productImageURL: "Your Product Image URL",
        } `);
    return;
  }

  try {
    const insertResponse = await col.insertOne({
      // _id: "7864972364724b4h2b4jhgh42",
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      affiliateLink: req.body.affiliateLink,
      productImageURL: req.body.productImageURL,
      createdOn: new Date(),
    });
    console.log("insertResponse: ", insertResponse);

    res.send("post created");
  } catch (e) {
    console.log("error inserting mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

router.get("/posts", async (req, res, next) => {
  const cursor = col.find({}).sort({ _id: -1 }).limit(100);

  try {
    let results = await cursor.toArray();
    console.log("results: ", results);
    res.send(results);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
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

  // const cursor = col.find({ price: { $lte: 77 } });
  // const cursor = col.find({
  //     $or: [
  //         { _id: req.params.postId },
  //         { title: "dfsdf sdfsdf" }
  //     ]
  // })

  try {
    let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
    console.log("result: ", result); // [{...}] []
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

// PUT     /api/v1/post/:postId
// {
//     title: "updated title",
//     text: "updated text"
// }

router.put("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  if (!req.body.text && !req.body.title && !req.body.link) {
    res.status(403)
      .send(`required parameter missing, atleast one key is required.
        example put body: 
        PUT     /api/v1/post/:postId
        {
            title: "updated title",
            text: "updated text"
            link: "updated link"
        }
        `);
  }

  let dataToBeUpdated = {};

  if (req.body.title) {
    dataToBeUpdated.title = req.body.title;
  }
  if (req.body.text) {
    dataToBeUpdated.text = req.body.text;
  }
  if (req.body.link) {
    dataToBeUpdated.link = req.body.link;
  }

  try {
    const updateResponse = await col.updateOne(
      {
        _id: new ObjectId(req.params.postId),
      },
      {
        $set: dataToBeUpdated,
      }
    );
    console.log("updateResponse: ", updateResponse);

    res.send("post updated");
  } catch (e) {
    console.log("error inserting mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

// DELETE  /api/v1/post/:userId/:postId
router.delete("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    const deleteResponse = await col.deleteOne({
      _id: new ObjectId(req.params.postId),
    });
    console.log("deleteResponse: ", deleteResponse);
    res.send("post deleted");
  } catch (e) {
    console.log("error deleting mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

export default router;
