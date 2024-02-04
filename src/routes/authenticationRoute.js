import { constants } from 'http2'
import express from 'express'
import { User, UnverifiedUser } from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_ACCESS_TOKEN_SECRET, JWT_EMAIL_VERIFICATION_SECRET } from '../constants/env_constants.js';
import { sendVerificationEmail } from '../mailer/authenticationHandler.js';

const router = express.Router()

async function sendEmail(user){
    const token = jwt.sign(
    {
        id: user.id,
        token: user.token
    },
    JWT_EMAIL_VERIFICATION_SECRET,
    { expiresIn: "10m" },
    );

    await sendVerificationEmail(user.email, "Verify Email | Bite-Box", token);
}

function getToken(){
    return crypto.randomBytes(32).toString('hex')
}

function generateAccessToken(user) {
    const access_token = jwt.sign(
      {
        email: user.email,
        name: user.name
      },
      JWT_ACCESS_TOKEN_SECRET
    );

    return access_token;
}

router.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    //Validate Each field


    //Check if user is already present in user DB
    const user = await User.findOne( {
        email: email 
    });
  
    if(user)
      return res
        .status(constants.HTTP_STATUS_CONFLICT)
        .send({ message: "User already exists, Please Login!" });
  
    //Check if user is already present in unverified_user DB
    const unverified_user = await UnverifiedUser.findOne( {
        email: email 
    });
  
    
    if (unverified_user) {  
      await sendEmail(unverified_user)

      return res.status(constants.HTTP_STATUS_CONFLICT).send({
        message:
          "User is already registered, Check you email for Verification email!",
      });
    }
  
    //Check for Username, email, Password Validations
  
    //hash password
    const password_hash = await bcrypt.hash(password, 10);

  
    //save data into unverified_user database
    const result = await UnverifiedUser.create({
        name: name,
        email: email,
        password: password_hash,
        token: getToken()
    });
  
    //encrypt id and put it into JWT token
    await sendEmail(result);

    return res
      .status(constants.HTTP_STATUS_OK)
      .send({ password: password, result: result });
  });

  router.get("/verify/:token", async (req, res) => {
    try {
      const decoded = jwt.verify(
        req.params.token,
        JWT_EMAIL_VERIFICATION_SECRET,
      );
    
      const user = await UnverifiedUser.findById(decoded.id);

      // Check if User exists with give ID
      if (!user) return res.status(404).send("User not found with given id.");

      // Match tokens
      if(decoded.token != user.token) res.status(404).send("Verification link is incorrect or expired!");

      const result = await User.create({
          name: user.name,
          email: user.email,
          password: user.password,
      });
  
      await UnverifiedUser.findByIdAndDelete(decoded.id);
  
      return res.send({
        message: `Dear ${result.name}, your email verified sucessfully`,
      });
    } catch (error) {
      return res.status(400).send({ message: `An error occured: ${error}` });
    }
  });

  router.post("/login", async (req, res) => {
    const user_email = req.body.email;
    const user_password = req.body.password;
  
    //Check if credential exists and not empty
    if(!user_email || !user_password) res
    .status(constants.HTTP_STATUS_BAD_REQUEST)
    .send({ message: "Username or Password can't be empty." });

    const user = await User.findOne( {
        email: user_email 
    });
  
    if (!user) return res.status(constants.HTTP_STATUS_UNAUTHORIZED).send({message: "Email does not exist. Please register."});
  
    const correct_password = user.password;
  
    // Load hash from your password DB.
    const result = await bcrypt.compare(user_password, correct_password);
    if (!result) return res.status(constants.HTTP_STATUS_UNAUTHORIZED).send({message: "Incorrect Password."});
  
    //Create JWT token
    const access_token = generateAccessToken(user);
  
    return res
      .status(constants.HTTP_STATUS_OK)
      .send({ access_token: access_token });
  });

export default router;
