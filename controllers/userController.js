const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
//Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required details");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be atleast 6 characters");
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const user = await User.create({ name, email, password });

  // Generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, phone, whatsapp, address, city, bio } =
      user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      whatsapp,
      address,
      city,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate user
  if (!email || !password) {
    res.status(400);
    throw new Error("Email or Password is missing");
  }
  //Check if user exists in Database
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found, Please sign up");
  }

  // User exists then check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (user && passwordIsCorrect) {
    // Generate token
    const token = generateToken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, whatsapp, address, city, bio } =
      user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      whatsapp,
      address,
      city,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // 1 day
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Succesfully Logged out" });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { _id, name, email, photo, phone, whatsapp, address, city, bio } = user;
  console.log(req);
  if (user) {
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      whatsapp,
      address,
      city,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, email, photo, phone, whatsapp, address, city, bio } =
      user;
    user.name = req.body.name || name;
    user.email = email;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.whatsapp = req.body.whatsapp || whatsapp;
    user.address = req.body.address || address;
    user.city = req.body.city || city;
    user.bio = req.body.bio || bio;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      whatsapp: updatedUser.whatsapp,
      address: updatedUser.address,
      city: updatedUser.city,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;
  // password not found in request
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please enter both old and new password");
  }
  // user not found
  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  // check if old password matches the one in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password changed succesfully" });
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  res.send("forgot password");
});

const getShops = asyncHandler(async (req, res) => {
  let { city } = req.query;
  var regex = new RegExp(["^", city, "$"].join(""), "i");
  const shopsList = await User.find({ city: regex }).sort("-createdAt");
  if (shopsList) {
    res.status(200).json({
      shopsList,
    });
  } else {
    res.status(400);
    throw new Error("No shops found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  loginStatus,
  getUser,
  updateUser,
  changePassword,
  forgotPassword,
  getShops,
};
