//Import express and create routers
const express = require('express');

const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const menusRouter = require('./menus.js');
const menuItemsRouter = require('./menu-items.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);
apiRouter.use('/menus/:menuId/menu-items', menuItemsRouter);

//Export apiRouter
module.exports = apiRouter;