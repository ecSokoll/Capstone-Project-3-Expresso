//Import express and create timesheetsRouter
const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

//Import sqlite3 and create database connection
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {

    db.get(`
        SELECT * 
        FROM Timesheet 
        WHERE id = $timesheetId`, 
        {$timesheetId: timesheetId}, 
        (error, timesheet) => {
            if (error) {
                next(error);
            } else if (timesheet) {
                req.timesheet = timesheet;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});


//Get all timesheets of employeeId
timesheetsRouter.get('/', (req, res, next)=>{
    db.all(`
        SELECT * 
        FROM Timesheet 
        WHERE employee_id = ${req.params.employeeId}`, 
        function(err, timesheets){
            if(err){
                next(err);
            }else{
                res.status(200).send({timesheets: timesheets});
            }
        });
});

//Create/Post a new timesheets for an employee
timesheetsRouter.post('/', (req, res, next)=>{

    const   hours = req.body.timesheet.hours,
            rate = req.body.timesheet.rate,
            date = req.body.timesheet.date,
            employeeId = req.params.employeeId;
    
    if(!hours || !rate || !date){
        res.sendStatus(400);
    }else{
        db.run(`
            INSERT 
            INTO Timesheet (hours, rate, date, employee_id) 
            VALUES ($hours, $rate, $date, $employee_id)
            `,
            {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employee_id: employeeId
            },
            function(err){
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Timesheet 
                        WHERE id = ${this.lastID}`, 
                        (err, timesheet)=>{
                            if(err){
                                next(err);
                            }else{
                                res.status(201).send({timesheet: timesheet});
                            }
                        }
                    );
                }
        });
    }
});

//Update/Put timesheets by id
timesheetsRouter.put('/:timesheetId', (req, res, next)=>{
    
    const   hours = req.body.timesheet.hours,
            rate = req.body.timesheet.rate,
            date = req.body.timesheet.date;
    
    if(!hours || !rate || !date){
        res.sendStatus(400);
    }else{
        db.run(`
            UPDATE Timesheet 
            SET hours = $hours, rate = $rate, date = $date 
            WHERE id = ${req.params.timesheetId}`,
            {
                $hours: hours,
                $rate: rate,
                $date: date
            },
            (err)=>{
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Timesheet 
                        WHERE id = ${req.params.timesheetId}`, (err, timesheet)=>{
                        if(err){
                            next(err);
                        }else{
                            res.status(200).send({timesheet: timesheet});
                        }
                    })
                    
                }
            });
    }
});


//Delete a timesheet by id
timesheetsRouter.delete('/:timesheetId', (req, res, next)=>{
    db.run(`
        DELETE
        FROM Timesheet
        WHERE id = ${req.params.timesheetId}
    `,
    (err)=>{
        if(err){
            next(err);
        }else{
            res.sendStatus(204);
        }
    })
});

//Export timesheetsRouter
module.exports = timesheetsRouter;