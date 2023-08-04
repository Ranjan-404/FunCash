const jwt = require('jsonwebtoken');
const File = require("../models/File");
 
const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.token
    if(token){
        const verifiedUser=  jwt.verify(token,process.env['SECRET_KEY'])
        const user = await File.findById(verifiedUser.id)
       req.user = user 
next() 

    }else{
        res.render('expired')
    }

};

module.exports = authenticateJWT;
