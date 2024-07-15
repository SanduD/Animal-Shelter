import http from 'http'
import { connectToDatabase } from './config/db.js'
import authRoutes from './routes/auth.js'
import { createReport } from './controllers/report.js'
import reportRoutes from './routes/report.js'

const startServer = async () => {
  try {
    await connectToDatabase()

    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
      )
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type,authorization'
      )
      res.setHeader('Access-Control-Allow-Credentials', true)

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      if (req.url.startsWith('/auth')) {
        authRoutes(req, res)
      } else if (req.url.startsWith('/report')) {
        reportRoutes(req, res)
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Route not found' }))
      }
    })

    const PORT = 3000
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer()
