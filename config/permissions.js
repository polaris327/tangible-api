module.exports = {
  updateUser: function (req, res, next) {
    if (req._user._id == req.params.userId)
      next();
    else
      res.sendStatus(403)
  },
  updateCustomer: function (req, res, next) {
    if (req.user._id == req.customer.creatorId || req.user.sellerOptions && req.user.sellerOptions.companyId == req.customer.companyId)
      next();
    else
      res.sendStatus(403)
  },
  updateProduct: function (req, res, next) {
    if (req.user._id == req.product.creatorId || req.user.sellerOptions && req.user.sellerOptions.companyId == req.product.companyId)
      next();
    else
      res.sendStatus(403)
  },
  updateOrder: function (req, res, next) {
    if (req.user._id == req.order.creatorId || req.user.sellerOptions && req.user.sellerOptions.companyId == req.order.companyId)
      next();
    else
      res.sendStatus(403)
  },
  updateCompany: function (req, res, next) {
    console.log(req.user.sellerOptions && req.user.sellerOptions.companyId);
    if (req.user.sellerOptions && req.user.sellerOptions.companyId == req.params.companyId)
      next();
    else
      res.sendStatus(403)
  },
  isSeller: function (req, res, next) {
    if (req.user && req.user.sellerOptions)
      next();
    else
      res.sendStatus(403)
  }
}
