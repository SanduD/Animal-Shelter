document.addEventListener('DOMContentLoaded', () => {
  fetchRSSFeed()

  async function fetchRSSFeed() {
    try {
      const response = await fetch('http://localhost:3000/report/rss')
      const text = await response.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'application/xml')
      displayRSSFeed(xml)
    } catch (error) {
      console.error('Error fetching RSS feed:', error)
    }
  }

  function displayRSSFeed(xml) {
    const items = xml.querySelectorAll('item')
    const feedContainer = document.getElementById('rss-feed')

    items.forEach(item => {
      const title = item.querySelector('title').textContent
      const description = item.querySelector('description').textContent
      const link = item.querySelector('link').textContent
      const pubDate = new Date(item.querySelector('pubDate').textContent)

      const itemElement = document.createElement('div')
      itemElement.className = 'rss-item'
      itemElement.innerHTML = `
          <h3><a href="${link}" target="_blank">${title}</a></h3>
          <p>${description}</p>
          <p><small>Published on: ${pubDate.toLocaleString()}</small></p>
        `

      feedContainer.appendChild(itemElement)
    })
  }
})
