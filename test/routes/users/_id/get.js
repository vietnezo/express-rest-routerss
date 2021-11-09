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
