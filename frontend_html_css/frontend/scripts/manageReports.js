document.addEventListener('DOMContentLoaded', () => {
  fetchReports()

  async function fetchReports() {
    try {
      const response = await fetch('http://localhost:3000/report', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const reports = await response.json()
      populateReportsTable(reports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  function populateReportsTable(reports) {
    const reportsTableBody = document
      .getElementById('reports-table')
      .querySelector('tbody')
    reportsTableBody.innerHTML = '' // Clear existing rows

    reports.forEach(report => {
      const row = document.createElement('tr')
      row.innerHTML = `
            <td>${report.id}</td>
            <td>${report.species}</td>
            <td>${report.reporterName}</td>
            <td>${report.reporterEmail}</td>
            <td>${report.reporterPhone}</td>
            <td>${report.latitude}</td>
            <td>${report.longitude}</td>
            <td>${report.date}</td>
            <td>${report.time}</td>
            <td>${report.description}</td>
            <td>${report.dangerLevel}</td>
            <td>${report.reportType}</td>
            <td>
              <button class="action-btn edit-btn" data-id="${report.id}">
                <img src="images/edit-icon.png" alt="Edit">
              </button>
              <button class="action-btn delete-btn" data-id="${report.id}">
                <img src="images/delete-icon.png" alt="Delete">
              </button>
            </td>
          `
      reportsTableBody.appendChild(row)
    })

    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', handleEditReport)
    })

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', handleDeleteReport)
    })
  }

  function handleEditReport(event) {
    const reportId = event.currentTarget.getAttribute('data-id')
    const row = event.currentTarget.closest('tr')
    const species = row.cells[1].innerText
    const reporterName = row.cells[2].innerText
    const reporterEmail = row.cells[3].innerText
    const reporterPhone = row.cells[4].innerText
    const latitude = row.cells[5].innerText
    const longitude = row.cells[6].innerText
    const date = row.cells[7].innerText
    const time = row.cells[8].innerText
    const description = row.cells[9].innerText
    const dangerLevel = row.cells[10].innerText
    const reportType = row.cells[11].innerText

    // Set existing values
    document.getElementById('editReportId').value = reportId
    document.getElementById('editSpecies').value = species
    document.getElementById('editReporterName').value = reporterName
    document.getElementById('editReporterEmail').value = reporterEmail
    document.getElementById('editReporterPhone').value = reporterPhone
    document.getElementById('editLatitude').value = latitude
    document.getElementById('editLongitude').value = longitude
    document.getElementById('editDescription').value = description
    document.getElementById('editDangerLevel').value = dangerLevel
    document.getElementById('editReportType').value = reportType

    // Set default date and time
    const now = new Date(date)
    document.getElementById('editDate').value = now
      .toISOString()
      .substring(0, 10)
    document.getElementById('editTime').value = time.slice(0, 5)

    document.getElementById('editReportModal').style.display = 'block'
  }

  function closeEditModal() {
    document.getElementById('editReportModal').style.display = 'none'
  }

  document.querySelector('.close').addEventListener('click', closeEditModal)

  document
    .getElementById('editReportForm')
    .addEventListener('submit', async function (e) {
      e.preventDefault()

      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData.entries())

      try {
        const response = await fetch('http://localhost:3000/report/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()
        alert(result.message)
        fetchReports()
        closeEditModal()
      } catch (error) {
        console.error('Error updating report:', error)
      }
    })

  async function handleDeleteReport(event) {
    const reportId = event.currentTarget.getAttribute('data-id')
    try {
      const response = await fetch(`http://localhost:3000/report/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ id: reportId }),
      })

      const result = await response.json()
      alert(result.message)
      fetchReports()
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }
})
