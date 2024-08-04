import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Logic to register user
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    //Check if all the fields are filled
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Fill all the necessary fields!",
        success: false,
      });
    }

    //Check if the user exist wit the same email
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "User with the email already exists!",
        success: false,
      });
    }

    //Hash the password that user enter
    const hashPassword = await bcrypt.hash(password, 10);

    //Then we create user after checking everything
    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashPassword,
      role,
    });

    return res
      .status(201)
      .json({ message: "Account created successfully!", success: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error while registration ", error });
  }
};

//Logic to login user
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Something is missing", success: false });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password", success: false });
    }

    //check to see if the password matches with the one in database
    const isPaswwordMatch = await bcrypt.compare(password, user.password);
    if (!isPaswwordMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password", success: false });
    }

    //role checking
    if (role !== user.role) {
      return res
        .status(400)
        .json({ message: "Role doesn't match", success: false });
    }

    //token generation
    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        success: true,
      });
  } catch (error) {
    return res.status(400).json({ message: "Error logging in", error });
  }
};

//logic to logout
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.log(error);
  }
};

//Logic to update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;

    //cloudinary

    //Spliting the skills array with comma
    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id;
    let user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "User doesn't exist!", success: false });
    }

    //Updating profile data of the user
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    //resumecomes later here

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .json({ message: "Profile updated successfully!", user, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error while updating profile", success: false });
  }
};
