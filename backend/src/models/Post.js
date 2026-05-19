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

      imageUrl: {
        type: String,
        default: null,
      },

      imageFileId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
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