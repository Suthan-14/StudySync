const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authMiddleware = (req,res,next)=>{


    try {

         const auth = req.headers.authorization;

    if(!auth){
       return res.status(401).json({message:'token not found'});
    }

    const token = auth.split(" ")[1];

    const decode = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decode;

    next();
        
    } catch (error) {
         res.status(401).json({
            message: "Invalid or expired token"
        });
    }
   
}

