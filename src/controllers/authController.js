const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const asyncHandle = require('express-async-handler');

const getJsonWebToken = async (email, id) => {
    const payload = { email, id }
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '7d',

    })
    return token
}

const register = asyncHandle(async (req, res) => {
    const { email, password, username } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
        res.status(402)
        throw new Error('Email đã được sử dụng')
        // return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Tạo muối và băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    console.log(hashPassword);

    // Tạo người dùng mới với mật khẩu đã được băm
    const newUser = new UserModel({
        email: email,
        username: username ?? '',
        password: hashPassword
    });

    // Lưu người dùng mới vào cơ sở dữ liệu
    await newUser.save();
    console.log('tạo ng dung vào db xog')



    // Trả về phản hồi thành công
    res.status(200).json({
        message: "Đăng ký người dùng mới thành công",
        data: {
            ...newUser,
            accessToken:  await getJsonWebToken(email, newUser.id)
        }
    });
});

module.exports = {
    register,
};
