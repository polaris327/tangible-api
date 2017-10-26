const swaggerJSDoc = require('swagger-jsdoc');

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Tangible API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(swaggerOptions);
