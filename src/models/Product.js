const { default: mongoose, Schema } = require("mongoose");

const productSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        maxLength: 30
    },
    description: String,
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    sold: {
        type: Number,
        default: 0
    },
    categorys: {
        type: Number,
        default: 1
    },
    views: {
        type: Number,
        default: 0
    }
})


// 상품 검색 관련
productSchema.index({
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 5, // 상품명으로 찾기 우선순위로
        description: 1
    }
})

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };