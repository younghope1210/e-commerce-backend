const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Product } = require('../models/Product');
const { Payment } = require('../models/Payment');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const async = require('async');
require('dotenv').config();


// 유저 인증체크

router.get('/auth', auth, async (req, res) => {

    return res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history
    })

})


// 회원가입 유저정보 저장

router.post('/register', async (req, res, next) => {

    try{
        const user = new User(req.body); // User model사용

        await user.save();
        return res.sendStatus(200); // 성공

    } catch(error){
        next(error);
    }


})


// 로그인 요청

router.post('/login', async (req, res, next) => {
// frontend에서 req.body로 받아온 값 =  email, password
    try{

        // 회원가입이 된 데이터가 있는 유저인지부터 체크한다
        const user = await User.findOne({ email: req.body.email});
        if(!user){
            return res.status(400).send("로그인하는 이메일이 없습니다");
        }
        // 비밀번호가 맞는지 체크한다
        const isMatch = await user.comparePassword(req.body.password)
        if(!isMatch){ // 매치한 비밀번호가 맞지 않으면 에러 처리
            return res.status(400).send("맞는 비밀번호가 아닙니다");
        }

        // 페이로드에 유저 아이디 넣어준다
        // json web token으로 토큰 생성
        //toHexString을 사용하는 이유 =  mongodb id는 objectId로 되어 있기 때문에 string로 바꿔주기 위해서

        const payload = {
            userId: user._id.toHexString()
        }
        //토큰생성 후에 유저와 토큰 데이터 응답으로 보내주기

     const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'})
        return res.json({ user, accessToken }) // user 데이터와 생성된 토큰을 같이 보내준다
        
    } catch(error){
        next(error);
    } 

})

// 로그아웃

router.post('/logout', auth, async(req, res, next) => {
    try{

        return res.sendStatus(200);

    } catch(error){
        next(error)
    }
})

// 로그인된 상태에서 구입할 상품 장바구니에 넣기

router.post('/cart', auth, async (req, res, next) => {

    try{

        // 제일 먼저 User Collection에 해당 유저의 정보 가져온다
        const userInfo = await User.findOne({_id: req.user._id})

        // User Collection에서 가져온 cart에 지금 넣으려는 상품이 들어있는지 확인

        let duplicate = false;
        
        userInfo.cart.forEach((item) => {
            if(item.id === req.body.productId ){ // frontend 단에서 보내온 productId
                duplicate = true;
            }
        })

        // cart안에 이미 있던 상품이라면

        if(duplicate){

            const user = await User.findOneAndUpdate(
                { _id: req.user._id, "cart.id":req.body.productId },
                { $inc: {"cart.$.quantity": 1}}, // 장바구니에 담긴 상품의 갯수 하나를 올려준다
                { new: true}
            )
             // 200은 성공 201은 새로운 컨텐츠 만들기 성공. post mathod에 대한 응답에 잘 어울린다
             return res.status(201).send(user.cart);   
            

        } else {    // cart안에 담아있지 않은 상품이라면

            const user = await User.findOneAndUpdate(
                {_id: req.user._id},
                {
                    $push: { // 장바구니에 겹치는 상품이 없다면 push
                        cart: {
                            id:req.body.productId,
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true }
            )
             return res.status(200).send(user.cart);   
        }
    
     
    }catch(error){
        next(error);
    }
})


// 장바구니 상품 삭제하기

router.delete('/cart', auth, async(req, res) => {

    try{
        // 장바구니 페이지에서 지우려고 했던 상품 지워주기

        const userInfo = await User.findOneAndUpdate(
            {_id: req.user._id},
            {
                "$pull":
                    {"cart" : {"id": req.query.productId}}
            },
            { new: true}
        )

            const cart = userInfo.cart;
            const array = cart.map(item => {
                return item.id;
            })

            // proudct collection에서 현재 남아있는 상품들의 정보를 가져온다
            //productIds = ['32423423423', '345345345345345345', '345345345345345'] 이 형식으로 바꿔주기
            
            const productInfo =  await Product
            .find({_id:{$in:array}})
            .populate('writer')

            return res.status(200).json({
                productInfo,
                cart
            })

    }catch(error){

        next(error);
    
    }

})


// 결제하기

router.post('/payment', auth, async (req, res) => {

    // user collection의 History 필드에 간단한 결제 정보 넣기

    let history = [];
    let transactionData = {};

    // cartDetail을 돌면서 history 배열에 하나씩 push
    req.body.cartDetail.forEach((item) => {
        history.push({
            dateOfPurchase: new Date().toISOString(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentID: item._id,
            // paymentID: crypto.randomUUID()
        })
    })

    // Payment Collection 안에 결제한 정보들 넣어주기

    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }
// 상위 transactionData 객체에 히스토리 넣어준다
    transactionData.product = history;


    // history 정보저장
    // each 가 있어야지 history 배열안에 객체로 들어가게된다
    // { history : { $each : history }} => 배열안에 객체를 넣을 수 있다


    await User.findOneAndUpdate(
        {_id : req.user._id},
        { // 배열안에 객체들만 넣기 위해 사용 [{}, {}, {}]
        //{ history : { $each : history }} => { history : { $each : {},{},{} }}
            $push : { history : { $each : history }}, 
            $set : { cart: [] } // 카트 collection 배열 비워주기
        
        }
    )

    // payment collection
    // payment에 transactionData 객체정보 정보저장하기

        const payment = new Payment(transactionData);
        const paymetDoc = await payment.save(); // 저장하고
        // console.log(paymetDoc);
        

        let product = [];

        paymetDoc.product.forEach(item => {
            product.push({id:item.id, quantity:item.quantity})
        })

//async.eachSeries => 순차처리가 필요할 때 사용, each와 같지만 한번에 하나의 비동기 작업만 실행         
//매개변수 product: 순환을 할 collection
//매개변수 async(item) : product 베열 안의 {id:item.id, quantity:item.quantity} 객체들       
    
async.eachSeries(product, async(item) => {
            await Product.updateOne(
                {_id: item.id },
                {
                    $inc: {
                        "sold" : item.quantity
                    }
                }
            )
        },
        (err) => {
            if(err) return res.status(500).send(err);
            return res.sendStatus(200);
        }
     )

})

module.exports = router;