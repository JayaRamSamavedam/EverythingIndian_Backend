const mongoose = require('mongoose');
const RoleCounter = require('./roleCounterSchema');

const roleSchema = new mongoose.Schema({
  roleId:{
    type:Number,
    unique:true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    type: Object,
    required: true,
  },
});

roleSchema.pre('save', async function (next) {
  const product = this;
  if (!product.isNew) {
    return next();
  }

  try {
    const counter = await RoleCounter.findOneAndUpdate(
      { _id: 'roleId' }, 
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    product.roleId = counter.seq;
    next();
  } catch (error) {
    console.error("Error generating product ID:", error);
    next(error);
  }
});


const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
