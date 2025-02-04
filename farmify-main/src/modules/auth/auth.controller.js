//service
import User from "../user/user.model.js";
import crypto from "crypto";
import { sendOtpEmail } from "../../utils/email.js";
// Sign-Up Controller
export const signUp = async (req, res) => {
  const { firstName, lastName, phone, email, password, confirmPassword,country} = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and confirm password do not match.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Generate a random OTP
    const otp = crypto.randomInt(100000, 999999);

    // Create a new user with the OTP
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password,
      country,
      otp, // Save the OTP in the database
      otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      isVerified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'Sign-up successful. Check your email for the OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

// Verify OTP Controller
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body; // Get email and OTP from the request body

  try {
    const user = await User.findOne({ email }); // Find the user by email
    if (!user) {
      return res.status(404).json({ error: 'User not found.' }); // User does not exist
    }

    // Check if the OTP matches and is still valid
    if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // If OTP is valid, verify the user
    user.isVerified = true;
    user.otp = null; // Clear the OTP
    user.otpExpiresAt = null; // Clear the OTP expiry
    await user.save(); // Save the changes

    res.status(200).json({ message: 'Account verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' }); // Handle server errors
  }
};




// export const signUp = async(req,res,next)=>{
//     try {
//         const {firstName,lastName,phone,email,password,confirmPassword,country}=req.body;
//         if (password !== confirmPassword)
//             return res.status(400).json({ message: 'Passwords do not match' });

//           // Check if the user exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    
//           // Hash password
//         const hashedPassword = await bcrypt.hash(password, 8);
    
//           // Generate OTP
//           const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//           // Create new user
//         const user = new User({
//             firstName,
//             lastName,
//             phone,
//             email,
//             country,
//             password: hashedPassword,
//             otp,
//             otpExpires: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
//         });
    
//         await user.save();
    
//           // Send OTP email
//         await sendMail(email, 'Verify Your Account', `Your OTP is ${otp}. It expires in 10 minutes.`);
    
//         res.status(201).json({ message: 'Sign-up successful. Check your email for the OTP.' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error signing up', error });
// }
// };

// // Verify OTP Controller
// export const verifyOtp = async (req, res,next) => {
// try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     if (user.otp !== otp || user.otpExpires < new Date())
//     return res.status(400).json({ message: 'Invalid or expired OTP' });

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: 'Account verified successfully' });
//     } catch (error) {
//     res.status(500).json({ message: 'Error verifying OTP', error: error.message });
// }
        
//     };

