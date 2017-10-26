exports.buildOrQuery = function(params, allowedFields) {
  const fields = _.pick(params, allowedFields);
  let query = {};
  if (Object.keys(fields).length == 0) return null;
  query.$or = [];
  _.each(fields, (value, field) => {
    let term = {};
    term[field] = params[field];
    if (value)
      query.$or.push(term);
  });
  return query;
}

exports.buildMyQuery = function(user) {
  if (user.sellerOptions && user.sellerOptions.companyId)
    return {$or: [{creatorId: user._id}, {companyId: user.sellerOptions.companyId}]};
  else
    return {creatorId: user._id};
}
