const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    // Include user's displayName and username so frontend can show proper author info
    const posts = await Post.find()
      .populate(
        'userId',
        'email photoUrl displayName username phone'
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

// obtener solo publicaciones marcadas como marketplace
exports.getMarketplacePosts = async (req, res) => {
  try {
    const posts = await Post.find({ isMarketplace: true, deleted: { $ne: true } })
      .populate('userId', 'email photoUrl displayName username phone')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo marketplace posts' });
  }
};

exports.createPost = async (
  req,
  res
) => {
  try {
    const { text, title, imageUrl, base64, fileName, price, isMarketplace } = req.body;

    let finalImageUrl = imageUrl || null;

    // if client uploaded base64 image, try Cloudinary first, else save to GridFS
    if (base64 && fileName) {
      try {
        // prefer Cloudinary when configured
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const { uploadBase64ToCloudinary } = require('../services/cloudinary');
          const uploadRes = await uploadBase64ToCloudinary(base64, fileName);
          finalImageUrl = uploadRes.url;
          req._uploadedFileCloudinaryId = uploadRes.public_id;
        } else {
          const { uploadBase64 } = require('../utils/gridfs');

          let contentType = 'image/jpeg';
          if (fileName.toLowerCase().endsWith('.png')) contentType = 'image/png';

          const fileId = await uploadBase64(base64, fileName, contentType);

          const configuredBase = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
          finalImageUrl = `${configuredBase}/api/files/${fileId}`;

          // also keep the fileId for more robust references
          req._uploadedFileId = fileId;
        }
      } catch (err) {
        console.error('Error saving post image:', err);
        return res.status(400).json({ message: 'Formato de imagen inválido' });
      }
    }

    const postData = {
      userId: req.user.id,
      text,
      title: title || null,
      imageUrl: finalImageUrl,
      price: price || null,
      isMarketplace: !!isMarketplace,
    };

    if (req._uploadedFileId) postData.imageFileId = req._uploadedFileId;
    if (req._uploadedFileCloudinaryId) postData.imageCloudinaryId = req._uploadedFileCloudinaryId;

    const post = await Post.create(postData);

    const populatedPost =
      await Post.findById(post._id)
        .populate(
          'userId',
          'email photoUrl displayName username phone'
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

    // delete the post completely from the database
    await post.deleteOne();

    req.io.emit('deletePost', post._id);

    res.json({ message: 'Post eliminado' });
  } catch (error) {
    res.status(500).json({
      message:
        'Error eliminando post',
    });
  }
};

module.exports = exports;
