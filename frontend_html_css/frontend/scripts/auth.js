document.addEventListener('DOMContentLoaded', function () {
  updateAuthenticationUI()

  document.getElementById('logout').addEventListener('click', function (e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    updateAuthenticationUI()
    window.location.href = 'index.html'
  })
})

function updateAuthenticationUI() {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  if (user && user.role === 'admin') {
    document.querySelector('.manage-dropdown').style.display = 'block'
  }

  if (token && user) {
    document.getElementById(
      'auth-placeholder'
    ).textContent = `${user.nume} ${user.prenume}`
    document.getElementById(
      'login-dropdown-content'
    ).children[0].style.display = 'none'
    document.getElementById(
      'login-dropdown-content'
    ).children[1].style.display = 'none'
    document.getElementById('logout').style.display = 'block'
  } else {
    document.getElementById('auth-placeholder').textContent = 'Autentificare'
    document.getElementById(
      'login-dropdown-content'
    ).children[0].style.display = 'block'
    document.getElementById(
      'login-dropdown-content'
    ).children[1].style.display = 'block'
    document.getElementById('logout').style.display = 'none'
  }
}
