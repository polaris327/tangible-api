const { Emails } = require('../helpers');
const Errors = require('../config/errors');

exports.sendHello = async function(req, res, next) {
  if (!(req.body.name && req.body.email && req.message))
    return res.status(422).send({ error: 'You must include name, email, and a message' });
  let result = await Emails.sendHello('karl@iconicwine.com', req.body).catch((err) => Errors.handle(err));
  if (result)
    return res.status(200).send();
  else
    return res.status(400).send({ error: 'Error sending email' });
}
