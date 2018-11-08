//Import sqlite3
const sqlite3 = require('sqlite3');
//Create new database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Create table Employee
db.run(`CREATE TABLE IF NOT EXISTS Employee (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY(id)
    );`
);

//Create table Timesheet
db.run(`CREATE TABLE IF NOT EXISTS Timesheet (
    id INTEGER NOT NULL,
    hours INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    date INTEGER NOT NULL,
    employee_id  INTEGER NOT NULL,
    PRIMARY KEY(id)
    );`
);

//Create table Menu
db.run(`CREATE TABLE IF NOT EXISTS Menu (
    id INTEGER NOT NULL,
    title TEXT NOT NULL,
    PRIMARY KEY(id)
    );`
);


//Create table MenuItem
db.run(`CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    PRIMARY KEY(id)
    );`
);