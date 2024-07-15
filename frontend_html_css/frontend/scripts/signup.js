document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault()

  const formData = {
    nume: document.getElementById('last-name').value,
    prenume: document.getElementById('first-name').value,
    telefon: document.getElementById('phone').value,
    judet: document.getElementById('county').value,
    adresa: document.getElementById('address').value,
    email: document.getElementById('signup-email').value,
    password: document.getElementById('signup-password').value,
  }

  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

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
