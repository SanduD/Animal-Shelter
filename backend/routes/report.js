import {
  createReport,
  filterReports,
  getMostRecentReports,
  updateReport,
  deleteReport,
  getAllReports,
  generateRSSFeed,
  getReportById,
} from '../controllers/report.js'
import { authenticateToken } from '../middleware/auth.js'

const reportRoutes = (req, res) => {
  if (req.method === 'POST' && req.url === '/report') {
    authenticateToken(req, res, () => {
      createReport(req, res)
    })
  } else if (req.method === 'GET' && req.url === '/report') {
    authenticateToken(req, res, () => {
      getAllReports(req, res)
    })
  } else if (req.method === 'POST' && req.url === '/report/filter') {
    authenticateToken(req, res, () => {
      filterReports(req, res)
    })
  } else if (req.method === 'PUT' && req.url.startsWith('/report/update')) {
    authenticateToken(req, res, () => {
      updateReport(req, res)
    })
  } else if (req.method === 'DELETE' && req.url.startsWith('/report/delete')) {
    authenticateToken(req, res, () => {
      deleteReport(req, res)
    })
  } else if (req.method === 'GET' && req.url === '/report/most-recent') {
    authenticateToken(req, res, () => {
      getMostRecentReports(req, res)
    })
  } else if (req.url === '/report/rss' && req.method === 'GET') {
    generateRSSFeed(req, res)
  } else if (req.method === 'GET' && req.url.startsWith('/report/')) {
    const id = req.url.split('/')[2]
    req.params = { id }
    getReportById(req, res)
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Route not found' }))
  }
}

export default reportRoutes
