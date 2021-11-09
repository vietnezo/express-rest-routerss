# express-rest-router

express-rest-router is library for dynamic nested routes

## Installation

```sh
npm install express-rest-router
```
or with yarn
```sh
yarn add express-rest-router
```

## Usage

### Example:
```js
const nnn = require('express-rest-router')
const express = require('express')
const app = express()
const router = express()

const options = {
  routeDir: '/routes', // DEFAULT '/routes'
  absolutePath: 'YOUR ABSOLUTE PATH', // NOT RQUIRED
  baseRouter: router   // NOT RQUIRED
}

app.use(nnn(options))
```
When you use both of routeDir and absolutePath, absolutePath overrides routeDir


This file tree:
```
routes/
--| users/
-----| post.js
-----| middleware.js
-----| _id/
-------| get.js
--| books/
-----| _bookId/
--------| authors/
-----------| _authorId/
-------------| get.js
--| get.js
```

generate express Route path:
```
/users/
/users/:id
/books/:bookId/authors/:authorId
/
```
each js file's form

```js
exports.get = (req, res) => {
  res.send('express-rest-router')
}
```

or

```js
module.exports = (req, res) => {
  res.send('express-rest-router')
}
```
### Use middlewares:
Using under method
```js
// get.js
exports = module.exports = (req, res) => {
  res.send('req.params.id is ' + req.params.id)
  console.log(req.params.id)
}

const middle = (req, res, next) => {
  console.log(req.method)
  next()
}

const middle2 = (req, res, next) => {
  console.log('bar')
  next()
}

exports.middleware = [middle, middle2]
```

Using under any file

```js
// middleware.js
exports.middleware01 = (req, res, next) {
  cosole.log('middleware01')
  next()
}
exports.middleware02 = (req, res, next) {
  cosole.log('middleware02')
  next()
}
```
If use middleware overall, should set it the execution file

## License
MIT