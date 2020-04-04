require('dotenv').config()

let mongoUrl = process.env.MONGODB_URI
let PORT = process.env.PORT

module.exports = { mongoUrl, PORT }
