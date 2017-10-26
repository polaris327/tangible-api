const Mongoose = require('mongoose');
const Schema = require('./schemas/products');

// ***** Static Methods *****
Schema.statics.create = async function(params, creator) {
  let product = new Products(params);
  product.creatorId = creator && creator._id;
  if (creator && creator.sellerOptions && creator.sellerOptions.companyId)
    product.companyId = creator.sellerOptions.companyId;
  return await product.save();
}

const Products = Mongoose.model('Products', Schema);
module.exports = Products;
