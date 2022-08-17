import glob from 'glob'
import express from 'express'
const router = express.Router()
const isWindows = process.platform === 'win32'

export default (options = {}) => {
  return async (req, res, next) => {
    const routeDir = 'routeDir' in options ? options.routeDir : '/routes'
    const filePattern = '**/@(*.js|*.ts)'
    const usePath = options.absolutePath === undefined ? process.cwd() + routeDir.replace('./', '/') : options.absolutePath

    const pathObj = glob.sync(filePattern, { cwd: usePath }).reduce((obj, path) => {
      try {
        if (throwerror(path).toString() == [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1].toString()) {
          throw new Error('invalid filename use HTTP method')
        }
      } catch (error) {
        console.error('ERROR: ', error)
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

    for (let i = 0; i < middlewareSort.length; i++) {
      const [filePath, routePath] = middlewareSort[i]
      const methodName = filePath.split('/').slice(-1)[0].replace('.js', '').replace('.ts', '')
      const handler = await import((isWindows ? 'file://' : '') + filePath)
      const routeMiddlewares = allRouteMiddlewares
        .filter(([filePathMdw, routePathMdw]) => routePath.includes(routePathMdw))
        .sort((a, b) => (a[1] > b[1] ? 1 : -1))

      if (routeMiddlewares.length > 0) {
        const middlewareHandlers = routeMiddlewares
          .map(([filePathMdw, routePathMdw]) => getHandler(require(filePathMdw)))
          .filter((handler) => !!handler)
        temporary[methodName](routePath, middlewareHandlers, getHandler(handler))
      } else {
        temporary[methodName](routePath, getHandler(handler))
      }
    }

    return temporary(req, res, next)
  }
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
    return handler.default
  }
  return null
}
