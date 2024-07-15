import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET

const saltRounds = 10
export const register = (req, res) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const userData = JSON.parse(body)
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)
      userData.password = hashedPassword

      User.create(userData, (err, result) => {
        if (err) {
          console.error('Error creating user in database:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Error creating user' }))
          return
        }

        const userId = result.insertId
        const token = jwt.sign(
          { id: userId, email: userData.email, role: userData.role || 'user' },
          jwtSecret,
          { expiresIn: '7d' }
        )
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            message: 'User registered successfully',
            token,
            user: {
              nume: userData.nume,
              prenume: userData.prenume,
              email: userData.email,
              role: userData.role || 'user',
            },
          })
        )
      })
    } catch (error) {
      console.error('Error processing request:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error processing request' }))
    }
  })
}

export const login = (req, res) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', () => {
    const userData = JSON.parse(body)
    User.findByEmail(userData.email, (err, results) => {
      if (err || results.length === 0) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Authentication failed' }))
        return
      }

      const user = results[0]
      bcrypt.compare(userData.password, user.password, (err, isMatch) => {
        if (isMatch) {
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
          )
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              message: 'Authentication successful',
              token,
              user: {
                nume: user.nume,
                prenume: user.prenume,
                email: user.email,
                role: user.role,
              },
            })
          )
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Authentication failed' }))
        }
      })
    })
  })
}

export const updateUser = (req, res) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const userData = JSON.parse(body)
      const token = req.headers['authorization']?.split(' ')[1]

      if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'No token provided' }))
        return
      }

      const decoded = jwt.verify(token, jwtSecret)
      if (decoded.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Access denied' }))
        return
      }

      const updates = {}
      const fields = [
        'nume',
        'prenume',
        'telefon',
        'judet',
        'adresa',
        'email',
        'role',
      ]
      fields.forEach(field => {
        if (userData[field] !== undefined) {
          updates[field] = userData[field]
        }
      })

      if (userData.password) {
        updates.password = await bcrypt.hash(userData.password, saltRounds)
      }

      if (Object.keys(updates).length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'No fields to update' }))
        return
      }

      User.update(userData.id, updates, (err, result) => {
        if (err) {
          console.error('Error updating user in database:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Error updating user' }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'User updated successfully' }))
      })
    } catch (error) {
      console.error('Error processing request:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error processing request' }))
    }
  })
}

export const deleteUser = (req, res) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', () => {
    try {
      const { userId } = JSON.parse(body)
      const token = req.headers['authorization']?.split(' ')[1]

      if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'No token provided' }))
        return
      }

      const decoded = jwt.verify(token, jwtSecret)
      if (decoded.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Access denied' }))
        return
      }

      User.delete(userId, (err, result) => {
        if (err) {
          console.error('Error deleting user in database:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Error deleting user' }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'User deleted successfully' }))
      })
    } catch (error) {
      console.error('Error processing request:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error processing request' }))
    }
  })
}

export const getAllUsers = (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1]
    // console.log(token)

    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'No token provided' }))
      return
    }

    const decoded = jwt.verify(token, jwtSecret)
    if (decoded.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Access denied' }))
      return
    }

    User.getAll((err, results) => {
      if (err) {
        console.error('Error getting users from database:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Error getting users' }))
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(results))
    })
  } catch (error) {
    console.error('Error processing request:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error processing request' }))
  }
}
