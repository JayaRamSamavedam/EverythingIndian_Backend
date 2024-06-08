import mongoose from 'mongoose';
// const mongoose = require('mongoose');
import Role from './roleSchema.js';
// const Role = require("./roleSchema");
const userGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  roles: [{
    type: Number,
  }],
  description: {
    type: String,
  },
});

userGroupSchema.pre('save', async function (next) {
  const userGroup = this;
  const roleIds = userGroup.roles.map(role => role); // Extract all role IDs

  const validRolesCount = await Role.countDocuments({ roleId: { $in: roleIds } });

  if (validRolesCount !== roleIds.length) {
    throw new Error('Invalid or non-existent role(s) referenced in user group.');
  }
  next();
});


const UserGroup = mongoose.model('UserGroup', userGroupSchema);

export default UserGroup;
