import express from "express"
import bodyParser from "body-parser"
import { connect } from "./connection.js"
import cors from "cors"
import {
  getAllNotes,
  getNote,
  postNote,
  editNote,
  deleteNote
} from "./db/noteActions.js"
import { login, logout, register } from "./db/authActions.js"

// Set up the express app
const app = express()

// Parse incoming requests data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

// get all notes
app.get("/api/notes", getAllNotes)
app.get("/api/notes/:id", getNote)
app.post("/api/notes", postNote)
app.put("/api/notes/:id", editNote)
app.delete("/api/notes/:id", deleteNote)

app.post("/api/login", login)
app.post("/api/logout", logout)
app.post("/api/register", register)

const PORT = 5000

const start = async () => {
  try {
    await connect()
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}/api`)
    })
  } catch (e) {
    console.error(e)
  }
}
start()
