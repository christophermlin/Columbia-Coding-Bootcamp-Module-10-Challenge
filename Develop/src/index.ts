import dotenv from 'dotenv';
dotenv.config();
import inquirer from 'inquirer';
import { Client } from 'pg';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'employee_db',
});

async function mainMenu(): Promise<void> {
  const { action }: { action: string } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Update an employee manager',
        'View employees by manager',
        'View employees by department',
        'Delete a department',
        'Delete a role',
        'Delete an employee',
        'View department budget',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Update an employee manager':
      await updateEmployeeManager();
      break;
    case 'View employees by manager':
      await viewEmployeesByManager();
      break;
    case 'View employees by department':
      await viewEmployeesByDepartment();
      break;
    case 'Delete a department':
      await deleteDepartment();
      break;
    case 'Delete a role':
      await deleteRole();
      break;
    case 'Delete an employee':
      await deleteEmployee();
      break;
    case 'View department budget':
      await viewDepartmentBudget();
      break;
    case 'Exit':
      await client.end();
      console.log('Goodbye!');
      process.exit(0);
  }
  await mainMenu();
}

async function viewDepartments(): Promise<void> {
  const res = await client.query('SELECT id, name FROM department ORDER BY id');
  console.table(res.rows);
}

async function viewRoles(): Promise<void> {
  const res = await client.query(`
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    JOIN department ON role.department_id = department.id
    ORDER BY role.id
  `);
  console.table(res.rows);
}

async function viewEmployees(): Promise<void> {
  const res = await client.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary,
      CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role ON e.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id
    ORDER BY e.id
  `);
  console.table(res.rows);
}

async function addDepartment(): Promise<void> {
  const { name }: { name: string } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Department name:' },
  ]);
  await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log('Department added.');
}

async function addRole(): Promise<void> {
  const depts = await client.query('SELECT id, name FROM department');
  const { title, salary, department_id }: { title: string; salary: string; department_id: number } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Role title:' },
    { type: 'input', name: 'salary', message: 'Role salary:' },
    {
      type: 'list',
      name: 'department_id',
      message: 'Department:',
      choices: depts.rows.map((d: { id: number; name: string }) => ({ name: d.name, value: d.id })),
    },
  ]);
  await client.query(
    'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
    [title, salary, department_id]
  );
  console.log('Role added.');
}

async function addEmployee(): Promise<void> {
  const roles = await client.query('SELECT id, title FROM role');
  const emps = await client.query('SELECT id, first_name, last_name FROM employee');
  const { first_name, last_name, role_id, manager_id }: { first_name: string; last_name: string; role_id: number; manager_id: number | null } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: "Employee's first name:" },
    { type: 'input', name: 'last_name', message: "Employee's last name:" },
    {
      type: 'list',
      name: 'role_id',
      message: "Employee's role:",
      choices: roles.rows.map((r: { id: number; title: string }) => ({ name: r.title, value: r.id })),
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Employee's manager:",
      choices: [
        { name: 'None', value: null },
        ...emps.rows.map((e: { id: number; first_name: string; last_name: string }) => ({
          name: `${e.first_name} ${e.last_name}`,
          value: e.id,
        })),
      ],
    },
  ]);
  await client.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id]
  );
  console.log('Employee added.');
}

async function updateEmployeeRole(): Promise<void> {
  const emps = await client.query('SELECT id, first_name, last_name FROM employee');
  const roles = await client.query('SELECT id, title FROM role');
  const { employee_id, role_id }: { employee_id: number; role_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select employee to update:',
      choices: emps.rows.map((e: { id: number; first_name: string; last_name: string }) => ({
        name: `${e.first_name} ${e.last_name}`,
        value: e.id,
      })),
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select new role:',
      choices: roles.rows.map((r: { id: number; title: string }) => ({ name: r.title, value: r.id })),
    },
  ]);
  await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
  console.log('Employee role updated.');
}

// Update employee manager
async function updateEmployeeManager(): Promise<void> {
  const emps = await client.query('SELECT id, first_name, last_name FROM employee');
  const { employee_id, manager_id }: { employee_id: number; manager_id: number | null } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select employee to update manager:',
      choices: emps.rows.map((e: { id: number; first_name: string; last_name: string }) => ({
        name: `${e.first_name} ${e.last_name}`,
        value: e.id,
      })),
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select new manager:',
      choices: [
        { name: 'None', value: null },
        ...emps.rows.map((e: { id: number; first_name: string; last_name: string }) => ({
          name: `${e.first_name} ${e.last_name}`,
          value: e.id,
        })),
      ],
    },
  ]);
  if (employee_id === manager_id) {
    console.log("An employee cannot be their own manager.");
    return;
  }
  await client.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [manager_id, employee_id]);
  console.log('Employee manager updated.');
}

// View employees by manager
async function viewEmployeesByManager(): Promise<void> {
  const managers = await client.query(`
    SELECT DISTINCT m.id, m.first_name, m.last_name
    FROM employee e
    JOIN employee m ON e.manager_id = m.id
    ORDER BY m.first_name, m.last_name
  `);
  const { manager_id }: { manager_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select a manager:',
      choices: managers.rows.map((m: { id: number; first_name: string; last_name: string }) => ({
        name: `${m.first_name} ${m.last_name}`,
        value: m.id,
      })),
    },
  ]);
  const res = await client.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department
    FROM employee e
    JOIN role ON e.role_id = role.id
    JOIN department ON role.department_id = department.id
    WHERE e.manager_id = $1
    ORDER BY e.id
  `, [manager_id]);
  console.table(res.rows);
}

// View employees by department
async function viewEmployeesByDepartment(): Promise<void> {
  const depts = await client.query('SELECT id, name FROM department');
  const { department_id }: { department_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select a department:',
      choices: depts.rows.map((d: { id: number; name: string }) => ({ name: d.name, value: d.id })),
    },
  ]);
  const res = await client.query(`
    SELECT e.id, e.first_name, e.last_name, role.title
    FROM employee e
    JOIN role ON e.role_id = role.id
    WHERE role.department_id = $1
    ORDER BY e.id
  `, [department_id]);
  console.table(res.rows);
}

// Delete a department
async function deleteDepartment(): Promise<void> {
  const depts = await client.query('SELECT id, name FROM department');
  const { department_id }: { department_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select a department to delete:',
      choices: depts.rows.map((d: { id: number; name: string }) => ({ name: d.name, value: d.id })),
    },
  ]);
  await client.query('DELETE FROM department WHERE id = $1', [department_id]);
  console.log('Department deleted.');
}

// Delete a role
async function deleteRole(): Promise<void> {
  const roles = await client.query('SELECT id, title FROM role');
  const { role_id }: { role_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'role_id',
      message: 'Select a role to delete:',
      choices: roles.rows.map((r: { id: number; title: string }) => ({ name: r.title, value: r.id })),
    },
  ]);
  await client.query('DELETE FROM role WHERE id = $1', [role_id]);
  console.log('Role deleted.');
}

// Delete an employee
async function deleteEmployee(): Promise<void> {
  const emps = await client.query('SELECT id, first_name, last_name FROM employee');
  const { employee_id }: { employee_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select an employee to delete:',
      choices: emps.rows.map((e: { id: number; first_name: string; last_name: string }) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id })),
    },
  ]);
  await client.query('DELETE FROM employee WHERE id = $1', [employee_id]);
  console.log('Employee deleted.');
}

// View department utilized budget
async function viewDepartmentBudget(): Promise<void> {
  const depts = await client.query('SELECT id, name FROM department');
  const { department_id }: { department_id: number } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select a department:',
      choices: depts.rows.map((d: { id: number; name: string }) => ({ name: d.name, value: d.id })),
    },
  ]);
  const res = await client.query(`
    SELECT department.name AS department, SUM(role.salary) AS total_budget
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    WHERE department.id = $1
    GROUP BY department.name
  `, [department_id]);
  if (res.rows.length === 0) {
    console.log('No employees in this department.');
  } else {
    console.table(res.rows);
  }
}

async function start(): Promise<void> {
  try {
    await client.connect();
    await mainMenu();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

start();
