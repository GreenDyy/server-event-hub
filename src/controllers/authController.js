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

const test = async (req, res) => {
    const a = req.body
    res.send('test')
}

const handleSendMail = async (val) => {
    try {
        await transporter.sendMail(val);
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
    const dataEmail = {
        from: `"GreenD 👻" <${process.env.USERNAME_EMAIL}>`, // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Mã của mày", // plain text body
        html: `<b>${verificationCode}</b>`, // html body
    }

    await handleSendMail(dataEmail)
    res.status(200).json({
        message: 'Gửi mã xác thực thành công',
        data: {
            code: verificationCode
        }
    })
    console.log('Mã xác thực: ', verificationCode)
})


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
    }
    res.status(200).json({
        message: "Đăng nhập thành công",
        data: {
            email: existUser.email,
            id: existUser.id,
            username: existUser.username,
            accessToken: await getJsonWebToken(email, existUser.id)
        }
    });
})

const forgotPassword = asyncHandle(async (req, res) => {
    const { email } = req.body
    const newPass = Math.floor(100000 + Math.random() * 900000);
    const dataEmail = {
        from: `"GreenD 👻" <${process.env.USERNAME_EMAIL}>`, // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Mã của mày", // plain text body
        html: `<b>Mật khẩu mới của bạn là: ${newPass}</b>`, // html body
    }
    //tìm tài khoản và đổi pas cho user
    const user = await UserModel.findOne({ email })
    if (user) {
        // Tạo muối và băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPass.toString(), salt)

        await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword,
            isChangePassword: true
        })

        //gửi pass mới cho user
        await handleSendMail(dataEmail)
        res.status(200).json({
            message: 'Gửi mật khẩu mới thành công',
            data: {
                password: newPass
            }
        })
        console.log('Mật khẩu: ', newPass)
    }
    else {
        res.status(404)
        // throw new Error('User not found')
        console.log('User not found')
        return
    }
})

const googleSignin = asyncHandle(async (req, res) => {
    const userInfo = req.body
    const existingUser = await UserModel.findOne({ email: userInfo.email });
    let user;

    if (existingUser) {
        await UserModel.findByIdAndUpdate(existingUser.id, {
            updatedAt: Date.now(),
        });
        user = { ...existingUser };
        user.accessToken = await getJsonWebToken(userInfo.email, userInfo.id);

        if (user) {
            const data = {
                accessToken: user.accessToken,
                id: existingUser._id,
                email: existingUser.email,
                fcmTokens: existingUser.fcmTokens,
                photo: existingUser.photo,
                username: existingUser.username,
            };

            res.status(200).json({
                message: 'Login with google successfully!!!',
                data,
            });
        } else {
            res.sendStatus(401);
            throw new Error('fafsf');
        }
    }
    else {
        const newUser = new UserModel({
            email: userInfo.email,
            username: userInfo.username,
            ...userInfo,
        });
        await newUser.save();
        user = { ...newUser };
        user.accessToken = await getJsonWebToken(userInfo.email, newUser.id);

        if (user) {
            res.status(200).json({
                message: 'Login with google successfully!!!',
                data: {
                    accessToken: user.accessToken,
                    id: user._id,
                    email: user.email,
                    fcmTokens: user.fcmTokens,
                    photo: user.photoUrl,
                    username: user.username,
                },
            });
        } else {
            res.sendStatus(401);
            throw new Error('Lỗi ');
        }
    }
    console.log('data user nhận từ FE: ',userInfo)
})

module.exports = {
    test,
    register,
    login,
    verification,
    forgotPassword,
    googleSignin,
};
