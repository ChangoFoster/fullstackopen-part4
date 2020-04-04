const _ = require('lodash')

const dummy = blogs =>  1

const totalLikes = blogs => blogs
  .reduce((previous, current) => {return previous + current.likes}, 0)

const favouriteBlog = blogs => {
  const maxLikes = Math.max.apply(Math, blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === maxLikes)
}

//Refactor as this looks a bit gnarly
const mostBlogs = blogs => {
  const authorArray = _.map(blogs, 'author')
  const mostCommonAuthor = _.chain(authorArray).countBy().toPairs().max(_.last).value()
  const formattedMostCommonAuthor = {
    author: mostCommonAuthor[0],
    blogs: mostCommonAuthor[1]
  }
  return formattedMostCommonAuthor
}

//Get list of authors and likes, reduce to author totals, select highest
const mostLikes = blogs => {
  const authorArray = _.map(blogs, 'likes')
  const mostLikesAuthor = _.chain(authoArray).countBy().toPairs().max(_.last).value()
  const formattedMostLikesAuthor = {
    author: "Sam",
    likes: mostLikesAuthor[1]
  }
  return formattedMostLikesAuthor
}

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes }
