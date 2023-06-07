const express= require("express");
const bcrypt = require("bcrypt");
const {ToysModel,toyValid} = require("../models/toyModel");
// const { createToken } = require("../public/js/userModel");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.get("/", async (req, res) => {
      let perPage = req.query.perPage || 8;
      let page = req.query.page || 1;
      let sort = req.query.sort || "_id";
    
      let reverse = req.query.reverse == "yes" ? -1 : 1;
      try {
        let data = await ToysModel
          .find({})
          .limit(perPage)
          .skip((page - 1) * perPage)
          .sort({[sort]:reverse})
        res.json(data);
      } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
      }
    })
    
    

router.get("/search",async(req,res) => {
    try{
      let queryS = req.query.s;

      let searchReg = new RegExp(queryS,"i")
      let data = await ToysModel.find({ $or: [{ name: { $regex: searchReg} }, { info: { $regex: searchReg } }] })
      .limit(50)
            // if(!data)
            //  data = await ToysModel.find({info:searchReg})
            //  .limit(50)
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })

  router.get("/category/:catname", async(req, res) => {
    let type = req.params.catname;
    let temp_ar = await ToysModel.find({category:type})
    res.json(temp_ar)
  })

  router.get("/single/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let data = await ToysModel.findOne({_id:id});
        res.json(data)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: "err", err});
    }
  })

  router.get("/prices", async(req, res) => {
    try{
        let minQ = req.query.min || 0;
        let maxQ= req.query.max || Infinity;
        let perPage = req.query.perPage || 10;
        let data = await ToysModel.find({price: { $gte: minQ, $lte: maxQ }}).limit(perPage)
        res.json(data);
    }
    catch(err) {
        console.log(err)
        res.status(500).json({msg: "err", err})
    } 
  })

  router.post("/",auth, async (req, res) => {
    let validBody = toyValid(req.body)
    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    } try {
        let toy = new ToysModel(req.body);
        toy.userId=req.tokenData._id;
        await toy.save();
        res.status(201).json(toy)
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.put("/:idEdit",auth,async(req,res)=>{
  let validBody=toyValid(req.body);

  if(validBody.error){
      return res.status(400).json(validBody,error.details);
  }

  try{
      let idEdit=req.params.idEdit;
      let data;
      if(req.tokenData.role=="admin"){
        data=await ToysModel.updateOne({_id:idEdit},req.body);
      }
      else{
          data=await ToysModel.updateOne({_id:idEdit,userId:req.tokenData._id},req.body);
      }
      res.json(data);
  }
  catch(err){
      console.log(err);
      res.status(500).json({ msg: "err", err })
  }
})

router.delete("/:idDel",auth,async(req,res)=>{
  try{
      let idDel=req.params.idDel;
      let data;
      if(req.tokenData.role=="admin"){
          data=await ToysModel.updateOne({_id:idDel});
        }
        else{
          data=await ToysModel.deleteOne({_id:idDel,userId:req.tokenData._id});
        }
      res.json(data);
  }
  catch(err){
      console.log(err);
      res.status(500).json({ msg: "err", err })
  }
})



module.exports = router;