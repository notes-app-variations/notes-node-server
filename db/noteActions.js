import { client } from "../connection.js"
import { verifyToken } from "./authActions.js"

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
        id: req.id
      })
    console.log(`Found a note in the collection with the id '${req.id}':`)
    return res.json(result)
  } catch (e) {
    console.error(`Couldn't get: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.postNote = async (req, res) => {
  const note = req.body.note
  const user = req.body.user

  if (!verifyToken(user.token)) {
    return res.status(500).json({ error: `Authentication was unsuccessful!` })
  }

  try {
    const result = await client
      .db("app_notes")
      .collection("notes")
      .insertOne({ ...note, userId: user.uid, createdAt: new Date() })
    console.log(`New note created with the following id: ${result.insertedId}`)
    return res.json(result.insertedId)
  } catch (e) {
    console.log(`Couldn't post: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.editNote = async (req, res) => {
  try {
    const result = await client
      .db("app_notes")
      .collection("notes")
      .updateOne({ id: req.id }, { $set: req.body })
    return res.json(result.ok)
  } catch (e) {
    console.log(`Couldn't put: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}

exports.deleteNote = async (req, res) => {
  console.log(req)
  const result = await client
    .db("app_notes")
    .collection("notes")
    .deleteOne({
      _id: req.params.id
    })
  if (result) {
    console.log(
      `Deleted a note in the collection with the id '${req.params.id}':`
    )
    return result.deletedCount
  } else {
    console.log(`No note found with the id '${req.params.id}'`)
    return res.status(500).json({ error: "something went wrong" })
  }
}
