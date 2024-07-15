# Web Services for Authentication and User Management


![WhatsApp Image 2024-06-24 at 17 50 09_8f8abcbf](https://github.com/user-attachments/assets/2402a6d6-3696-4c35-b679-a68a28f28f0e)

## User Services

### User Registration (/auth/register)
- **Method:** POST
- **Functionality:** Allows users to register in the application. Receives data such as first name, last name, email, phone, state, address, and password, encrypts the password, and saves the data in the database.

### User Login (/auth/login)
- **Method:** POST
- **Functionality:** Allows users to log in. Receives email and password, verifies if the user exists and if the password is correct, and returns a JWT for further authentication.

### User Update (/auth/update)
- **Method:** PUT
- **Functionality:** Allows updating user data. Receives the updated user data and saves it in the database. This endpoint is protected by JWT authentication and allows access only to authenticated users.

### User Deletion (/auth/delete)
- **Method:** DELETE
- **Functionality:** Allows deleting a user from the database. This endpoint is protected by JWT authentication and allows access only to authenticated users.

### Get All Users (/auth/users)
- **Method:** GET
- **Functionality:** Returns a list of all users in the database. This endpoint is protected by JWT authentication and allows access only to users with an administrator role.

## Report Services

### Create Report (/report)
- **Method:** POST
- **Functionality:** Allows users to create a new report about an animal. Receives data such as species, reporter's name, email, phone, location (latitude and longitude), date and time of observation, situation description, danger level, report type, and optionally a photo.

### Filter Reports (/report/filter)
- **Method:** POST
- **Functionality:** Allows filtering reports based on various criteria (species, danger level, report type, date). Returns reports in the specified format (CSV, PDF, HTML).

### Get Latest Reports (/report/latest)
- **Method:** GET
- **Functionality:** Returns the latest 5 reports about animals, based on the reporting date.

# User Interface (Front-end)

## Step 1: User Interface

### login.html Page
- **Functionality:** 
  - User fills out the login form with email and password.
  - On submit, the `login.js` script is invoked.
- **Technologies Used:**
  - **HTML:** Basic structure of the login form.
  - **CSS:** Styling for the page and form.

### login.js Script
- **Functionality:** 
  - Captures the submit event and prevents page reload using `e.preventDefault()`.
  - Collects data from the form and initiates an HTTP POST request to the server using `fetch()`.
  - Sends data in JSON format and receives the server response.
- **Technologies Used:**
  - **JavaScript:** Event handling and request management.
  - **Fetch API:** Performing asynchronous HTTP requests.
  - **Local Storage:** Storing the JWT token received from the server.

## Step 2: Server (Back-end)

### Node.js Server
- **Functionality:** 
  - The server receives the request at the `/auth/login` route.
  - `authRoutes` determines which controller to invoke.
- **Technologies Used:**
  - **Node.js:** JavaScript runtime environment on the server side.

### auth.js Controller
- **Functionality:** 
  - Executes the `login` function.
  - User data is extracted and verified in the database.
  - Compares the received password with the stored hash using `bcrypt`.
  - If authentication is successful, generates a JWT and sends it back to the client.
- **Technologies Used:**
  - **Bcrypt:** Hashing and verifying passwords.
  - **JSON Web Tokens (JWT):** Creating session tokens.
  - **Dotenv:** Managing private configurations.

## Step 3: Database

### MySQL Database
- **Functionality:** 
  - Establishes a connection to the database using configurations from `db.js`.
  - Executes necessary queries to verify and validate user data.
- **Technologies Used:**
  - **MySQL:** Relational database management system.

## Step 4: Client Response

### Response to login.js
- **Functionality:** 
  - `login.js` script processes the server response.
  - If the response includes a JWT token, it is stored in `localStorage`, and the user is considered authenticated.
  - User is redirected to the main page or another authorized section.
  - If authentication fails, an error message is displayed on the login page.
