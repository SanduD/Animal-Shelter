import { dbConnection, connectToDatabase } from '../config/db.js'
import bcrypt from 'bcrypt'

const saltRounds = 10

const users = [
  {
    email: 'admin@gmail.com',
    password: 'parola',
    nume: 'SUPER',
    prenume: 'ADMIN',
    telefon: '0712345678',
    judet: 'Bucuresti',
    adresa: 'Strada Exemplu, Nr. 1',
    role: 'admin',
  },
  {
    email: 'test@gmail.com',
    password: 'parola',
    nume: 'Test',
    prenume: 'User',
    telefon: '0712345678',
    judet: 'Bucuresti',
    adresa: 'Strada Exemplu, Nr. 2',
    role: 'user',
  },
]

const seedUsers = async () => {
  await connectToDatabase()

  const hashedUsers = await Promise.all(
    users.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds)
      return { ...user, password: hashedPassword }
    })
  )

  const query = `
    INSERT INTO users (email, password, nume, prenume, telefon, judet, adresa, role) 
    VALUES ?
  `

  const values = hashedUsers.map(user => [
    user.email,
    user.password,
    user.nume,
    user.prenume,
    user.telefon,
    user.judet,
    user.adresa,
    user.role,
  ])

  dbConnection.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error seeding users:', err)
    } else {
      console.log('Users seeded successfully!')
    }
    dbConnection.end()
  })
}

seedUsers()
