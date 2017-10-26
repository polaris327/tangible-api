const config = require('./main');
const Bugsnag = require('bugsnag');

module.exports = {
  initialize: function() {
    if (process.env.NODE_ENV == 'production')
      Bugsnag.register(config.bugsnagApiKey);
  },
  handle: function(error, type) {
    console.log('Error type: ', type);
    console.log(error);
    if (Bugsnag)
      Bugsnag.notify(error);
  }
}
