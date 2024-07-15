import { dbConnection } from '../config/db.js'

const User = {
  create: (userData, callback) => {
    const query =
      'INSERT INTO users (nume, prenume, telefon, judet, adresa, email, password,role) VALUES (?, ?, ?, ?, ?, ?, ?,?)'
    // console.log(userData)

    dbConnection.query(
      query,
      [
        userData.nume,
        userData.prenume,
        userData.telefon,
        userData.judet,
        userData.adresa,
        userData.email,
        userData.password,
        userData.role || 'user',
      ],
      callback
    )
  },
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?'
    dbConnection.query(query, [email], callback)
  },

  update: (userId, updates, callback) => {
    const query = 'UPDATE users SET ? WHERE id = ?'
    dbConnection.query(query, [updates, userId], callback)
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?'
    dbConnection.query(query, [id], callback)
  },
  getAll: callback => {
    const query = 'SELECT * FROM users'
    dbConnection.query(query, callback)
  },
}

export default User
