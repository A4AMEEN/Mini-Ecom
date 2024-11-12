const nodemailer =require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const User = require('../models/users'); // Import the User model
const { error } = require('console');

// Setup Nodemailer transport

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
  }
})


exports.getSignup = (req,res)=>{
  console.log("he has ",req.session.user)
  if(!req.session.user){
    
    
    
    res.render('user/signup',{error:''})
  }
  res.redirect('/home');
}


// Controller for handling user signup
exports.signup = async (req, res) => {
  const { name, email, password ,confirmPassword} = req.body;

if (!name || !email || !password || !confirmPassword) {
  return res.render('user/signup', { error: 'All fields are required',name, email});
}
if(confirmPassword!==password){
  return res.render('user/signup', { error: 'password do not match',name, email});
}

  try {
    // Hash the password
    
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create a new user instance
    const newUser = new User({ name, email, password: hashedPassword });

    // Save the user to the database

    req.session.user = newUser
    
    // res.redirect('/signup-otp'); // Redirect to login page after signup
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).send('Error signing up');
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit numeric OTP
    const otpExpiry = Date.now() + (5 * 60 * 1000);
  
    req.session.otp = otp;
    req.session.otpExpiry = otpExpiry;
    req.session.email = email;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for signup',
      text: `Your OTP for signup is: ${otp}`
    };
  
    console.log(otp);
    await transporter.sendMail(mailOptions);
    console.log(mailOptions);
  
    res.redirect('/signup-otp');
  } catch (error) {
    console.error('Error during signup:', error);
    res.render('signup', { error: 'Error signing up. Please try again later.', name, email });
  }
}


exports.verifyOtp =(req,res)=>{
  console.log("verify page")
  const { otp1, otp2, otp3, otp4 } = req.body
  const otp = otp1 + otp2 + otp3 + otp4

  if(Date.now()>req.session.otpExpiry){
    return res.status(400).send('OTP has expired')
  }
  console.log("tops",otp,"logs",req.session.otp)

  if(otp==req.session.otp){
    console.log("true")
    const newUser= req.session.user
    const user = new User(newUser)
    user.save()
    res.redirect('/login')

  }else{
    res.render('signup-otp',{error:'Incorrect/Invalid OTP'})
  }
}





exports.getLoginPage = (req, res) => {
  if (req.session.user) {
    res.redirect('/home');
  } else {
    res.render('user/login', { error: '' });
  }
};

// In your controller file

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).render('error', { message: 'Error logging out. Please try again later.' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('user/login', { error: 'User not found' });
    }

    if (user.status === 'blocked') {
      return res.render('user/login', { error: 'Your account is blocked. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('user/login', { error: 'Incorrect password' });
    }

    req.session.user = user;
    res.redirect('/home');
  } catch (error) {
    console.error('Error logging in:', error);
    res.render('user/login', { error: 'Server error. Please try again later.' });
  }
};

              