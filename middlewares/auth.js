const jwt=require("jsonwebtoken");
const {config} =require("../config/secret");

exports.auth=async(req,res,next)=>{
let token=req.header("x-api-key");
if(!token){
    return res.status(401).json({msg:"you need to send token"});
}
try{
    let decodetoken=jwt.verify(token,config.tokenSecret);
    req.tokenData=decodetoken;
    next();
}
catch(err){
    return res.status(401).json({msg:"token not valid or expired"})
}
}
exports.authAdmin=(req,res,next)=>{
      let token=req.header("x-api-key");
    
        if(!token){
        return res.status(401).json({msg:"you must send token"})
      }
      try{
       let decodeToken=jwt.verify(token,config.tokenSecret)
       if(decodeToken.role!="admin"){
        return res.status(401).json({msg:"token Invalid or expired, code: 3 "})
       }
       req.tokenData=decodeToken;
       next();
      }
      catch(err){
        console.log(err);
        return res.status(401).json({msg:"token invalid or expired"})
      }
    }
    
    