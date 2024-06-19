import express from "express";
import * as admin from '../controllers/adminController.js';
import verifyAdminCredentials from "../middlewares/verifyAdmin.js";
import checkRoleAccess from "../middlewares/checkroleaccess.js";
const router = express.Router();

// admin create custome user
router.post("/admin/user/create",admin.createCustomUser);

// admin delete any user
router.post("/admin/user/delete",verifyAdminCredentials,checkRoleAccess,admin.deleteUser);

// admin create role
router.post("/admin/role/create",verifyAdminCredentials,checkRoleAccess,admin.createRole);

// admin create usergrp
router.post("/admin/usergroup/create",verifyAdminCredentials,checkRoleAccess,admin.createUserGroups);

// admin edit usergrp
router.post("/admin/usergroup/edit",verifyAdminCredentials,checkRoleAccess,admin.updateUserGroup);

// admin edit role
router.post("/admin/role/edit",verifyAdminCredentials,checkRoleAccess,admin.updateRole);


export default router;