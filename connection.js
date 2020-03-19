import { MongoClient } from "mongodb"
import { URI } from "./config.js"

export const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

export const connect = () => {
  return client.connect()
}
