const mongoose = require("mongoose");
const Joi = require("joi");

const toySchema = new mongoose.Schema({
  name:String,
  info:String,
  category:String,
  img_url:String,
  price:Number,
  date_created:{
    type:Date,default:Date.now()
  },
  userId:String

});

exports.ToysModel = mongoose.model("toys",toySchema);

exports.toyValid = (_bodyData) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(50).required(),
    info:Joi.string().min(2).max(500).required(),
    category:Joi.string().min(2).max(50).required(),
    img_url:Joi.string().min(5).max(10000000).required(),
    price:Joi.number().min(0).max(1000000).required(),
    
  })

  return joiSchema.validate(_bodyData);
}

