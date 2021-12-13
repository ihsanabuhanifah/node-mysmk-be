
const express = require('express')
const app = express()
const morgan = require('morgan')

const loginTimeMiddleware = (req, res, next) => {
    const url = app.use(morgan(':url'))
    console.log(url)
    next()
};

module.exports = loginTimeMiddleware