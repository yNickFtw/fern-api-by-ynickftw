const express = require('express')
const router = express.Router()

// Controller
const { insertPost, deletePost, getAllPost, getUserPosts, getPostById, updatePost, likePost, unlikePost, commentPost, searchPost, savePost } = require('../controllers/PostController')

// Middlewares
const { postInsertValidation, postUpdateValidation, commentValidation } = require('../middlewares/postValidation')
const authGuard = require('../middlewares/authGuard')
const validate = require('../middlewares/handleValidation')
const { imageUpload } = require('../middlewares/imageUpload')

// Routes
router.post('/', authGuard, imageUpload.single("image"), postInsertValidation(), validate, insertPost)
router.delete('/:id', authGuard, deletePost)
router.get('/', getAllPost)
router.get('/user/:id', authGuard, getUserPosts)
router.get('/search', authGuard, searchPost)
router.get('/:id', authGuard, getPostById)
router.put('/:id', authGuard, postUpdateValidation(), validate, updatePost)
router.put('/comment/:id', authGuard, commentValidation(), validate, commentPost)
router.put('/unlike/:id', authGuard, unlikePost)
router.put('/like/:id', authGuard, likePost)
router.put('/save/:id', authGuard, savePost)

module.exports = router