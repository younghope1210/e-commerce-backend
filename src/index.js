const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const port = 4000;

require('dotenv').config();


// 미들웨어를 등록할 때는 app.use 사용
app.use(cors());

// body를 분석

app.use(express.json());


// 몽구스 연결
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('몽고디비랑 연결됐어요');
})

.catch(error => {
    console.log(error);
})

app.get('/', (req, res) => {
    res.send('hello!');
})



// 프론트단에서 넘어온 요청 routes의 페이지로 넘겨주기

app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/comments', require('./routes/comments'));
app.use('/likes', require('./routes/likes'));
app.use('/subscribers', require('./routes/subscribers'));


// express.static = 정적파일 제공
// path : node.js에서 제공해주는 빌트인 코어 모듈
app.use(express.static(path.join(__dirname, '../uploads')));




// 빌드하고 배포하면 빌드 경로로 연결
// express에서 라우팅 설정은 해당하는 엔드포인트가 나타나면 
//그 요청이 적용되고 나머지가 무시되기 때문에 하단에 선언!

if (process.env.NODE_ENV === "production") {

    app.use(express.static(path.join(__dirname, "../frontend/build"))); // 빌드된 동적파일 경로
  
      app.get("*", function (req, res) {
        res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
      });
  
   }
  


app.listen(port, () => {
    console.log(`${port}번에서 실행이 되었습니다`);
});