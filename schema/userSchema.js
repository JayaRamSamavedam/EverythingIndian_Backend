import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserGroup from './usergroupsSchema.js';

const SECRECT_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not a valid email");
      }
    },
  },
  companyName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return validator.isMobilePhone(value, 'any', { strictMode: false });
      },
      message: "Not a valid mobile number"
    }
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not a valid email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phonenumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(value) {
        return validator.isMobilePhone(value, 'any', { strictMode: false });
      },
      message: "Not a valid mobile number"
    }
  },
  birthday: {
    type: Date,
    required: false,
  },
  region: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  userGroup: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: addressSchema,
    // required: true,
  },
  billingAddress: {
    type: addressSchema,
    // required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ],
  accessToken: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ]
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  const userGroup = await UserGroup.findOne({name:this.userGroup});
  if(!userGroup){
    throw new Error('Invalid or non-existent UserGroup');
  }
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
// Generate auth tokens (access and refresh tokens)
userSchema.methods.generateAuthToken = async function() {
  try {
    const accessToken = jwt.sign({ _id: this._id.toString() }, SECRECT_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ _id: this._id.toString() }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
    this.tokens = this.tokens.concat({ token: refreshToken });
    this.accessToken = this.accessToken.concat({token:accessToken});
    await this.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error);
  }
};


userSchema.methods.editUserDetails = async function(updates) {
  const allowedUpdates = ["fullName", "phonenumber", "birthday", "region", "gender"];
  const keys = Object.keys(updates);
  const isValidOperation = keys.every((key) => allowedUpdates.includes(key));

  if (!isValidOperation) {
    throw new Error("Invalid updates!");
  }

  for (let key of keys) {
    this[key] = updates[key];
  }

  await this.save();
  return this;
};

// Edit delivery address
userSchema.methods.editDeliveryAddress = async function(addressUpdates) {
  if (!this.deliveryAddress) {
    this.deliveryAddress = addressUpdates;
  } else {
    Object.assign(this.deliveryAddress, addressUpdates);
  }
  await this.save();
  return this.deliveryAddress;
};

// Edit billing address
userSchema.methods.editBillingAddress = async function(addressUpdates) {
  if (!this.billingAddress) {
    this.billingAddress = addressUpdates;
  } else {
    Object.assign(this.billingAddress, addressUpdates);
  }
  await this.save();
  return this.billingAddress;
};

// Create delivery address
userSchema.methods.createDeliveryAddress = async function(address) {
  this.deliveryAddress = address;
  await this.save();
  return this.deliveryAddress;
};

// Create billing address
userSchema.methods.createBillingAddress = async function(address) {
  this.billingAddress = address;
  await this.save();
  return this.billingAddress;
};

const Users = mongoose.model("Users", userSchema);

export default Users;
