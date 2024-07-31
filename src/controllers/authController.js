require('dotenv').config()
const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const asyncHandle = require('express-async-handler');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
    },
})

const handleSendMail = async (val, toEmail) => {
    try {
        await transporter.sendMail({
            from: `"GreenD 👻" <${process.env.USERNAME_EMAIL}>`, // sender address
            to: toEmail, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Mã của mày", // plain text body
            html: "<b>32424</b>", // html body
        });
        return 'Ok'
    }
    catch (e) {
        console.log('Lỗi gửi mail ', e)
        return e
    }
}

const verification = asyncHandle(async (req, res) => {
    const { email } = req.body
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    try {
        await handleSendMail('', email)
        res.status(200).json({
            message: 'Gửi mã xác thực thành công',
            data: {
                code: verificationCode
            }
        })
        console.log('Mã xác thực: ', verificationCode)
    }
    catch (e) {
        console.log('lỗi varification ', e)
    }

})


const getJsonWebToken = async (email, id) => {
    const payload = { email, id }
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '7d',

    })
    return token
}

const register = asyncHandle(async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const existEmail = await UserModel.findOne({ email });
        if (existEmail) {
            console.log('Email đã được sử dụng')
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Tạo muối và băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới với mật khẩu đã được băm
        const newUser = new UserModel({
            email: email,
            username: username ?? '',
            password: hashPassword
        });

        // Lưu người dùng mới vào cơ sở dữ liệu
        await newUser.save();

        // Trả về phản hồi thành công
        const accessToken = await getJsonWebToken(email, newUser.id);
        console.log('Đăng ký người dùng mới thành công')
        return res.status(200).json({
            message: "Đăng ký người dùng mới thành công",
            data: {
                email: newUser.email,
                id: newUser.id,
                accessToken
            }
        });
    } catch (error) {
        // Xử lý lỗi
        console.error(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng ký' });
    }
});


const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body
    const existUser = await UserModel.findOne({ email });
    if (!existUser) {
        res.status(403).json({
            message: 'Email không tìm thấy'
        })
        throw new Error('Email không tìm thấy')
    }
    const isMatchPassword = await bcrypt.compare(password, existUser.password)
    if (!isMatchPassword) {
        res.status(401).json({
            message: 'Email hoặc mật khẩu không chính xác'
        })
        throw new Error('Email hoặc mật khẩu không chính xác')
        return;
    }
    res.status(200).json({
        message: "Đăng nhập thành công",
        data: {
            email: existUser.email,
            id: existUser.id,
            accessToken: await getJsonWebToken(email, existUser.id)
        }
    });
})


module.exports = {
    register,
    login,
    verification,
};
