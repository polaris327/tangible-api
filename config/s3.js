module.exports = {
    bucket: "tangible-assets",
    headers: {'Access-Control-Allow-Origin': '*'}, // optional
    ACL: 'public-read',
    uniquePrefix: false,
    getFileKeyDir: function(req) {
      return req.query.folder;
    }
  }
