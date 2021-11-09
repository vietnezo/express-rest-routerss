const nnn = require('../index')
const express = require('express')
const app = express()
const router = express()

const port = 5000

const options = {
  routeDir: '/routes', // default: '/routes'
  // absolutePath: 'YOUR ABSOLUTE PATH', // default null, abosolutePath >> relativePath
  baseRouter: router
}

app.use('/example', (req, res, next) => {
  console.log('middleware')
  res.send('Example active middleware')
  next()
})

app.use(nnn(options))

app.listen(port)
console.log(`Check express-rest-router at localhost:${port}`)
