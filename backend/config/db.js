import mysql from 'mysql'

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'AnimalShelter',
}

let dbConnection

const connectToDatabase = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    connection.connect(err => {
      if (err) {
        reject('Error connecting to the database:', err.stack)
        return
      }
      console.log('Connected to MySQL')

      connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``,
        (err, result) => {
          if (err) {
            reject('Error creating database:', err.stack)
            connection.end()
            return
          }
          console.log(
            `Database ${dbConfig.database} exists or created successfully`
          )

          dbConnection = mysql.createConnection(dbConfig)
          dbConnection.connect(err => {
            if (err) {
              reject('Error connecting to the database:', err.stack)
              return
            }
            console.log('Connected to the database')
            const createUsersTableQuery = `
              CREATE TABLE IF NOT EXISTS users (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  nume VARCHAR(255) NOT NULL,
                  prenume VARCHAR(255) NOT NULL,
                  telefon VARCHAR(20) NOT NULL,
                  judet VARCHAR(255) NOT NULL,
                  adresa VARCHAR(255),
                  email VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  role VARCHAR(255) NOT NULL
              );
            `
            const createReportsTableQuery = `
              CREATE TABLE IF NOT EXISTS reports (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  species VARCHAR(255) NOT NULL,
                  reporterName VARCHAR(255),
                  reporterEmail VARCHAR(255),
                  reporterPhone VARCHAR(20),
                  latitude DECIMAL(10, 8) NOT NULL,
                  longitude DECIMAL(11, 8) NOT NULL,
                  date DATE NOT NULL,
                  time TIME NOT NULL,
                  description TEXT NOT NULL,
                  dangerLevel TEXT NOT NULL,
                  reportType TEXT NOT NULL,
                  photo VARCHAR(255)
              );
            `
            dbConnection.query(createUsersTableQuery, (err, result) => {
              if (err) {
                reject('Error creating users table:', err.stack)
                return
              }
              console.log('Users table exists or created successfully')
              dbConnection.query(createReportsTableQuery, (err, result) => {
                if (err) {
                  reject('Error creating reports table:', err.stack)
                  return
                }
                console.log('Reports table exists or created successfully')
                resolve(dbConnection)
              })
            })
          })
        }
      )
    })
  })
}

export { connectToDatabase, dbConnection }
