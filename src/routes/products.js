const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const { auth } = require('../middleware/auth');

// 멀터를 이용해서 클라우디너리라는 이미지 호스팅에 사진 업로드
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 클라우드너리 사용

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});


// console.log('process.env.API_KEY:', process.env);
console.log('api_key:', process.env.CLOUDINARY_KEY);
console.log('cloud_name:', process.env.CLOUDINARY_NAME);

require("dotenv").config();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "samples",
    },
  });
    
  const upload = multer({ storage: storage }).single("file")


// 이미지 파일 업로드


router.post('/image', auth, async (req, res, next) => {

    upload(req, res, err => {
        if (err) {
            return req.status(500).send(err);
        }
        return res.json({ filePath:res.req.file.path, fileName: res.req.file.filename })
    })

})


// 프론트단에서 업로드한 상품정보 몽고DB에 저장해주기

router.post('/', auth, (req, res, next) => {

    try{

        const product =  new Product(req.body);
        product.save();
        return res.sendStatus(201);

    } catch(error){

        next(error);

    }

})

// 이커머스 메인페이지에 진열할 상품 불러오기

router.get('/', async(req, res, next) => {

    // asc 오름차순  , desc 내림차순
    const order = req.query.order ? req.query.order : 'asc'; // 내림차순으로 보여지게 선언
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const term = req.query.searchTerm; // 상품 검색

    // 체크박스 라디오박스로 상품 search
    let findArgs = {};

    for(let key in req.query.filters){
        if(req.query.filters[key].length > 0){
            if(key === "price" ){

                findArgs[key] = {
                    
                    //Greater than equal
                    $gte: req.query.filters[key][0],
                    //less than equal
                    $lte: req.query.filters[key][1]

                }

            }else{

                findArgs[key] =  req.query.filters[key];
            }
        }
    }
    // mongoDB 지원
    if(term){ //상품검색

        findArgs["$text"] = { $search: term }

    }

    try{
        // productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다  
        const products = await Product.find(findArgs)
        .populate("writer") // writer의 data를 전부 가져온다
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)

        //mongoDB에 저장된 총 상품 document 갯수를 가져옴 
        const productsTotal = await Product.countDocuments(findArgs);
        
        //skip + limit 한 합이 총 상품 document 갯수보다 작다면 hasMore은 true
        const hasMore = skip + limit < productsTotal ? true : false;

        return res.status(200).json({
            products,
            hasMore
        })

    } catch(error){
        next(error);
    }
  
})


// 상품페이지 불러오기

router.get('/:id', async (req, res, next) => {

// App.js 의 라우트 <Route path="/product/:productId"/> 에서 id값 가져온다   
    const type = req.query.type;
    let productIds = req.params.id;

    

 // id=32423423423,345345345345345,345345345
// productIds = ['32423423423', '345345345345345345', '345345345345345']

    if(type === "array"){

        let ids = productIds.split(',');
        productIds = ids.map(item => {
            return item;
        })
    }

    // productIds를 이용해서 DB에 저장된 productIds 와 같은 상품의 정보를 가져온다.

    try{
       const product =  await Product
        .find({_id: {$in: productIds}}) // $in => 여러개의 producId를 찾고자 할때 사용 
        .populate('writer');

        return res.status(200).send(product);

    }catch(error){
        next(error);
    }
})


module.exports = router;