# Task Management System

## Overview

This is a full-stack web application designed for task management, utilizing React for the frontend and Express for the backend. The application incorporates Material-UI (MUI) for a sleek and responsive user interface and communicates with the server using
## Features

### User Management

<img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/ea68a234-4126-422b-8b0e-d3a885ae1c07" width="80%" alt="drawing"/>
<br>
Admin page for creating and managing all users.

<br>
<br>
<br>

<img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/74e23e32-653d-43a3-87cf-5dab96ca6bab" width="80%" alt="drawing"/>
<br>
Managing your own profile.

### Task Management
<img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/6704ee80-1715-4321-aff8-336c20af3be7" width="80%" alt="drawing"/>
<br>
Application selection

<br>
<br>
<br>

<div>
  <img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/1e7fb29e-4325-45ae-92bc-8e8fcd487bc3" width="445px" alt="drawing"/>
  <img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/203dcd9b-7fbe-408a-af0f-0953f36b6fc7" width="452px" alt="drawing"/>  
</div>
View tasks and plans

<br>
<br>
<br>

<div>
  <img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/4df33067-a84e-4c9c-af28-142cf7400db4" width="450px" alt="drawing"/>
  <img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/c75a8041-720f-4c6a-9835-2501198141bd" width="448px" alt="drawing"/>
</div>
Manage tasks

<br>
<br>
<br>

## Tech Stack

### MERN
<div>
	<img src="https://github.com/jerryk1997/tms_react_express/assets/54168384/e759fd9f-aef9-4f44-ab45-6dbdf2713cbb" alt="drawing" height="40" style="margin-right: 80px;"/>
	<img src="https://miro.medium.com/v2/resize:fit:1400/1*i2fRBk3GsYLeUk_Rh7AzHw.png" alt="drawing" height="40" style="margin-right: 80px;"/>
	<img src="https://raw.githubusercontent.com/llanojs/Readme_template/master/react-logo.jpg" alt="drawing" height="40" style="margin-right: 80px;"/>
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/2560px-Node.js_logo.svg.png" alt="drawing" height="40" />
</div>
<br>
<br>
<br>
The MERN stack, traditionally consisting of MongoDB, Express.js, React.js, and Node.js, forms a cohesive and efficient technology stack for developing web applications. The stack leverages a unified JavaScript language across the entire application, streamlining development and promoting code reusability. The frontend benefits from React's declarative and component-based architecture, enabling a dynamic and responsive user interface. On the backend, Express.js, coupled with Node.js, provides a lightweight and flexible server environment, allowing for the creation of robust APIs. While the traditional MERN stack incorporates MongoDB as a NoSQL database, substituting it with MySQL introduces a relational database paradigm, offering transactional support and a structured data model. This adaptation caters to projects where relational data integrity is a priority, while still retaining the agility and efficiency of the MERN stack for full-stack JavaScript development.

## Getting Started
### Database
This application uses MySQL as its database, make sure you have it [installed](https://dev.mysql.com/downloads/installer/).<br>
Use the provided `database_setup.sql` to set up your database's schema and populate it with default user and user groups to allow you to begin using the application
##### Default users:
- Admin
	- Username: `admin`
   	- Password: `abc123!!`
- Project lead
	- Username: `project lead`
   	- Password: `abc123!!`
   	- 
### Environment Variables
Use the provided `backend/config/.env` and set up your environment variables.
- Configure your database connection to your MySQL server instance
- Change the JWT secret

The final section of the environment variables is dedicated to configuring the SMTP (Simple Mail Transfer Protocol) settings for email functionality within the application. I use [mailtrap](https://mailtrap.io/?gad_source=1) to test the email functionality, but feel free to set up your own SMTP connection.

Finally make sure to copy the `.env.template` into a new `.env` file before making changes.

### Start the application

To run the application after completing the set up above, follow these steps:

1.  Install all dependencies

	```bash
	npm run install-all

2. Run application

	```bash
	npm run start

3. Access the web page using http://localhost:3000
