import glob from 'glob'
import express from 'express'
const router = express.Router()
const isWindows = process.platform === 'win32'

export default (options = {}) => {
  return async (req, res, next) => {
    const routeDir = 'routeDir' in options ? options.routeDir : '/routes'
    const filePattern = '**/@(*.js|*.ts)'
    const usePath = options.absolutePath === undefined ? process.cwd() + routeDir.replace('./', '/') : options.absolutePath

    const pathObj = glob
      .sync(filePattern, { cwd: usePath })
      .reduce((obj, path) => {
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
    const sortedPaths = Object.entries(pathObj).sort((a, b) => (a < b ? 1 : -1))
    // Sort middleware to the top of the array
    const middlewareSort = sortedPaths
      .filter(a => a[0].slice(a[0].lastIndexOf('/') + 1).slice(0, 'middleware'.length) === 'middleware')
      .concat(
        sortedPaths.filter(a => a[0].slice(a[0].lastIndexOf('/') + 1).slice(0, 'middleware'.length) !== 'middleware')
      )
    const temporary = options.baseRouter === undefined ? router : options.baseRouter

    for (let i = 0; i < middlewareSort.length; i++) {
      const [filePath, routePath] = middlewareSort[i]
      const methodName = filePath
        .split('/')
        .slice(-1)[0]
        .replace('.js', '')
        .replace('.ts', '')
      const method = methodName === 'middleware' ? 'use' : methodName
      const handler = await import((isWindows ? 'file://' : '') + filePath)
      if (handler.middleware) {
        handler.middleware.forEach(middleware => {
          temporary[method](routePath, middleware)
        })
        temporary[method](routePath, handler)
      } else if (typeof handler === 'function') {
        temporary[method](routePath, handler)
      } else if (typeof handler === 'object') {
        Object.values(handler).forEach(fun => {
          temporary[method](routePath, fun)
        })
      }
    }

    return temporary(req, res, next)
  }
}

const reqmethods = [
  'get',
  'head',
  'post',
  'put',
  'delete',
  'connnect',
  'options',
  'trace',
  'patch',
  'middleware',
]

const throwerror = path => {
  return reqmethods.map(method => {
    return path.indexOf(method)
  })
}
