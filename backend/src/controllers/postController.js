const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        'userId',
        'email photoUrl'
      )
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message:
        'Error obteniendo posts',
    });
  }
};

exports.createPost = async (
  req,
  res
) => {
  try {
    const { text, imageUrl } =
      req.body;

    const post = await Post.create({
      userId: req.user.id,
      text,
      imageUrl,
    });

    const populatedPost =
      await Post.findById(post._id)
        .populate(
          'userId',
          'email photoUrl'
        );

    req.io.emit(
      'newPost',
      populatedPost
    );

    res.status(201).json(
      populatedPost
    );
  } catch (error) {
    res.status(500).json({
      message:
        'Error creando post',
    });
  }
};

exports.toggleLike = async (
  req,
  res
) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            'Post no encontrado',
        });
    }

    const userId = req.user.id;

    const alreadyLiked =
      post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes =
        post.likes.filter(
          id =>
            id.toString() !== userId
        );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    req.io.emit('updateLike', {
      postId: post._id,
      likesCount:
        post.likes.length,
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: 'Error en like',
    });
  }
};

exports.deletePost = async (
  req,
  res
) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            'Post no encontrado',
        });
    }

    if (
      post.userId.toString() !==
      req.user.id
    ) {
      return res
        .status(403)
        .json({
          message:
            'No autorizado',
        });
    }

    await post.deleteOne();

    req.io.emit(
      'deletePost',
      post._id
    );

    res.json({
      message:
        'Post eliminado',
    });
  } catch (error) {
    res.status(500).json({
      message:
        'Error eliminando post',
    });
  }
};