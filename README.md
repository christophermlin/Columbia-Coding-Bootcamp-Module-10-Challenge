# 10 SQL: Employee Tracker

A command-line application to manage a company's employee database using Node.js, TypeScript, Inquirer, and PostgreSQL.

## Features
- View all departments, roles, and employees
- Add a department, role, or employee
- Update an employee's role
- Data stored in PostgreSQL

## Setup
1. Clone this repo and run `npm install` in the `Develop` folder.
2. Create a PostgreSQL database and user.
3. Add a `.env` file in the `Develop` folder with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=employee_db
   ```
4. Run the schema and seeds SQL files to set up your database:
   ```bash
   psql -U your_user -d employee_db -f db/schema.sql
   psql -U your_user -d employee_db -f db/seeds.sql
   ```
5. Build the TypeScript project:
   ```bash
   npm run build
   ```
6. Start the app:
   ```bash
   npm start
   ```
   Or, for development with live TypeScript execution:
   ```bash
   npm run dev
   ```

## Usage
- Follow the prompts in the terminal to manage departments, roles, and employees.
- All data is stored in PostgreSQL.

## Video Walkthrough
_Add your walkthrough video link here._

## License
MIT

---
© 2024 edX Boot Camps LLC. Confidential and Proprietary. All Rights Reserved.
