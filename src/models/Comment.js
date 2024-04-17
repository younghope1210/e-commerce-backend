const { default: mongoose, Schema  } = require("mongoose");

const commentSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    responseTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    }

}, { timestamps: true })


const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment } ;