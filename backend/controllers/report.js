import formidable from 'formidable'
import Report from '../models/report.js'
import { Parser } from 'json2csv'
import pdf from 'pdfkit'
import { fileURLToPath } from 'url'
import { dbConnection } from '../config/db.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import xmlbuilder from 'xmlbuilder'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET

import fs from 'fs'
import path from 'path'

export const createReport = async (req, res) => {
  if (req.method.toLowerCase() === 'post') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const uploadDir = path.join(__dirname, '../uploads')

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      multiples: false,
      allowEmptyFiles: true,
      minFileSize: 0,
    })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err)
        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' })
        res.end(String(err))
        return
      }

      try {
        const {
          species,
          reporterName,
          reporterEmail,
          reporterPhone,
          latitude,
          longitude,
          date,
          time,
          description,
          dangerLevel,
          reportType,
        } = fields

        const photo =
          files.photo && files.photo.length > 0 ? files.photo[0].filepath : null

        const reportData = {
          species,
          reporterName,
          reporterEmail,
          reporterPhone,
          latitude,
          longitude,
          date,
          time,
          description,
          photo,
          dangerLevel,
          reportType,
        }

        Report.create(reportData, (err, result) => {
          if (err) {
            console.error('Database error:', err)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Error creating report' }))
            return
          }
          res.writeHead(201, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              message: 'Report created successfully',
              photoPath: photo,
            })
          )
        })
      } catch (err) {
        console.error('Error processing report data:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Error processing report data' }))
      }
    })
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    res.end('Method Not Allowed')
  }
}

export const filterReports = async (req, res) => {
  const form = formidable()

  form.parse(req, async (err, fields) => {
    if (err) {
      console.error('Error parsing form data:', err)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error parsing form data' }))
      return
    }

    const { species, dangerLevel, reportType, fromDate, toDate, fileFormat } =
      fields

    // console.log(fields)

    if (!fileFormat) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Missing required fields' }))
      return
    }

    let criteria = {}
    if (species) criteria.species = species
    if (dangerLevel) criteria.dangerLevel = dangerLevel
    if (reportType) criteria.reportType = reportType
    if (fromDate && toDate) {
      criteria.dateRange = { from: new Date(fromDate), to: new Date(toDate) }
    }

    try {
      const reports = await fetchReports(criteria)
      const statistics = generateStatistics(reports, criteria)

      if (reports.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'No reports found' }))
        return
      }

      generateReport(res, reports, statistics, fileFormat)
    } catch (err) {
      console.error('Error fetching reports:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Error fetching reports',
          error: err.message,
        })
      )
    }
  })
}

const fetchReports = criteria => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM reports WHERE 1=1'
    let params = []

    if (criteria.species) {
      query += ' AND species = ?'
      params.push(criteria.species)
    }
    if (criteria.dangerLevel) {
      query += ' AND dangerLevel = ?'
      params.push(criteria.dangerLevel)
    }
    if (criteria.reportType) {
      query += ' AND reportType = ?'
      params.push(criteria.reportType)
    }
    if (criteria.dateRange) {
      query += ' AND date BETWEEN ? AND ?'
      params.push(criteria.dateRange.from, criteria.dateRange.to)
    }

    dbConnection.query(query, params, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

const generateStatistics = (reports, criteria) => {
  const totalReports = reports.length
  const lastMonthReports = reports.filter(report => {
    const reportDate = new Date(report.date)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    return reportDate >= oneMonthAgo
  }).length

  const statistics = {
    totalReports,
    lastMonthReports,
    criteria,
  }

  if (criteria.species) {
    statistics.mostAffectedSpecies = criteria.species
  } else if (criteria.dangerLevel) {
    statistics.mostAffectedDangerLevel = criteria.dangerLevel
  } else if (criteria.reportType) {
    statistics.mostCommonReportType = criteria.reportType
  }

  return statistics
}

const generateReport = (res, reports, statistics, fileFormat) => {
  try {
    if (fileFormat === 'CSV') {
      const json2csvParser = new Parser()
      const csv = json2csvParser.parse(reports)

      res.setHeader('Content-Disposition', 'attachment; filename=reports.csv')
      res.setHeader('Content-Type', 'text/csv')
      res.end(csv)
    } else if (fileFormat === 'PDF') {
      const doc = new pdf()

      res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf')
      res.setHeader('Content-Type', 'application/pdf')

      doc.pipe(res)
      doc.text(`Total Reports: ${statistics.totalReports}`)
      doc.moveDown()
      doc.text(`Reports in the Last Month: ${statistics.lastMonthReports}`)
      doc.moveDown()
      if (statistics.mostAffectedSpecies) {
        doc.text(`Most Affected Species: ${statistics.mostAffectedSpecies}`)
        doc.moveDown()
      }
      if (statistics.mostAffectedDangerLevel) {
        doc.text(
          `Most Affected Danger Level: ${statistics.mostAffectedDangerLevel}`
        )
        doc.moveDown()
      }
      if (statistics.mostCommonReportType) {
        doc.text(`Most Common Report Type: ${statistics.mostCommonReportType}`)
        doc.moveDown()
      }
      doc.text(`Criteria: ${JSON.stringify(statistics.criteria)}`)
      doc.moveDown(2) // Add extra space after the criteria

      reports.forEach(report => {
        doc.text(`Species: ${report.species}`)
        doc.moveDown()
        doc.text(`Reporter Name: ${report.reporterName}`)
        doc.moveDown()
        doc.text(`Reporter Email: ${report.reporterEmail}`)
        doc.moveDown()
        doc.text(`Reporter Phone: ${report.reporterPhone}`)
        doc.moveDown()
        doc.text(`Latitude: ${report.latitude}`)
        doc.moveDown()
        doc.text(`Longitude: ${report.longitude}`)
        doc.moveDown()
        doc.text(`Date: ${report.date}`)
        doc.moveDown()
        doc.text(`Time: ${report.time}`)
        doc.moveDown()
        doc.text(`Description: ${report.description}`)
        doc.moveDown()
        if (report.photo) {
          const imagePath = path.resolve(report.photo)
          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, {
              fit: [250, 300],
              align: 'center',
              valign: 'center',
            })
            doc.moveDown(3)
          }
        } else {
          doc.moveDown(2)
        }
        doc.addPage()
      })

      doc.end()
    } else if (fileFormat === 'HTML') {
      let html = `
      <html>
        <body>
          <h1>Report Statistics</h1>
          <p>Total Reports: ${statistics.totalReports}</p>
          <p>Reports in the Last Month: ${statistics.lastMonthReports}</p>`
      if (statistics.mostAffectedSpecies) {
        html += `<p>Most Affected Species: ${statistics.mostAffectedSpecies}</p>`
      }
      if (statistics.mostAffectedDangerLevel) {
        html += `<p>Most Affected Danger Level: ${statistics.mostAffectedDangerLevel}</p>`
      }
      if (statistics.mostCommonReportType) {
        html += `<p>Most Common Report Type: ${statistics.mostCommonReportType}</p>`
      }
      html += `<p>Criteria: ${JSON.stringify(statistics.criteria)}</p>`
      html += `<table border="1">
              <tr>
                <th>Species</th>
                <th>Reporter Name</th>
                <th>Reporter Email</th>
                <th>Reporter Phone</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Date</th>
                <th>Time</th>
                <th>Description</th>
                <th>Photo</th>
              </tr>`
      reports.forEach(report => {
        html += `<tr>
          <td>${report.species}</td>
          <td>${report.reporterName}</td>
          <td>${report.reporterEmail}</td>
          <td>${report.reporterPhone}</td>
          <td>${report.latitude}</td>
          <td>${report.longitude}</td>
          <td>${report.date}</td>
          <td>${report.time}</td>
          <td>${report.description}</td>`
        if (report.photo) {
          const imagePath = path.resolve(report.photo)
          if (fs.existsSync(imagePath)) {
            const imageBase64 = fs.readFileSync(imagePath, 'base64')
            html += `<td><img src="data:image/jpeg;base64,${imageBase64}" width="100" height="100"></td>`
          } else {
            html += `<td>No Image</td>`
          }
        } else {
          html += `<td>No Image</td>`
        }
        html += `</tr>`
      })
      html += `</table></body></html>`

      res.setHeader('Content-Disposition', 'attachment; filename=reports.html')
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Invalid file format' }))
    }
  } catch (err) {
    console.error('Error generating report:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error generating report' }))
  }
}

export const getMostRecentReports = (req, res) => {
  const limit = 5
  Report.getMostRecent(limit, (err, reports) => {
    if (err) {
      console.error('Database error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error fetching reports' }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(reports))
  })
}

export const getAllReports = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No token provided' }))
    return
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (decoded.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Access denied' }))
      return
    }

    Report.getAll((err, reports) => {
      if (err) {
        console.error('Error fetching reports:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Error fetching reports' }))
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(reports))
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error verifying token' }))
  }
}

export const updateReport = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No token provided' }))
    return
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (decoded.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Access denied' }))
      return
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const {
          id,
          species,
          reporterName,
          reporterEmail,
          reporterPhone,
          latitude,
          longitude,
          date,
          time,
          description,
          dangerLevel,
          reportType,
        } = JSON.parse(body)

        Report.getById(id, (err, existingReport) => {
          if (err || !existingReport) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Report not found' }))
            return
          }

          const reportData = {
            species,
            reporterName,
            reporterEmail,
            reporterPhone,
            latitude,
            longitude,
            date,
            time,
            description,
            photo: existingReport.photo,
            dangerLevel,
            reportType,
          }

          Report.update(id, reportData, (err, result) => {
            if (err) {
              console.error('Error updating report:', err)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ message: 'Error updating report' }))
              return
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Report updated successfully' }))
          })
        })
      } catch (error) {
        console.error('Error processing request:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Error processing request' }))
      }
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error verifying token' }))
  }
}
export const deleteReport = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No token provided' }))
    return
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (decoded.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Access denied' }))
      return
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const { id } = JSON.parse(body)

        Report.delete(id, (err, result) => {
          if (err) {
            console.error('Error deleting report:', err)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Error deleting report' }))
            return
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Report deleted successfully' }))
        })
      } catch (error) {
        console.error('Error processing request:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Error processing request' }))
      }
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Error verifying token' }))
  }
}

export const generateRSSFeed = (req, res) => {
  Report.getAll((err, reports) => {
    if (err) {
      console.error('Error fetching reports:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error fetching reports' }))
      return
    }

    const feed = xmlbuilder.create('rss', { encoding: 'utf-8' })
    feed.att('version', '2.0')

    const channel = feed.ele('channel')
    channel.ele('title', 'Animal Reports RSS Feed')
    channel.ele('link', 'http://localhost:3000/report/rss')
    channel.ele('description', 'Latest animal reports')

    reports.forEach(report => {
      const item = channel.ele('item')
      item.ele('title', report.species)
      item.ele('description', report.description)
      item.ele('link', `http://localhost:3000/report/${report.id}`)
      item.ele('guid', report.id)

      const utcDate = new Date(report.date)
      const localDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000)

      const formattedLocalDate = localDate.toISOString().split('T')[0]

      const dateTime = `${formattedLocalDate}T${report.time}+03:00`
      const pubDate = new Date(dateTime)

      item.ele('pubDate', pubDate.toUTCString())
    })

    res.writeHead(200, { 'Content-Type': 'application/rss+xml' })
    res.end(feed.end({ pretty: true }))
  })
}

export const getReportById = (req, res) => {
  const id = req.params.id
  Report.getById(id, (err, report) => {
    if (err) {
      console.error('Error fetching report:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Error fetching report' }))
      return
    }
    if (!report) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Report not found' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Report Details</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <h1>${report.species}</h1>
        <p><strong>Date:</strong> ${report.date}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Reporter Name:</strong> ${report.reporterName}</p>
        <p><strong>Email:</strong> ${report.reporterEmail}</p>
        <p><strong>Phone:</strong> ${report.reporterPhone}</p>
        <p><strong>Danger Level:</strong> ${report.dangerLevel}</p>
        <p><strong>Report Type:</strong> ${report.reportType}</p>
        
      </body>
      </html>
    `)
  })
}
