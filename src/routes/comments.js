const express = require('express');
const router = express.Router();
const { Comment } = require('../models/Comment');
const { auth } = require('../middleware/auth');


// 코멘트 저장 후 불러오기

router.post('/saveComment', auth, (req, res, next) => {

    try{

        const comment = new Comment(req.body);

        comment.save().then(result => {
            Comment.find({'_id': comment._id}) // Comment 모델에서 아이디를 바로 찾기
                    .populate('writer')
                    .then(review => {
                        res.json({
                            message: "코멘트 받아오기 성공",
                            review
                        });
                     })
               })

    }catch(error){
        next(error)
    }
})


// 코멘트 전체 불러오기

router.post('/getComment', auth, (req, res, next) => {

    try{
        Comment.find({'commentId': req.body.productId }) 
        .populate('writer')
        .then(reviews => {
            res.json({
                message: "전체 코멘트 찾아서 가져오기 성공",
                reviews
            });
         })

    }catch(error){
        next(error)
    }

   
})


module.exports = router;