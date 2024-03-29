const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id)
    .populate('user', { username: 1, name: 1, id: 1 })

  if(!blog) {
    response.sendStatus(404)
  }

  response.json(blog.toJSON())
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, comments } = request.body
  const blog = { title, author, url, likes, comments }
  const updateBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(updateBlog.toJSON())
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const comment = request.body.text
  const savedBlog = await Blog
    .findByIdAndUpdate(
      request.params.id,
      { $push: { comments: comment } },
      { new: true }
    )
    .populate('user', { username: 1, name: 1, id: 1 })

  response.status(201).json(savedBlog.toJSON())
})

blogsRouter.post('/',  async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if(!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
    comments: []
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if(!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userid = decodedToken.id

  if(blog.user.toString() === userid.toString()) {
    await Blog.findByIdAndRemove(blog.id)

    return response.sendStatus(204)
  } else {
    return response.sendStatus(401)
  }
})

module.exports = blogsRouter
