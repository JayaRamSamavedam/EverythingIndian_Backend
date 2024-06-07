const Role = require("../schema/roleSchema")
const verifyroleacess = async (req, res, next) => {
    try{
        const user = req.user;
        const usergrps = req.usergrps;
        console.log(req.originalUrl);
        const ab = req.originalUrl.split("/");
        let abc;
        usergrps.roles.forEach(async (role) => {
            const r = await Role.findOne({roleId:role});
            console.log(r);
        });
        console.log(req.route);
        console.log(ab);
        
        next();
    }
    catch(e){
        console.error("Error verifying token:", error);
        return res.status(401).send({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = verifyroleacess;