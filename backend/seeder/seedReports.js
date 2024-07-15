import { dbConnection, connectToDatabase } from '../config/db.js'
import { faker } from '@faker-js/faker'

const species = [
  'Ciobănesc German',
  'Husky',
  'Golden Retriever',
  'Bulldog Englez',
  'Beagle',
  'Pudel',
  'Rottweiler',
  'Boxer',
  'Teckel',
  'Dogo Argentino',
  'Border Collie',
  'Shih Tzu',
  'Doberman',
  'Malamut de Alaska',
  'Chihuahua',
  'Cocker Spaniel',
  'Dachshund',
  'Great Dane',
  'Mastiff',
  'Pomeranian',
]

const dangerLevels = ['Ridicat', 'Mediu', 'Mic']
const reportTypes = ['Infiat', 'Dresat', 'Instiintare']

const generateRandomReport = index => {
  const speciesIndex = Math.floor(Math.random() * species.length)
  const dangerLevelIndex = Math.floor(Math.random() * dangerLevels.length)
  const reportTypeIndex = Math.floor(Math.random() * reportTypes.length)

  return {
    species: species[speciesIndex],
    reporterName: faker.person.fullName(),
    reporterEmail: faker.internet.email(),
    reporterPhone: `07${faker.string.numeric(8)}`, // Generating Romanian phone numbers
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    date: faker.date
      .between({ from: '2024-06-01', to: '2024-06-30' })
      .toISOString()
      .split('T')[0],
    time: faker.date.recent().toISOString().split('T')[1].split('.')[0], // Adjusting time format
    description: faker.lorem.sentences(3),
    photo: `E:\\1. Toate temele\\8.TIMISOARA Tehnologii-Web-main\\backend\\uploads\\photo${
      (index % 2) + 1
    }.jpg`,
    dangerLevel: dangerLevels[dangerLevelIndex],
    reportType: reportTypes[reportTypeIndex],
  }
}

const seedReports = async () => {
  await connectToDatabase()

  const reports = []
  for (let i = 0; i < 20; i++) {
    reports.push(generateRandomReport(i))
  }

  const query = `
    INSERT INTO reports 
    (species, reporterName, reporterEmail, reporterPhone, latitude, longitude, date, time, description, photo, dangerLevel, reportType) 
    VALUES ?
  `

  const values = reports.map(report => [
    report.species,
    report.reporterName,
    report.reporterEmail,
    report.reporterPhone,
    report.latitude,
    report.longitude,
    report.date,
    report.time,
    report.description,
    report.photo,
    report.dangerLevel,
    report.reportType,
  ])

  dbConnection.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error seeding reports:', err)
    } else {
      console.log('Reports seeded successfully!')
    }
    dbConnection.end()
  })
}

seedReports()
