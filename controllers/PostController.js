const Post = require("../model/Post");
const User = require("../model/User");
const mongoose = require("mongoose");

// insert a post, with an user related to it
const insertPost = async (req, res) => {
  const { title } = req.body;
  const image = req.file.path;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  // create a post
  const newPost = await Post.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // if post was created successfully, return data
  if (!newPost) {
    res
      .status(422)
      .json({
        errors: ["Houve um problema, por favor, tente novamente mais tarde."],
      });
      return
  }

  res.status(201).json(newPost);
};

// Remove a post from DB
const deletePost = async(req, res) => {
  const {id} = req.params
  const reqUser = req.user
  const post = await Post.findById(mongoose.Types.ObjectId(id))

  // Check if post exists
  if(!post) {
    res.status(404).json({errors: ["Foto não encontrada"]})
    return
  }

  // Check if post belongs to user
  if(post.userId.toString() !== reqUser._id.toString()) {
    res.status(422).json({errors: ["Ocorreu um erro, por favor tente novamente mais tarde."]})
  }

  await Post.findByIdAndDelete(post._id)

  res.status(200).json({id: post._id, message: "Postagem deletada com sucesso."})
}

const getAllPost = async(req, res) => {
  const posts = await Post.find({}).sort([["createdAt", -1]]).exec()

  return res.status(200).json(posts)
}

const getUserPosts = async(req, res) => {
  const {id} = req.params

  const posts = await Post.find({userId: id}).sort([['createdAt', -1]]).exec()

  return res.status(200).json(posts)
}

// Get post by id
const getPostById = async(req, res) => {
  const {id} = req.params

  const post = await Post.findById(mongoose.Types.ObjectId(id))

  if(!post) {
    return res.status(404).json({errors: ["Post não encontrado."]})
  }

  return res.status(200).json(post)
}

// update a post
const updatePost = async(req, res) => {
  const {id} = req.params
  const {title} = req.body

  const reqUser = req.user

  const post = await Post.findById(id)

  // check if post exists
  if(!post) {
    return res.status(404).json({errors: ["Post não encontrado"]})
  }

  // check if post belongs to user
  if(post.userId.toString() !== reqUser._id.toString()) {
    return res.status(422).json({errors: ["Ocorreu um erro, por favor tente novamente mais tarde."]})
  }

  if(!title) {
    return res.status(422).json({errors: ["A descrição é obrigatória"]})
  }

  if(title) {
    post.title = title
  }

  await post.save()

  return res.status(200).json({post, message: "Post editado com sucesso."})
}

// Like functionality
const likePost = async(req, res) => {
  const {id} = req.params

  const reqUser = req.user

  const post = await Post.findById(id)

  if(!post) {
    return res.status(404).json({errors: ["Post não encontrado"]})
  }

  // check if user already liked the photo
  if(post.likes.includes(reqUser._id)) {
    return res.status(422).json({errors: ["Você já curtiu a foto."]})
  }

  // put user id in likes array
  post.likes.push(reqUser._id)

  await post.save()

  res.status(200).json({postId: id, userId: reqUser._id, message: "Você curtiu o post!"})
}

// Comment functionality
const commentPost = async(req, res) => {
  const {id} = req.params
  const {comment} = req.body

  const reqUser = req.user

  const user = await User.findById(reqUser._id)

  const post = await Post.findById(id)

  // check if post exists
  if(!post) {
    return res.status(404).json({errors: ["Post não encontrado"]})
  }

  // put comment in the array of comments
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id
  }

  if(!comment) {
    return res.status(422).json({erros: ["O comentário é obrigatório"]})
  }

  post.comments.push(userComment)

  await post.save()

  res.status(200).json({comment: userComment, message: "Comentário adicionado!"})
}

// Search posts by title
const searchPost = async(req, res) => {
  const {q} = req.query

  const posts = await Post.find({title: new RegExp(q, "i")}).exec()

  res.status(200).json(posts)
}

module.exports = {
  insertPost,
  deletePost,
  getAllPost,
  getUserPosts,
  getPostById,
  updatePost,
  likePost,
  commentPost,
  searchPost
};
