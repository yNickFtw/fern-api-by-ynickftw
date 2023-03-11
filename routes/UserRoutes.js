const express = require("express");
const router = express.Router();

// Controller
const { register, login, getCurrentUser, getAllUsers, update, getUserById, followUser, unfollowUser } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const { userCreateValidation, loginValidation, userUpdateValidation } = require("../middlewares/userValidation");
const authGuard = require("../middlewares/authGuard");
const { imageUpload } = require('../middlewares/imageUpload')

// Routes
router.post("/register", userCreateValidation(), validate, register);
router.post('/login', loginValidation(), validate, login)
router.get('/profile', authGuard, getCurrentUser)
router.get('/allusers', getAllUsers)
router.put('/', authGuard, userUpdateValidation(), validate, imageUpload.single("profileImage"), update)
router.put("/follow/:userIdToFollow", authGuard, followUser);
router.put("/unfollow/:userIdToUnfollow", authGuard, unfollowUser);
router.get('/:id', getUserById)


module.exports = router;
