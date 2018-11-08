//Import express and create menuItemsRouter
const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

//Import sqlite3 and create database connection
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {

    db.get(`
        SELECT * 
        FROM MenuItem 
        WHERE id = $menuItemId`, 
        {$menuItemId: menuItemId}, 
        (error, menuItemId) => {
            if (error) {
                next(error);
            } else if (menuItemId) {
                req.menuItemId = menuItemId;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});


//Get all menuitems
menuItemsRouter.get('/', (req, res, next)=>{
             
    db.get(`
        SELECT * 
        FROM Menu 
        WHERE id = $menuId`, 
        {$menuId: req.params.menuId}, 
        (error, menuId) => {
            if (error) {
                next(error);
            } else if (menuId) {
                db.all(`
                    SELECT * 
                    FROM MenuItem
                    WHERE menu_id = ${req.params.menuId}`, 
                    function(err, menuItems){
                        if(err){
                            next(err);
                        }else{
                            res.status(200).send({menuItems: menuItems});
                        }
                    }
                );
            } else {
                res.sendStatus(404);
            }
        }
    );
});

//Create/Post a new menuitem
menuItemsRouter.post('/', (req, res, next)=>{

    const   name = req.body.menuItem.name,
            description = req.body.menuItem.description,
            inventory = req.body.menuItem.inventory,
            price = req.body.menuItem.price
            menuId = req.params.menuId;
    
    if(!name || !description || !inventory || !price){
        res.sendStatus(400);
    }else{
        db.run(`
            INSERT 
            INTO MenuItem (name, description, inventory, price, menu_id) 
            VALUES ($name, $description, $inventory, $price, $menuId)
            `,
            {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            },
            function(err){
                if(err){
                    next(err);
                }else{
                    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem)=>{
                        if(err){
                            next(err);
                        }else{
                            res.status(201).send({menuItem: menuItem});
                        }
                    })
                }
        });
    }
});






//Update/Put menuitem by id
menuItemsRouter.put('/:menuItemId', (req, res, next)=>{
    
    const   name = req.body.menuItem.name,
            description = req.body.menuItem.description,
            inventory = req.body.menuItem.inventory,
            price = req.body.menuItem.price;
    
    if(!name || !description || !inventory || !price){
        res.sendStatus(400);
    }else{
        db.run(`
            UPDATE MenuItem 
            SET name = $name, description = $description, inventory = $inventory, price = $price 
            WHERE id = ${req.params.menuItemId}`,
            {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price
            },
            (err)=>{
                if(err){
                    next(err);
                }else{
                    db.get(`
                        SELECT * 
                        FROM MenuItem 
                        WHERE id = ${req.params.menuItemId}`, (err, menuItem)=>{
                        if(err){
                            next(err);
                        }else{
                            res.status(200).send({menuItem: menuItem});
                        }
                    })
                    
                }
            });
    }
});


//Delete a menuitem by id
menuItemsRouter.delete('/:menuItemId', (req, res, next)=>{
    db.run(`
                    DELETE
                    FROM MenuItem
                    WHERE id = ${req.params.menuItemId}
                `,
                (err)=>{
                    if(err){
                        next(err);
                    }else{
                        res.sendStatus(204);
                    }
                });
});

//Export menuItemsRouter
module.exports = menuItemsRouter;