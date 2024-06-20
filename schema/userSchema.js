import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserGroup from './usergroupsSchema.js';

const SECRECT_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET; 

const userSchema = new mongoose.Schema({
  uname: {
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
  userGroup:{
    type:String,
    required:true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ],
  accessToken:[
  {
    token:{
      type:String,
      required:true,
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


const Users = mongoose.model("Users", userSchema);

export default Users;
