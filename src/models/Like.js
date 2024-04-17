const { default: mongoose, Schema  } = require("mongoose");

const likeSchema = mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    productId: {
        type: String,
        ref: 'Product'
    }
 
 }, { timestamps: true })
 

const Like = mongoose.model("Like", likeSchema);

module.exports = { Like } ;