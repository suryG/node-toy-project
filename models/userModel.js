const mongoose = require("mongoose");
const Joi = require("joi");
const {config}=require("../config/secret");
const jwt=require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  date_created:{
    type:Date,default:Date.now()
  },
  role:{
    type:String,default:"user"
}

});

exports.UserModel = mongoose.model("users",userSchema);

exports.userValid = (_bodyData) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).required(),
    email:Joi.string().min(5).max(100).required(),
    password:Joi.string().min(6).max(50).required(),
    
  })

  return joiSchema.validate(_bodyData);
}
exports.createToken=(_id,role)=>{
    let token=jwt.sign({_id,role},config.tokenSecret,{expiresIn:"60mins"});
    return token;
}
exports.loginValid = (_bodyData) => {
    let joiSchema = Joi.object({
      email:Joi.string().min(5).max(100).required(),
      password:Joi.string().min(6).max(50).required(),
      
    })
  
    return joiSchema.validate(_bodyData);
  }
