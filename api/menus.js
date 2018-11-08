//Import express and create menusRouter
const express = require('express');
const menusRouter = express.Router({mergeParams: true});

//Import sqlite3 and create database connection
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menusRouter.param('menuId', (req, res, next, menuId) => {

    db.get(`
        SELECT * 
        FROM Menu 
        WHERE id = $menuId`, 
        {$menuId: menuId}, 
        (error, menu) => {
            if (error) {
                next(error);
            } else if (menu) {
                req.menu = menu;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});


//Get all menus
menusRouter.get('/', (req, res, next)=>{
    db.all(`
        SELECT * 
        FROM Menu`, 
        function(err, menus){
            if(err){
                next(err);
            }else{
                res.status(200).send({menus: menus});
            }
        });
});

//Create/Post a new menu
menusRouter.post('/', (req, res, next)=>{

    const   title = req.body.menu.title;
    
    if(!title){
        res.sendStatus(400);
    }else{
        db.run(`
            INSERT 
            INTO Menu (title) 
            VALUES ($title)
            `,
            {
                $title: title
            },
            function(err){
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Menu 
                        WHERE id = ${this.lastID}`, 
                        (err, menu)=>{
                            if(err){
                                next(err);
                            }else{
                                res.status(201).send({menu: menu});
                            }
                        }
                    );
                }
        });
    }
});


//Get menu by id
menusRouter.get('/:menuId', (req, res, next)=>{
    db.get(`
        SELECT * 
        FROM Menu
        WHERE id = ${req.params.menuId}`, 
        function(err, menu){
            if(err){
                next(err);
            }else{
                res.status(200).send({menu: menu});
            }
        });
});

//Update/Put menus by id
menusRouter.put('/:menuId', (req, res, next)=>{
    
    const   title = req.body.menu.title;
    
    if(!title){
        res.sendStatus(400);
    }else{
        db.run(`
            UPDATE Menu 
            SET title = $title 
            WHERE id = ${req.params.menuId}`,
            {
                $title: title
            },
            (err)=>{
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM Menu 
                        WHERE id = ${req.params.menuId}`, (err, menu)=>{
                        if(err){
                            next(err);
                        }else{
                            res.status(200).send({menu: menu});
                        }
                    })
                    
                }
            });
    }
});


//Delete a menu by id
menusRouter.delete('/:menuId', (req, res, next)=>{
    //Check if menu has related menuItems
    db.all(`
        SELECT * 
        FROM MenuItem 
        WHERE menu_id = $menuId`, 
        {$menuId: req.params.menuId}, 
        (err, menuIds) => {
            if (err) {
                next(error);
            } 
            //If there are no relations delete menu by menuId
            else if (menuIds.length === 0) {
                db.run(`
                    DELETE
                    FROM Menu
                    WHERE id = ${req.params.menuId}
                `,
                (err)=>{
                    if(err){
                        next(err);
                    }else{
                        res.sendStatus(204);
                    }
                });
            } 
            //If there are relations send 400
            else {
                res.sendStatus(400);
            }
        }
    );
});

//Export menusRouter
module.exports = menusRouter;