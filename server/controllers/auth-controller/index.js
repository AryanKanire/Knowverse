const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
  const { userName, userEmail, password, role } = req.body;

  // console.log("Request Body:", req.body);

  // Ensure all fields are provided
  if (!userName || !userEmail || !password) {
    return res.status(400).json({
      success: false, // Fix typo here
      message: "All fields are required!",
    });
  }

  // Case-insensitive user existence check using $regex
  const exitingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  // console.log("Exiting User:", exitingUser);  // Debugging log to see if the user exists

  if (exitingUser) {
    return res.status(400).json({
      success: false, // Fix typo here
      message: "User name or user email is already present",
    });
  }

  // Hash the password before saving it
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // Create and save the new user
  const newUser = new User({
    userName,
    userEmail,
    password: hashPassword,
    role,
  });

  await newUser.save();

  return res.status(200).json({
    success: true,
    message: "User registered successfully!",
  });
};

module.exports.loginUser = async (req, res) => {
    const { userEmail, password } = req.body;
  
    try {
      // Check if the user exists
      const checkUser = await User.findOne({ userEmail });
  
      if (!checkUser) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials", // User not found
        });
      }
  
      // Compare the provided password with the hashed password
      const compare = await bcrypt.compare(password, checkUser.password);
  
      if (!compare) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials", // Password mismatch
        });
      }
  
      // Generate the JWT
      const accessToken = jwt.sign(
        {
          _id: checkUser._id,
          userName: checkUser.userName,
          userEmail: checkUser.userEmail,
          role: checkUser.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15d",
        }
      );
  
      // Send the response
      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          accessToken,
          user: {
            _id: checkUser._id,
            userName: checkUser.userName,
            userEmail: checkUser.userEmail,
            role: checkUser.role,
          },
        },
      });
    } catch (error) {
      console.error("Error during login:", error.message);
      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  