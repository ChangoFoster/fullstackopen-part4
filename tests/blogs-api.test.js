const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('the blog ids are defined', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map(r => r.id)
  expect(ids).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
  	"title": "owl",
  	"author": "me",
  	"url": "www.news.com",
  	"likes": 20
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()

  expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogs.map(blog => blog.title)

  expect(titles).toContainEqual('owl')
})

test('blog without likes defaults to 0', async () => {
  const newBlog = {
    'title': 'donkey',
    'author': 'you',
    'url': 'www.you.com',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()

  expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

  const likes = blogs.map(blog => blog.likes)

  expect(likes).toContainEqual(0)
})

test('blog without title and url throws an error', async () => {
  const newBlog = {
    'author': 'you',
    'likes': 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogs = await helper.blogsInDb()

  expect(blogs).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => { mongoose.connection.close() })
