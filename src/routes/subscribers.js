const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models/Subscriber');
const { auth } = require('../middleware/auth');


// 구독한 사람들의 숫자

router.post("/subscribeNumber", auth, (req, res, next) => {

    try{

        Subscriber.find({ "userTo": req.body.userTo })
        .then(subscribe => {
            res.status(200).json({
                success: true,
                subscribeNumber: subscribe.length 
            });
        })

    }catch(error){
        next(error)
    }

});

router.post("/subscribed", auth, (req, res, next) => {

    try{

        Subscriber.find({ "userTo": req.body.userTo , "userFrom": req.body.userFrom })
        .then(subscribe => {

            let result = false;
            if(subscribe.length !== 0) { // 구독자 수가 0이 아니라면
                result = true
            }
            res.status(200).json({
                success: true,
                subscribed: result 
            });
        })

    }catch(error){
        next(error)
    }

});

// 구독 신청

router.post("/subscribe", auth, (req, res, next) => {

    try{

        const subscribe = new Subscriber(req.body);

        subscribe.save().then(doc =>{
            res.status(200).json({
                success: true
                });
        })

    }catch(error){
        next(error)
    }

});

// 구독 취소

router.post("/unSubscribe", auth, (req, res, next) => {

    try{

        Subscriber.findOneAndDelete({ userTo: req.body.userTo, userFrom: req.body.userFrom })
         .then(doc =>{
            res.status(200).json({
                success: true
                });
        })

    }catch(error){
        next(error)
    }

});


module.exports = router;