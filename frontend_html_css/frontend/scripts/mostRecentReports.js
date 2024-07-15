document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('No token found in localStorage')
    return
  }

  fetch('http://localhost:3000/report/most-recent', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }
      return response.json()
    })
    .then(data => {
      const carouselContent = document.getElementById('carousel-content')
      carouselContent.innerHTML = ''

      data.forEach(report => {
        const carouselItem = document.createElement('div')
        carouselItem.classList.add('carousel-item')

        const reportDetails = `
            <div class="report">
              <img src="${report.photo}" alt="Image of ${report.species}" loading="lazy" />
              <div class="report-details">
                <p><strong>Nume:</strong> ${report.reporterName}</p>
                <p><strong>Telefon:</strong> ${report.reporterPhone}</p>
                <p><strong>Descriere:</strong> ${report.description}</p>
              </div>
            </div>
          `

        carouselItem.innerHTML = reportDetails
        carouselContent.appendChild(carouselItem)
      })
    })
    .catch(error => {
      console.error('Error:', error)
      alert('A apărut o eroare la încărcarea raporturilor recente.')
    })
})
