import {
  register,
  login,
  updateUser,
  deleteUser,
  getAllUsers,
} from '../controllers/auth.js'
import { authenticateToken } from '../middleware/auth.js'

const authRoutes = (req, res) => {
  if (req.method === 'POST' && req.url === '/auth/register') {
    register(req, res)
  } else if (req.method === 'POST' && req.url === '/auth/login') {
    login(req, res)
  } else if (req.method === 'PUT' && req.url === '/auth/update') {
    authenticateToken(req, res, () => {
      updateUser(req, res)
    })
  } else if (req.method === 'DELETE' && req.url === '/auth/delete') {
    authenticateToken(req, res, () => {
      deleteUser(req, res)
    })
  } else if (req.method === 'GET' && req.url === '/auth/users') {
    authenticateToken(req, res, () => {
      getAllUsers(req, res)
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Route not found' }))
  }
}

export default authRoutes
