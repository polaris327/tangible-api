const Controllers = require('../controllers');
const express = require('express');
const passport = require('passport');
const s3Config = require('../config/s3');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');
const passportService = require('../config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router();
  apiRoutes.get('/', (req, res) => {
    res.send('You have reached the Tangible API endpoint');
  });

  // Swagger API Doc Routes
  apiRoutes.get('/api-docs.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Main routes
  apiRoutes.use('/auth', require('./auth')(requireAuth, requireLogin));
  apiRoutes.use('/users', require('./users')(requireAuth, requireLogin));
  apiRoutes.use('/customers', require('./customers')(requireAuth, requireLogin));
  apiRoutes.use('/orders', require('./orders')(requireAuth, requireLogin));
  apiRoutes.use('/products', require('./products')(requireAuth, requireLogin));
  apiRoutes.use('/companies', require('./companies')(requireAuth, requireLogin));

  // My Routes
  const myRoutes = express.Router();
  apiRoutes.use('/my', myRoutes);
  myRoutes.get('/', requireAuth, Controllers.Users.getMyData);

  // Contact Routes
  const contactRoutes = express.Router();
  apiRoutes.use('/contact', contactRoutes);
  contactRoutes.post('/hello', Controllers.Contact.sendHello);

  // Image Routes
  app.use('/s3', require('react-s3-uploader/s3router')(s3Config));

  // Initialize routes
  app.use('/', apiRoutes);
};
