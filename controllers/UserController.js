const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_PASS;
const mongoose = require("mongoose");

// Generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Register user and sign in
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if user exists
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail."] });
  }

  // generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  // if user was created successfully, return the token
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde"] });
    return;
  }

  res.status(201).json({
    _id: newUser._id,
    token: generateToken(newUser._id),
  });
};

// sign user in
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // check if user exists
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }

  // check if password matches
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida"] });
    return;
  }

  // return user with token
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

// Get current logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

const getAllUsers = async (req, res) => {
  const users = await User.find();

  if (!users)
    return res.status(404).json({ errors: ["Não há usuários cadastrados"] });

  return res.status(200).json(users);
};

// update an user
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;

  const user = await User.findById(mongoose.Types.ObjectId(reqUser._id)).select(
    "-password"
  );

  if (name) {
    user.name = name;
  }

  if (password) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    user.bio = bio;
  }

  await user.save();

  res.status(200).json(user);
};

// get user by id
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(mongoose.Types.ObjectId(id)).select(
      "-password"
    );

    // check if user exists
    if (!user) {
      res.status(404).json({ errors: ["Usuário não encontrado"] });

      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(422).json({ errors: ["Usuário não encontrado."] });
  }
};

// Follow user functionality
const followUser = async (req, res) => {
  const { userIdToFollow } = req.params;
  const reqUser = req.user;

  try {
    const userToFollow = await User.findById(userIdToFollow);
    const user = await User.findById(reqUser);

    if (!userToFollow || !user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // verify if user follow
    const isFollowing = user.following.includes(userIdToFollow);

    if (isFollowing) {
      return res.status(400).json({ message: "Usuário já está sendo seguido" });
    }

    // add to list of following
    user.following.push(userIdToFollow);
    await user.save();

    // add to list of followers
    userToFollow.followers.push(reqUser._id);
    await userToFollow.save();

    res.status(200).json({ message: "Usuário seguido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao seguir o usuário", error });
  }
};

const unfollowUser = async (req, res) => {
  const { userIdToUnfollow } = req.params;
  const reqUser = req.user._id

  try {
    const userToUnfollow = await User.findById(userIdToUnfollow);
    const user = await User.findById(reqUser);

    if (!userToUnfollow || !user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // verify if user already unfollowed
    const isFollowing = user.following.includes(userIdToUnfollow);

    if (!isFollowing) {
      return res.status(400).json({ message: "Usuário já foi deixado de seguir" });
    }

    // remove from list of following
    user.following.pull(userIdToUnfollow);
    await user.save();

    // remove from list of followers
    userToUnfollow.followers.pull(reqUser)
    await userToUnfollow.save();

    res.status(200).json({ message: "Usuário deixado de seguir com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deixar de seguir o usuário", error });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  update,
  getUserById,
  followUser,
  unfollowUser,
};
