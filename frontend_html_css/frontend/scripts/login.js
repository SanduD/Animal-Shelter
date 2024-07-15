document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault()

  const formData = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  }

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()
    console.log(data)

    if (response.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = 'index.html'
    } else {
      document.getElementById('error-message').textContent = data.message
      document.getElementById('error-message').style.display = 'block'
    }
  } catch (error) {
    console.error('Error:', error)
    document.getElementById('error-message').textContent =
      'A apărut o eroare. Vă rugăm să încercați din nou.'
    document.getElementById('error-message').style.display = 'block'
  }
})

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault()

  const formData = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  }

  $.ajax({
    url: 'http://localhost:3000/auth/login',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(formData),
    success: function (data) {
      console.log(data)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = 'index.html'
    },
    error: function (xhr, status, error) {
      console.error('Error:', error)
      const data = xhr.responseJSON
      document.getElementById('error-message').textContent = data
        ? data.message
        : 'A apărut o eroare. Vă rugăm să încercați din nou.'
      document.getElementById('error-message').style.display = 'block'
    },
  })
})
