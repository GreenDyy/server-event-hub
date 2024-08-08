const Router = require('express')
const { register, login, verification, forgotPassword, googleSignin, test } = require('../controllers/authController')

const authRouter = Router()
authRouter.post('/test', test)

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/verification', verification)
authRouter.post('/forgotPassword', forgotPassword)
authRouter.post('/googleSignin', googleSignin)

module.exports = authRouter

// #oke