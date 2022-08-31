const glob = require('glob')
const express = require('express')
const router = express.Router()

module.exports = (options = {}) => {
  const routeDir = 'routeDir' in options ? options.routeDir : '/routes'
  const filePattern = '**/@(*.js|*.ts)'
  const usePath = options.absolutePath === undefined ? process.cwd() + routeDir.replace('./', '/') : options.absolutePath

  const pathObj = glob.sync(filePattern, { cwd: usePath }).reduce((obj, path) => {
    try {
      if (throwerror(path).toString() == [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1].toString()) {
        throw new Error('invalid filename use HTTP method')
      }
    } catch (error) {
      console.error('ERROR:', error)
    }

    const cut = '/' + path.replace('.js', '').replace('.ts', '').replace(/_/g, ':')
    const result = cut.split('/').slice(0, -1).join('/')
    const apiPath = result === '' ? '/' : result
    obj[usePath + '/' + path] = apiPath
    return obj
  }, {})

  // Descending sort for exception handling at dynamic routes
  const sortedPaths = Object.entries(pathObj).sort((a, b) => (a[1] < b[1] ? 1 : -1))
  const temporary = options.baseRouter === undefined ? router : options.baseRouter

  // Sort middleware to the top of the array
  const allRouteMiddlewares = sortedPaths.filter((a) => a[0].slice(a[0].lastIndexOf('/') + 1).slice(0, 'middleware'.length) === 'middleware')
  const routes = sortedPaths.filter((a) => a[0].slice(a[0].lastIndexOf('/') + 1).slice(0, 'middleware'.length) !== 'middleware')

  routes.forEach(([filePath, routePath]) => {
    const methodName = filePath.split('/').slice(-1)[0].replace('.js', '').replace('.ts', '')
    const handler = require(filePath)
    const routeHandler = getHandler(handler)
    if (!routeHandler) {
      return
    }

    const routeMiddlewares = allRouteMiddlewares
      .filter(([filePathMdw, routePathMdw]) => routePath.includes(routePathMdw))
      .sort((a, b) => (a[1] > b[1] ? 1 : -1))

    if (routeMiddlewares.length > 0) {
      const middlewareHandlers = routeMiddlewares
        .map(([filePathMdw, routePathMdw]) => getHandler(require(filePathMdw)))
        .filter((mdwHandler) => !!mdwHandler)
      temporary[methodName](routePath, middlewareHandlers, routeHandler)
    } else {
      temporary[methodName](routePath, routeHandler)
    }
  })
  return temporary
}

const reqmethods = ['get', 'head', 'post', 'put', 'delete', 'connect', 'options', 'trace', 'patch', 'middleware']

const throwerror = (path) => {
  return reqmethods.map((method) => {
    return path.indexOf(method)
  })
}

const getHandler = (handler) => {
  if (typeof handler === 'function') {
    return handler
  }
  if (typeof handler === 'object') {
    return handler.default ? handler.default : Object.values(handler)[0]
  }
  return null
}
