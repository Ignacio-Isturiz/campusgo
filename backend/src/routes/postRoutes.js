const express = require('express');

const router = express.Router();

const {
  getPosts,
  createPost,
  toggleLike,
  deletePost,
  getMarketplacePosts,
  getBienestarPosts,
} = require(
  '../controllers/postController'
);

// use session-based auth middleware (validates token stored in AuthSession)
const { requireAuth } = require('../middlewares/auth');

// obtener feed
router.get(
  '/',
  requireAuth,
  getPosts
);

// obtener marketplace
router.get(
  '/marketplace',
  requireAuth,
  getMarketplacePosts
);

// obtener bienestar
router.get(
  '/bienestar',
  requireAuth,
  getBienestarPosts
);

// crear publicación
router.post(
  '/',
  requireAuth,
  createPost
);

// dar like
router.post(
  '/:id/like',
  requireAuth,
  toggleLike
);

// eliminar publicación
router.delete(
  '/:id',
  requireAuth,
  deletePost
);

module.exports = router;
