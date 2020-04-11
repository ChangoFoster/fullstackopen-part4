const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    'title': 'donkey',
    'author': 'me',
    'url': 'www.news.com',
    'likes': 1276,
    'user': {},
  },
  {
    'title': 'monkey',
    'author': 'meat',
    'url': 'www.news.com.au',
    'likes': 1277,
    'user': {},
  }
]

const initialUser = {
  username: 'Sam123',
  password: 'password123'
}

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willdelete',
    author: 'me',
    url: 'www',
    likes: 0
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const convertPasswordToHash = async (password) => await bcrypt.hash(password, 10)

const userToken = async (usernameForLogin) => {
  const loginUser = await User.findOne({ username: usernameForLogin })
  const userForToken = {
    username: loginUser.username,
    id: loginUser._id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  return token
}

module.exports = {
  initialBlogs,
  initialUser,
  nonExistingId,
  blogsInDb,
  usersInDb,
  convertPasswordToHash,
  userToken,
}
