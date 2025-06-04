-- Active: 1742859656043@@127.0.0.1@5432@employee_db
-- Seeds for Employee Tracker

-- Optionally clear tables before seeding to avoid duplicate data and foreign key errors
TRUNCATE TABLE employee RESTART IDENTITY CASCADE;
TRUNCATE TABLE role RESTART IDENTITY CASCADE;
TRUNCATE TABLE department RESTART IDENTITY CASCADE;

INSERT INTO department (name) VALUES
('Engineering'),
('Finance'),
('Legal'),
('Sales');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 90000, 1),
('Accountant', 70000, 2),
('Lawyer', 120000, 3),
('Salesperson', 60000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Alice', 'Johnson', 3, NULL),
('Bob', 'Brown', 4, 1);
