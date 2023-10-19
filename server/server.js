import fs from 'node:fs/promises'
import * as Path from 'node:path'
import * as URL from 'node:url'
import express from 'express'
import hbs from 'express-handlebars'

const __filename = URL.fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)

// Read file
async function readData() {
  const data = await fs.readFile(Path.join(__dirname, `./data/data.json`), {
    encoding: 'utf-8',
  })
  return JSON.parse(data)
}

const server = express()

// Server configuration
const publicFolder = Path.resolve('public')
server.use(express.static(publicFolder))
server.use(express.urlencoded({ extended: false }))

// Handlebars configuration
server.engine('hbs', hbs.engine({ extname: 'hbs' }))
server.set('view engine', 'hbs')
server.set('views', Path.resolve('server/views'))

// routes/router(s)
server.get('/', (req, res) => {
  res.render('home')
})

server.post('/', async (req, res) => {
  let data = await readData()

  let idArr = []
  for (let i=0; i<data.length; i++) {
    idArr.push(data[i]['id'])
  }
  let maxId
  if (idArr.length>0) {maxId = Math.max(...idArr)}else{maxId=0}
  const newId = maxId + 1
  const newAppointment = {
    id: newId,
    ...req.body
  }
  data.push(newAppointment)

  await fs.writeFile(
    Path.join(__dirname, `./data/data.json`),
    JSON.stringify(data, null, 2),
    {
      encoding: 'utf-8',
    }
  )

  res.redirect('appointments')
})

server.get('/appointments', async (req, res) => {
  const template = 'appointments'
  let data = await readData()
  const viewData = {
    appointments: data
  }
  
  res.render(template, viewData)
})

export default server
