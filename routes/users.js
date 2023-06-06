const express= require("express");
const bcrypt = require("bcrypt");
const {UserModel,userValid,loginValid,createToken} = require("../models/userModel");
const { auth,authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/" , async(req,res)=> {
  res.json({msg:"users work"})
})

router.get("/usersList",authAdmin,async(req,res)=>{
  try{
  let user=await UserModel.find({},{password:0})
  res.json(user);
  }
  catch(err){     
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
  })

router.get("/myInfo",async(req,res)=>{
  let token=req.header("x-api-key");
  if(!token)
  return res.status(401).json({msg:"you need to send token"})
  try{
    let tokenData=jwt.verify(token,"MONKEYSECRET")
    let user=await UserModel.findOne({_id:tokenData._id},{password:0})
    res.json(user)
  }
  catch(err){
    return res.status(401).json({msg:"token not valid or expired"})
  }
})

router.post("/",async(req,res) => {
  let valdiateBody = userValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    let user = new UserModel(req.body);
    // הצפנה חד כיוונית לסיסמא ככה 
    // שלא תשמר על המסד כמו שהיא ויהיה ניתן בקלות
    // לגנוב אותה
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    // כדי להציג לצד לקוח סיסמא אנונימית
    // user.password = "******";
    res.status(201).json(user)
  }
  catch(err){
    // בודק אם השגיאה זה אימייל שקיים כבר במערכת
    // דורש בקומפס להוסיף אינדקס יוניקי
    if(err.code == 11000){
      return res.status(400).json({msg:"Email already in system try login",code:11000})
    }
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.post("/login", async(req,res) => {
  let valdiateBody = loginValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    let user = await UserModel.findOne({email:req.body.email})
    if(!user){
      return res.status(401).json({msg:"User and password not match 1"})
    }
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
      return res.status(401).json({msg:"User and password not match 2"})
    }
   let newToken=createToken(user._id,user.role);
   res.json({token:newToken})
  }
  catch(err){
    
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.put("/:idEdit", auth, async (req, res) => {
  let validateBody = userValid(req.body);
  if (validateBody.error) {
      return res.status(400).json(validateBody.error.details);
  }
  try {
      let idEdit = req.params.idEdit;
      let data;
      if (req.tokenData.role == "admin") {
          data = await UserModel.updateOne({ _id: idEdit }, req.body);
      }
      else if (idEdit != req.tokenData._id) {
          return res.status(403).json({ msg: "Unauthorized access" })
      }
      else {
          data = await UserModel.updateOne({ _id: idEdit }, req.body);
      }
      let user = await UserModel.findOne({ _id: idEdit });
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      user.password = "*****";
      res.json(data);
  }
  catch (err) {
      console.log(err);
      res.status(500).json({ msg: "err", err });
  }})

  router.delete("/:idDel", auth, async (req, res) => {
    let idDelete = req.params.idDel;
    let data;
    try {
        if (req.tokenData.role == "admin") {
            data = await UserModel.deleteOne({ _id: idDelete });
        }
        else if (idDelete != req.tokenData._id) {
            return res.status(403).json({ msg: "Unauthorized access" });
        }
        else {
            data = await UserModel.deleteOne({ _id: idDelete });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})
module.exports = router;