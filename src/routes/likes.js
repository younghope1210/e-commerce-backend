const express = require('express');
const router = express.Router();
const { Like } = require("../models/Like");
const { Dislike } = require("../models/Dislike");
const { auth } = require('../middleware/auth');


// 좋아요를 받았는지 체크 

router.post('/getLikes', auth, (req, res, next) => {

    try{

        let variable = {}
        if (req.body.productId) {
            variable = { productId: req.body.productId }
        } else {
            variable = { commentId : req.body.commentId }
        } 

        Like.find(variable)
        .then(likes => {
            res.status(200).json({
                success: "좋아요 클릭 찾기 성공",
                likes
            });
         })

    }catch(error){
        next(error)
    }
})


// 싫어요를 받았는지 체크

router.post('/getDislikes', auth, (req, res, next) => {

    try{

        let variable = {}
        if (req.body.productId) {
            variable = { productId: req.body.productId }
        } else {
            variable = { commentId : req.body.commentId }
        }

        Dislike.find(variable)
        .then(dislikes => {
            res.status(200).json({
                success: "좋아요 클릭 찾기 성공",
                dislikes
            });
         })

    }catch(error){
        next(error)
    }
})

// 좋아요 버튼을 클릭했을 때

router.post('/upLike', auth, (req, res, next) => {

    try{

        let variable = {}
        if(req.body.productId) {
            variable = { productId: req.body.productId, userId: req.body.userId }
        } else {
            variable = { commentId : req.body.commentId , userId: req.body.userId}
        }
// Like collection 에 좋아요를 클릭한 정보를 넣어준다
        const like = new Like(variable)
      
        like.save().then(likeResult => {
            // 만약에 Dislike 싫어요 버튼이 클릭이 되어 있다면 좋아요를 눌렀기 때문에 
            // dislike을 -1 해준다
            Dislike.findOneAndDelete(variable)
                .then(disLikeResult => {
                    res.status(200).json({
                        success: true
                        });
                    })
            })

    }catch(error){
        next(error)
    }
})

// 좋아요 버튼이 이미 클릭이 되어 있어 좋아요를 해제하고자 할 때

router.post('/unLike', auth, (req, res, next) => {

    try{

        let variable = {}
        if(req.body.productId) {
            variable = { productId: req.body.productId, userId: req.body.userId }
        } else {
            variable = { commentId : req.body.commentId, userId: req.body.userId}
        }
    
            Like.findOneAndDelete(variable)
                    .then(result => {
                        res.json({
                            success: true
                          });
                     })
             

    }catch(error){
        next(error)
    }
})


// 싫어요 버튼이 이미 클릭이 되어 있어 싫어요를 해제하고자 할 때

router.post('/unDisLike', auth, (req, res, next) => {

    try{

        let variable = {}
        if(req.body.productId) {
            variable = { productId: req.body.productId, userId: req.body.userId }
        } else {
            variable = { commentId : req.body.commentId, userId: req.body.userId}
        }

        Dislike.findOneAndDelete(variable)
                    .then(result => {
                        res.json({
                            success: true
                          });
                     })
             

    }catch(error){
        next(error)
    }
})




// 싫어요 버튼을 클릭했을 때

router.post('/upDisLike', auth, (req, res, next) => {

    try{

        let variable = {}
        if(req.body.productId) {
            variable = { productId: req.body.productId, userId: req.body.userId }
        } else {
            variable = { commentId : req.body.commentId, userId: req.body.userId}
        }

        const disLike = new Dislike(variable)
      // Like collection 에 싫어요를 클릭한 정보를 넣어준다
        disLike.save().then(dislikeResult => {
        // 만약에 like 좋아요 버튼이 클릭이 되어 있다면 싫어요를 눌렀기 때문에 
        // like을 -1 해준다
             Like.findOneAndDelete(variable)
             .then(LikeResult => {
                res.status(200).json({
                    success: true
                });
            })
        })
    }catch(error){
        next(error)
    }
})


module.exports = router;