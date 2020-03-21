import { client } from "../connection.js"
import { secretKey } from "../config.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const newToken = userId => {
  return jwt.sign({ id: userId }, secretKey, {
    expiresIn: "2days"
  })
}

export const verifyToken = token => {
  try {
    return jwt.verify(token, secretKey)
  } catch (err) {
    return null
  }
}

exports.login = async (req, res) => {
  try {
    const user = await client
      .db("app_notes")
      .collection("users")
      .findOne({
        email: req.body.email
      })
    if (user) {
      console.log(
        `Found a user in the collection with the email '${req.body.email}'`
      )
      if (bcrypt.compareSync(req.body.password, user.hash)) {
        const { hash, ...userWithoutHash } = user
        const token = jwt.sign({ sub: user.id }, secretKey)
        return res.json({
          user: userWithoutHash,
          token
        })
      } else {
        return res.status(401).json({ error: "The password is not correct" })
      }
    } else
      return res.status(401).json({
        error: `Wrong email: ${req.body.email}`
      })
  } catch (e) {
    console.error(`Couldn't get: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}
exports.logout = async (req, res) => {}

exports.register = async (req, res) => {
  const user = req.body
  if (user.email == "" || user.password == "" || user.username == "")
    return res.status(500).json({ error: "user info was not provided" })
  try {
    await client
      .db("app_notes")
      .collection("users")
      .findOne({
        email: user.email
      })
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Email ${user.email} is already taken!` })
  }

  if (user.password) {
    user.hash = bcrypt.hashSync(user.password, 10)
  }
  delete user.password
  try {
    const result = await client
      .db("app_notes")
      .collection("users")
      .insertOne(user)
    console.log(`New user created with the following id: ${result.insertedId}`)
    console.log(result.ops)
    const { hash, user: userWithoutHash } = result.ops
    const token = newToken(result.insertedId)
    return res.json({ user: userWithoutHash, token })
  } catch (e) {
    console.log(`Couldn't create: ${e}`)
    return res.status(500).json({ error: "something went wrong" })
  }
}
