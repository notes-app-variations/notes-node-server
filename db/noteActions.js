import { client } from "../connection.js"
import { verifyToken } from "./authActions.js"
import { ObjectID } from "mongodb"

exports.getAllNotes = async (req, res) => {
  try {
    const cursor = await client
      .db("app_notes")
      .collection("notes")
      .find()
      .sort({ createdAt: -1 })
    const result = await cursor.toArray()
    console.log(result)
    return res.json(result)
  } catch (e) {
    console.log(`Couldn't get: ${e}`)
  }
}

exports.getAllNotesForUser = async (req, res) => {
  if (!verifyToken(req.headers.authorization)) {
    return res.status(500).json({ error: `Authentication was unsuccessful!` })
  }
  try {
    const cursor = await client
      .db("app_notes")
      .collection("notes")
      .find({ userId: req.params.uid })
      .sort({ createdAt: -1 })
    const result = await cursor.toArray()
    console.log(result)
    return res.json(result)
  } catch (e) {
    console.log(`Couldn't get: ${e}`)
  }
}

exports.getNote = async (req, res) => {
  try {
    const result = await client
      .db("app_notes")
      .collection("notes")
      .findOne({
        id: req.params.id
      })
    console.log(`Found a note in the collection with the id '${req.body.id}':`)
    return res.json(result)
  } catch (e) {
    console.error(`Couldn't get: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.postNote = async (req, res) => {
  const note = req.body
  if (!verifyToken(req.headers.authorization)) {
    return res.status(500).json({ error: `Authentication was unsuccessful!` })
  }

  try {
    const result = await client
      .db("app_notes")
      .collection("notes")
      .insertOne({ ...note, createdAt: new Date() })
    console.log(`New note created with the following id: ${result.insertedId}`)
    return res.json(result.insertedId)
  } catch (e) {
    console.log(`Couldn't post: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.editNote = async (req, res) => {
  if (!verifyToken(req.headers.authorization)) {
    return res.status(500).json({ error: `Authentication was unsuccessful!` })
  }

  try {
    const result = await client
      .db("app_notes")
      .collection("notes")
      .updateOne({ _id: ObjectID(req.params.id) }, { $set: req.body })
    return res.json(result.ok)
  } catch (e) {
    console.log(`Couldn't put: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.deleteNote = async (req, res) => {
  if (!verifyToken(req.headers.authorization)) {
    return res.status(500).json({ error: `Authentication was unsuccessful!` })
  }

  const result = await client
    .db("app_notes")
    .collection("notes")
    .deleteOne({
      _id: ObjectID(req.params.id)
    })
  if (result.deletedCount) {
    console.log(
      `Deleted a note in the collection with the id '${req.params.id}'`
    )
    return res
      .status(200)
      .json({
        status: `Deleted a note in the collection with the id '${req.params.id}'`
      })
  } else if (result.deletedCount == 0) {
    console.log(`No note found with the id '${req.params.id}'`)
    return res
      .status(200)
      .json({ error: `No note found with the id '${req.params.id}'` })
  } else {
    return res.status(500).json({ error: "something went wrong" })
  }
}
