
import express from 'express';
import { nanoid } from 'nanoid'
import { client } from './../../mongodb.mjs'
import { ObjectId } from 'mongodb'

const db = client.db("salespheredb2");
const col = db.collection("posts");

let router = express.Router()






router.get('/posts', async (req, res, next) => {

    const cursor = col.find({})
        .sort({ _id: -1 })
        .limit(100);

    try {
        let results = await cursor.toArray()
        console.log("results: ", results);
        res.send(results);
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})


// [92133,92254, 92255 ]

router.get('/post/:postId', async (req, res, next) => {
    console.log('this is signup!', new Date());

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
        res.status(500).send('server error, please try later');
    }
})

// PUT     /api/v1/post/:postId
// {
//     title: "updated title",
//     text: "updated text"
// }



// DELETE  /api/v1/post/:userId/:postId


export default router