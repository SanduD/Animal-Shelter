import { dbConnection } from '../config/db.js'

const Report = {
  create: (reportData, callback) => {
    const query = `
    INSERT INTO reports 
    (species, reporterName, reporterEmail, reporterPhone, latitude, longitude, date, time, description, photo, dangerLevel, reportType) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    dbConnection.query(
      query,
      [
        reportData.species,
        reportData.reporterName,
        reportData.reporterEmail,
        reportData.reporterPhone,
        reportData.latitude,
        reportData.longitude,
        reportData.date,
        reportData.time,
        reportData.description,
        reportData.photo,
        reportData.dangerLevel,
        reportData.reportType,
      ],
      callback
    )
  },
  getAll: callback => {
    const query = 'SELECT * FROM reports ORDER BY date DESC, time DESC'
    dbConnection.query(query, callback)
  },
  getById: (id, callback) => {
    const query = 'SELECT * FROM reports WHERE id = ?'
    dbConnection.query(query, [id], (err, results) => {
      if (err) {
        return callback(err, null)
      }
      // console.log('Results from getById:', results)
      callback(null, results[0])
    })
  },

  filter: (criteria, callback) => {
    let query = 'SELECT * FROM reports WHERE 1=1'
    let queryParams = []
    if (criteria.species) {
      query += ' AND species = ?'
      queryParams.push(criteria.species)
    }
    if (criteria.startDate && criteria.endDate) {
      query += ' AND date BETWEEN ? AND ?'
      queryParams.push(
        criteria.startDate.toISOString().split('T')[0],
        criteria.endDate.toISOString().split('T')[0]
      )
    }
    dbConnection.query(query, queryParams, callback)
  },

  getMostRecent: (limit, callback) => {
    const query = `SELECT * FROM reports ORDER BY date DESC LIMIT ?`
    dbConnection.query(query, [limit], callback)
  },
  update: (id, reportData, callback) => {
    const query = `
      UPDATE reports 
      SET species = ?, reporterName = ?, reporterEmail = ?, reporterPhone = ?, latitude = ?, longitude = ?, date = ?, time = ?, description = ?, photo = ?, dangerLevel = ?, reportType = ?
      WHERE id = ?
    `
    dbConnection.query(
      query,
      [
        reportData.species,
        reportData.reporterName,
        reportData.reporterEmail,
        reportData.reporterPhone,
        reportData.latitude,
        reportData.longitude,
        reportData.date,
        reportData.time,
        reportData.description,
        reportData.photo,
        reportData.dangerLevel,
        reportData.reportType,
        id,
      ],
      callback
    )
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM reports WHERE id = ?'
    dbConnection.query(query, [id], callback)
  },
}

export default Report
