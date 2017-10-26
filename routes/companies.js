const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.post('/', requireAuth, Controllers.Companies.create);
  routes.put('/:companyId', requireAuth, Preload, Permissions.updateCompany, Controllers.Companies.update);
  routes.get('/:companyId', requireAuth, Preload, Controllers.Companies.get);
  routes.delete('/:companyId', requireAuth, Preload, Permissions.updateCompany, Controllers.Companies.remove);
  routes.post('/:companyId/addUser', requireAuth, Preload, Permissions.updateCompany, Controllers.Companies.addUser);
  routes.post('/:companyId/removeUser', requireAuth, Preload, Permissions.updateCompany, Controllers.Companies.removeUser);
  return routes;
}
