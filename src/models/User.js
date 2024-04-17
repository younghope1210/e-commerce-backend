const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

// npm install bcryptjs --save 설치

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String
})


// salt + 비밀번호'plain password'를 hash로 암호화해서 저장한다
// 암호화할 때 원래 비밀번호에 salt를 붙인 후 해시로 암호화함
// salt는 random 값 : 1234 => salt_1234가 된다

userSchema.pre('save', async function (next){ //.pre => save 하기 전에 처리할 내용

    let user = this;

    if(user.isModified('password')){ // 유저의 패스워드를 수정할 때
        const salt = await bcrypt.genSalt(10); // 솔트를 생성하고
        const hash = await bcrypt.hash(user.password, salt); // 솔트와 함께 해쉬를 한다
        user.password = hash; // 해쉬된 솔트 비번 넘기기
    }

    next(); // 비밀번호 암호화한 뒤에 다음 작업으로 넘김

})

// 로그인하는 비번이 데이터에 있는 비번인지 체크

userSchema.methods.comparePassword = async function(plainPassword){
    
    let user = this;
    
    const match = await bcrypt.compare(plainPassword, user.password); // 해쉬된 비번이랑 매칭
    return match;
}


const User = mongoose.model("User", userSchema);

module.exports = { User };