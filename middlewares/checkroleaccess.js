import UserGroup from "../schema/usergroupsSchema.js";
// const UserGroup = require("../schema/usergroupsSchema");
import Role from "../schema/roleSchema.js";
// const Role = require("../schema/roleSchema");

const checkRoleAccess = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch user group
    // console.log("abcd1")
    const userGroup = await UserGroup.findOne({ name: user.userGroup });
    if (!userGroup) {
      return res.status(404).send({ error: "User group not found" });
    }
    // console.log("abcd2")
    // Fetch all roles concurrently
    const roles = await Promise.all(userGroup.roles.map(roleId => Role.findOne({ roleId: roleId })));
    const permissions = roles.reduce((acc, role) => {
      if (role) {
        Object.keys(role.permissions).forEach(resource => {
          if (!acc[resource]) {
            acc[resource] = new Set();
          }
          role.permissions[resource].forEach(permission => acc[resource].add(permission));
        });
      }
      return acc;
    }, {});

    // Check if the user has the required permissions
    const resource = req.originalUrl.split('/')[1]; // Assuming the resource is in the URL path
    // console.log("abcd1")
    const method = req.method;
    if (permissions[resource] && permissions[resource].has(method)) {
      req.permissions = Array.from(permissions[resource]); // Convert Set to Array if needed
      next(); 
    } else {
      return res.status(403).send({ error: "Forbidden: User does not have required permissions" });
    }
  } catch (error) {
    console.error("Error checking role access:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export default checkRoleAccess;
