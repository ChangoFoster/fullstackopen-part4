const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

//TODO: Error handler needs to be fixed
//TODO: Fix tests for exercise 4.22
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
