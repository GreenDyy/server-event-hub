require('dotenv').config()
const asyncHandle = require('express-async-handler');
const UserModel = require('../models/userModel');

const getAllUsers = asyncHandle(async (req, res) => {
    const users = await UserModel.find()
    let data = []
    users.forEach(item => {
        data.push({
            email: item.email,
            username: item.username,
            id: item.id
        })
    });
    console.log(data)
    res.status(200).json({
        message: 'Lấy data users thành công',
        data
    })
})

module.exports = {
    getAllUsers,
}