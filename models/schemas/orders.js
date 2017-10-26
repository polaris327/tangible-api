const Mongoose = require('mongoose')
const Schema = Mongoose.Schema;

module.exports = new Mongoose.Schema({
  products: [Schema.Types.Mixed],
  shipping: {
    type: Number,
    required: false,
  },
  promo: {
    type: Schema.Types.Mixed,
    required: false,
  },
  total: {
    type: Number,
    default: 0,
    required: false,
  },
  customerId: {
    type: String,
    required: false,
    ref: 'Customers'
  },
  userId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'draft',
    enum: ['draft', 'sent', 'viewed', 'paid', 'complete'],
    required: false,
  },
  payment: {
    type: Schema.Types.Mixed,
  },
  address: {
    type: Schema.Types.Mixed,
  },
	companyId: {
    type: String,
    required: false,
    ref: 'Companies'
  },
	creatorId: {
		type: String,
		denyUpdate: true,
		required: false,
    ref: 'Users'
	},
  demo: {
    type: Boolean,
    required: false
  }
},
  {
    timestamps: true
  }
)
