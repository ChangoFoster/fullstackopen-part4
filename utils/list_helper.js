const _ = require('lodash')

const dummy = blogs =>  1

const totalLikes = blogs => blogs
  .reduce((previous, current) => {return previous + current.likes}, 0)

const favouriteBlog = blogs => {
  const maxLikes = Math.max.apply(Math, blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === maxLikes)
}

const mostBlogs = blogs => {
  const blogsByAuthor = _(blogs)
    .groupBy('author')
    .map((array, key) => ({
      'author': key,
      'blogs': _.countBy(array, 'author')[key]
    }))
    .value()
  const mostBlogsByAuthor = _.maxBy(blogsByAuthor, 'author')
  return mostBlogsByAuthor
}

const mostLikes = blogs => {
  const likesByAuthor = _(blogs)
        .groupBy('author')
        .map((array, key) => ({
            'author': key,
            'likes': _.sumBy(array, 'likes')
        }))
        .value()
  const mostLikesByAuthor = _.maxBy(likesByAuthor, 'likes')
  return mostLikesByAuthor
}

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes }
