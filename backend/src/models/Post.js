const mongoose = require('mongoose');

const postSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: 'User',

        required: true,
      },

      text: {
        type: String,
        default: '',
      },
      // optional product title for marketplace items
      title: {
        type: String,
        default: null,
      },

      imageUrl: {
        type: String,
        default: null,
      },

      imageFileId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      
      // Cloudinary public id (if uploaded to Cloudinary)
      imageCloudinaryId: {
        type: String,
        default: null,
      },

      // Marketplace related fields
      price: {
        type: String,
        default: null,
      },

      isMarketplace: {
        type: Boolean,
        default: false,
      },

      likes: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,

          ref: 'User',
        },
      ],
          // soft-delete flag: when true the post is hidden from feeds
          deleted: {
            type: Boolean,
            default: false,
          },

          deletedAt: {
            type: Date,
            default: null,
          },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  'Post',
  postSchema
);