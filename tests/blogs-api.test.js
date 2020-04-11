const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const hash = await helper.convertPasswordToHash(helper.initialUser.password)
  const user = new User({
    username: helper.initialUser.username,
    passwordHash: hash
  })
  await user.save()

  const newUser = await User.findOne({ username: user.username })
  helper.initialBlogs = helper.initialBlogs.map(blog => ({
    ...blog,
    user: newUser._id
  }))

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const blogPromiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(blogPromiseArray)
})

describe('when there are initially some blogs returned', () => {
  test('blogs are returned as JSON', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('the blog ids are defined', async () => {
    const response = await api.get('/api/blogs')
    const ids = response.body.map(result => result.id)
    expect(ids).toBeDefined()
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api.get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body.title).toEqual(blogToView.title)
  })

  test('fails with 404 if the blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api.get(`/api/blogs/${validNonExistingId}`)
      .expect(404)
  })

  test('fails with 400 if the blog id is an incorrect format', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('update a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const newLikes = 100
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes = newLikes

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body.likes).toEqual(newLikes)
  })
})

describe('delete an existing blog', () => {
  test('a valid blog can be deleted with auth', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const deleteBlog = blogsAtStart[0]

    const TOKEN = await helper.userToken(helper.initialUser.username)

    await api
      .delete(`/api/blogs/${deleteBlog.id}`)
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(deleteBlog.title)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added with auth', async () => {

    const TOKEN = await helper.userToken(helper.initialUser.username)

    const newBlog = {
      title:  'owl',
      author: 'me',
      url:  'www.news.com',
      likes:  20,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogs.map(blog => blog.title)
    expect(titles).toContainEqual(newBlog.title)
  })

  test('blog with auth but without likes defaults to 0', async () => {

    const TOKEN = await helper.userToken(helper.initialUser.username)

    const newBlog = {
      'title': 'donkey',
      'author': 'you',
      'url': 'www.you.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    const likes = blogs.map(blog => blog.likes)
    expect(likes).toContainEqual(0)
  })

  test('blog with auth but without title and url throws an error', async () => {

    const TOKEN = await helper.userToken(helper.initialUser.username)

    const newBlog = {
      'author': 'you',
      'likes': 1
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(400)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without auth throws 401', async () => {
    const newBlog = {
      title:  'owl',
      author: 'me',
      url:  'www.news.com',
      likes:  20,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

afterAll(() => { mongoose.connection.close() })
