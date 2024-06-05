const User = require("../schema/userSchema");
const UserGroup = require("../schema/usergroupsSchema");
const Role = require("../schema/roleSchema")



//create admin user

exports.createCustomUser = async (req, res) => {
  const { uname, email, phonenumber, password,userGroup } = req.body;

  if (!uname || !email || !password || !phonenumber) {
    return res.status(400).json({ error: "Please enter all the inputs" });
  }
  try {
    const usergrp = await UserGroup.findOne({name:userGroup});
    if(!usergrp){
      return res.status(400).json({error:"This user group is not existing"});
    }
    const preuser = await User.findOne({ email: email });
    if (preuser) {
      return res.status(400).json({ error: "This user already exists in our organization" });
    } else {
      const userregister = new User({ uname, email, phonenumber, password,userGroup:userGroup });
      const storedata = await userregister.save();
      res.status(200).json(storedata);
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid details", error });
  }
};

exports.deleteUser = async(req,res)=>{
  const {email} = req.body;
  try{
    const user = await User.findOneAndDelete({email:email});
    return res.status(400).json(user);
  }
  catch(error){
    return res.status(400).json({error:"unable to find the user"});
  }
}

exports.updateUserGroup = async(req,res)=>{
  const {email,usergrp} = req.body;
  try{ 
    const userp = UserGroup.findOne({name:usergrp});
    if(!userp){
      return res.status(400).json({error:"invalid usergrp"});
    }
    updates={}
    updates.userGroup = userp;
    const user=User.findOneAndUpdate({email:email},updates,{new: true});
    if(!user){
      return res.status(400).json({error:"invalid user"});
    }
    return res.status(200).json(user);
  }
  catch{
    return res.status(400).json({error:"invalid data"});
  }
}




// Create Role
exports.createRole = async (req, res) => {    
  const { name, permissions } = req.body;
  try {
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ error: "This role already exists in our database" });
    }
    const newRole = new Role({ name, permissions });
    const savedRole = await newRole.save();
    return res.status(201).json(savedRole);
  } catch (error) {
    return res.status(500).json({ error: 'Error creating role', details: error.message });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(400).json({ error: 'Role not found' });
    }
    if(name){role.name=name;}
    // role.name = name || role.name;
    if(permissions){role.permissions = permissions;}
    role.permissions = permissions || role.permissions;

    const updatedRole = await role.save();
    return res.status(200).json(updatedRole);
  } catch (error) {
    return res.status(500).json({ error: 'Error updating role', details: error.message });
  }
};

// Create User Group
exports.createUserGroups = async (req, res) => {
  const { name, roles, description } = req.body;

  try {
    const existingUserGroup = await UserGroup.findOne({ name });
    if (existingUserGroup) {
      return res.status(400).json({ error: "This user group already exists in our database" });
    }

    const roleIds = roles.map(roleId => roleId);
    const validRolesCount = await Role.countDocuments({ roleId: { $in: roleIds } });

    if (validRolesCount !== roleIds.length) {
      return res.status(400).json({ error: 'Invalid or non-existent role(s) referenced in user group.' });
    }

    const newUserGroup = new UserGroup({ name, roles, description });
    const savedUserGroup = await newUserGroup.save();
    return res.status(201).json(savedUserGroup);
  } catch (error) {
    return res.status(500).json({ error: 'Error creating user group', details: error.message });
  }
};

// Update User Group
exports.updateusergrp = async (req, res) => {
  const { id } = req.params;
  const { name, roles, description } = req.body;

  try {
    const userGroup = await UserGroup.findById(id);
    if (!userGroup) {
      return res.status(400).json({ error: 'User group not found' });
    }

    const roleIds = roles.map(roleId => roleId);
    const validRolesCount = await Role.countDocuments({ roleId: { $in: roleIds } });

    if (validRolesCount !== roleIds.length) {
      return res.status(400).json({ error: 'Invalid or non-existent role(s) referenced in user group.' });
    }

    userGroup.name = name || userGroup.name;
    userGroup.roles = roles || userGroup.roles;
    userGroup.description = description || userGroup.description;

    const updatedUserGroup = await userGroup.save();
    return res.status(200).json(updatedUserGroup);
  } catch (error) {
    return res.status(500).json({ error: 'Error updating user group', details: error.message });
  }
};

