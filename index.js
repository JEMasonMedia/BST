// import { v4 as uuid } from 'uuid'
import express from 'express'
import morgan from 'morgan'
import chalk from 'chalk'
import hbs from 'express-handlebars'
import dotenv from 'dotenv'
import BetterRandom from './BetterRandom.js'
import BST from './BST.js'

import * as url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

dotenv.config()

const app = express()
const morganMiddleware = morgan(function (tokens, req, res) {
  return ['\n', chalk.hex('#ff4757').visible('🍄  Morgan --> '), chalk.hex('#34ace0').visible(tokens.method(req, res)), chalk.hex('#ffb142').visible(tokens.status(req, res)), chalk.hex('#ff5252').visible(tokens.url(req, res)), chalk.hex('#2ed573').visible(tokens['response-time'](req, res) + ' ms'), chalk.yellow(tokens['remote-addr'](req, res)), chalk.hex('#fffa65').visible('from ' + tokens.referrer(req, res))].join(' ')
})
app.use(morganMiddleware)
const port = process.env.PORT

let BSTobject = new BST()

const createBST = () => {
  const bstArray = {}

  for (var i = 0; i < 20; ++i) {
    const getString = () => {
      let string = ''
      for (var j = 0; j < 5; ++j) {
        string += String.fromCharCode(BetterRandom(66, 90))
      }
      return string
    }

    const getRandom = () => {
      while (true) {
        const random = BetterRandom(10000, 65535)
        if (!bstArray[random]) {
          bstArray[random] = getString()
          return [String(random), bstArray[random]]
        }
      }
    }

    let [key, val] = getRandom()
    BSTobject.insertNode(key, val)
  }
}

app.engine(
  'hbs',
  hbs.create({
    defaultLayout: 'layout',
    extname: 'hbs',
  }).engine
)
app.set('view engine', '.hbs')
app.use(express.static(__dirname + '/public'))
app.set('views', './views')

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/test', (req, res) => {
  res.render('test')
})

app.get('/bst', (req, res) => {
  if (BSTobject.root === null) createBST()
  res.send(BSTobject.root)
})

app.get('/bst/create', (req, res) => {
  BSTobject = new BST()
  createBST()
  res.send(BSTobject.root)
})

app
  .listen(port, () => {
    console.log(`listening on port ${port}`)
  })
  .on('error', err => {
    console.log(err)
  })
