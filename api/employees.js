//Import express and create employeesRouter
const express = require('express');
const employeesRouter = express.Router();

const timesheetsRouter = require('./timesheets.js');

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);


//Import sqlite3 and create database connection
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


employeesRouter.param('employeeId', (req, res, next, employeeId) => {

    db.get(`
        SELECT * 
        FROM Employee 
        WHERE id = $employeeId`,
        {$employeeId: employeeId},
        (error, employee) => {
            if (error) {
                next(error);
            } else if (employee) {
                req.employee = employee;
                next();
            } else {
                res.sendStatus(404);
            }
         }
    );
  });


//Get all employees
employeesRouter.get('/', (req, res, next)=>{
    db.all(`
        SELECT * 
        FROM Employee 
        WHERE is_current_employee = 1`, 
        (err, employees) => {
            if(err){
                next(err);
            }else{
                res.status(200).send({employees: employees});
            }
        }
    );
});

//Create/Post new employee
employeesRouter.post('/', (req, res, next)=>{
    
    const   name = req.body.employee.name,
            position = req.body.employee.position,
            wage = req.body.employee.wage;

    //Check for requiered fields
    if(!name || !position || !wage){
        res.sendStatus(400);
    }else{

        db.run(`
            INSERT 
            INTO Employee (name, position, wage) 
            VALUES ($name, $position, $wage)`,
            {
                $name: name,
                $position: position,
                $wage: wage
            }, 
            function (err){
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Employee 
                        WHERE id = ${this.lastID}`, 
                        (err, employee) => {
                            res.status(201).send({employee:employee});
                        }
                    )
                }
            }
        );
    }
});


//Get employee by id
employeesRouter.get('/:employeeId', (req, res, next)=>{
    db.get(`
        SELECT * 
        FROM Employee 
        WHERE id = ${req.params.employeeId}`, 
        (err, employee) => {
            if(err){
                next(err);
            }else{
                res.status(200).send({employee: employee});
            }
        }
    );
});

//Update/Put an employee
employeesRouter.put('/:employeeId', (req, res, next)=>{

    const   id = req.params.employeeId,
            name = req.body.employee.name,
            position = req.body.employee.position,
            wage = req.body.employee.wage;

    //Check for requiered fields
    if(!id || !name || !position || !wage){
        res.sendStatus(400);
    }else{
        db.run(`
            UPDATE Employee 
            SET name = $name, position = $position, wage = $wage
            WHERE id = ${id}`,
            {
                $name: name,
                $position: position,
                $wage: wage
            }, function (err){
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Employee 
                        WHERE id = ${id}`, 
                        (err, employee) => {
                            res.status(200).send({employee:employee});
                        }
                    );
                }
            }
        );
    }
});


//Delete an employee
employeesRouter.delete('/:employeeId', (req, res, next)=>{
    db.run(`
        UPDATE Employee 
        SET is_current_employee = 0
        WHERE id = ${req.params.employeeId}`, 
        function (err) {
            if(err){
                next(err);
            }else{
                db.get(`
                    SELECT * 
                    FROM Employee 
                    WHERE id = ${req.params.employeeId}`, 
                    (err, employee)=>{
                        if(err){
                            next(err);
                        }else{
                            res.status(200).send({employee: employee});
                        }
                    }
                );            
            }
        }
    );
});

//Export employeesRouter
module.exports = employeesRouter;