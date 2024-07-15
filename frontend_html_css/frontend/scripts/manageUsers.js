document.addEventListener('DOMContentLoaded', () => {
  fetchUsers()

  async function fetchUsers() {
    try {
      const response = await fetch('http://localhost:3000/auth/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const users = await response.json()
      populateUsersTable(users)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  function populateUsersTable(users) {
    const usersTableBody = document
      .getElementById('users-table')
      .querySelector('tbody')
    usersTableBody.innerHTML = '' // Clear existing rows

    users.forEach(user => {
      const row = document.createElement('tr')
      row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nume}</td>
            <td>${user.prenume}</td>
            <td>${user.email}</td>
            <td>${user.telefon}</td>
            <td>${user.judet}</td>
            <td>${user.adresa}</td>
            <td>${user.role}</td>
            <td>
              <button class="action-btn edit-btn" data-id="${user.id}">
                <img src="images/edit-icon.png" alt="Edit">
              </button>
              <button class="action-btn delete-btn" data-id="${user.id}">
                <img src="images/delete-icon.png" alt="Delete">
              </button>
            </td>
          `
      usersTableBody.appendChild(row)
    })

    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', handleEditUser)
    })

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', handleDeleteUser)
    })
  }

  function handleEditUser(event) {
    const userId = event.currentTarget.getAttribute('data-id')
    console.log('Editing user with ID:', userId)
    const row = event.currentTarget.closest('tr')
    const userName = row.cells[1].innerText
    const userPrenume = row.cells[2].innerText
    const userEmail = row.cells[3].innerText
    const userTelefon = row.cells[4].innerText
    const userJudet = row.cells[5].innerText
    const userAdresa = row.cells[6].innerText
    const userRole = row.cells[7].innerText

    document.getElementById('editUserId').value = userId
    document.getElementById('editUserName').value = userName
    document.getElementById('editUserPrenume').value = userPrenume
    document.getElementById('editUserEmail').value = userEmail
    document.getElementById('editUserTelefon').value = userTelefon
    document.getElementById('editUserJudet').value = userJudet
    document.getElementById('editUserAdresa').value = userAdresa
    document.getElementById('editUserRole').value = userRole

    document.getElementById('editUserModal').style.display = 'block'
    console.log('Modal should be visible now')
  }

  function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none'
  }

  document.querySelector('.close').addEventListener('click', closeEditModal)

  window.onclick = function (event) {
    const modal = document.getElementById('editUserModal')
    if (event.target == modal) {
      modal.style.display = 'none'
    }
  }

  document
    .getElementById('editUserForm')
    .addEventListener('submit', async function (e) {
      e.preventDefault()

      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData.entries())
      console.log('Submitting update for user:', data)

      try {
        const response = await fetch('http://localhost:3000/auth/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()
        alert(result.message)
        fetchUsers()
        closeEditModal()
      } catch (error) {
        console.error('Error updating user:', error)
      }
    })

  async function handleDeleteUser(event) {
    const userId = event.currentTarget.getAttribute('data-id')
    try {
      const response = await fetch(`http://localhost:3000/auth/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: userId }),
      })

      const result = await response.json()
      alert(result.message)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
})
