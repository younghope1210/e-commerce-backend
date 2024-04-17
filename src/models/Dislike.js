const { default: mongoose, Schema  } = require("mongoose");

const dislikeSchema = mongoose.Schema({

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
 

const Dislike= mongoose.model("Dislike", dislikeSchema);

module.exports = { Dislike } ;