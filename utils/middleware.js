const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('method:', request.method)
  logger.info('path:', request.path)
  logger.info('body:', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknownEndpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  logger.info(request.headers)
  //Broken somehow with error.kind
  if (error.name === 'CastError' && error.path === '_id') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if(authorization && authorization.toLowerCase().startsWith('bearer')) {
    const token = authorization.substring(7)
    request.token = token
  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
}
