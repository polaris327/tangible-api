module.exports = {
  // Secret key for JWT signing and encryption
  secret: 'B4E21E766B5AF64CE3C534F2943B3',
  // Database connection information
  database: {
    production: 'mongodb://app:Scout123@candidate.7.mongolayer.com:10902,candidate.45.mongolayer.com:11555/tangible?replicaSet=set-595dc153afb61429bd0000f0',
    dev: 'mongodb://app:Scout123@candidate.7.mongolayer.com:10902,candidate.45.mongolayer.com:11555/tangible-dev?replicaSet=set-595dc153afb61429bd0000f0',
    test: 'mongodb://app:Test123@candidate.7.mongolayer.com:10902,candidate.45.mongolayer.com:11555/tangible-test?replicaSet=set-595dc153afb61429bd0000f0',
  },
  // Setting port for server
  port: process.env.PORT || 3000,

  //stripePrivateApiKey: process.env.NODE_ENV == 'production' ? 'sk_live_xZMMsA1twZ8IyftRju5PTgt5' : 'sk_test_nFYKVxrhfKLZrQXXgIG8nq22',
  stripePrivateApiKey: process.env.NODE_ENV == 'production' ? 'sk_live_XjZ4kJrmZltoKlnSZMr40eUu' : 'sk_test_jxV9NABVQHtyQbnVxC7V6z0W',
  stripePublicApiKey: process.env.NODE_ENV == 'production' ? 'pk_live_W7FGmoWgd47DqUNfAm5cCv3F' : 'pk_test_3ro724fXGuhzFEQ7EdR5jbgw',
  sparkPostApiKey: '2b71345430e668ace3642222a4b19aa988d129bf',
  bitlyKey: '9ee28157a2867b5b9f7a506e1581da9e6765d2f1',
  twilioPhoneNumber: '2403033632',
  twilioSID: 'AC2bdaf05b4b50a1b9f45b41fa9cda9bb3',
  twilioAuthToken: 'ab4fd19c2750fce70aefc3ca453f9a94',
  bugsnagApiKey: '7ce454083c31a27596733314b45013ee',
  apiBaseUrl: 'https://api.tangiblerm.com',
  mobileBaseUrl: 'https://m.tangiblerm.com',
  adminBaseUrl: 'https://app.tangiblerm.com',
  shortLinkUrl: process.env.NODE_ENV == 'production' ? 'tgbl.co' : null,
  // necessary in order to run tests in parallel of the main app
  test_port: 3001,
  test_db: 'tangible-test',
  test_env: 'test',
};
