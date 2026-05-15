const express = require('express');

const router = express.Router();

const {
  getPosts,
  createPost,
  toggleLike,
  deletePost,
} = require(
  '../controllers/postController'
);

const authMiddleware = require(
  '../middlewares/authMiddleware'
);

// obtener feed
router.get(
  '/',
  authMiddleware,
  getPosts
);

// crear publicación
router.post(
  '/',
  authMiddleware,
  createPost
);

// dar like
router.post(
  '/:id/like',
  authMiddleware,
  toggleLike
);

// eliminar publicación
router.delete(
  '/:id',
  authMiddleware,
  deletePost
);

module.exports = router;