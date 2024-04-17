const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

let auth = async(req, res, next) => {
    // 토큰을 request headers에서 가져오기
    const authHeader = req.headers['authorization'];
    // Bearer dfjsdfjlksdf.reewrjeklr.dfasdf.rwqerwqer
    const token =  authHeader && authHeader.split(' ')[1];
    if(token === null) return res.sendStatus(401);

     // 토큰이 유효한 토큰인지 확인
    try{
       
        // 토큰 복호화하기
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        // 데이터 베이스에서 해당 유저의 아이디를 가진 유저의 데이터를 모두 가져온다
        const user = await User.findOne({ "_id": decode.userId });
        
        if (!user) {
            return res.status(400).send('없는 유저입니다.');
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        next(error);
    }
}


module.exports = { auth };