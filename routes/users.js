const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
/* GET users listing. */
router.get('/home',(req,res)=>{
  res.render('user/home')
})

router.get('/signup',userController.getSignup)
router.post('/signup',userController.signup)

router.post('/verify-otp',userController.verifyOtp)

router.get('/login',userController.getLoginPage)
router.post('/login',userController.login)
router.post('/logout',userController.login)


router.get('/product-details',(req,res)=>{
  res.render('user/product-details')
})

router.get('/shop',(req,res)=>{
  res.render('user/shop')
})


router.get('/signup-otp',(req,res)=>{
  console.log("optss")
  res.render('user/signup-otp',{error:""})
})


module.exports = router;
