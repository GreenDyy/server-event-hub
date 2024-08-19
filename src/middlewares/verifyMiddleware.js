const jwt = require('jsonwebtoken')
const asyncHandle = require('express-async-handler')

const verifyToken = asyncHandle(async (req, res, next) => {
    const accessToken = req.headers.authorization
    const token = accessToken && accessToken.split(' ')[1] //vd: Bearer jdasuydayu thì lấy [1] cái jdawaeewara là token đó
    if (!token) {
        res.status(401)
        throw new Error('un authoziration')
    }
    else {
        try {
            const verify = jwt.verify(token, process.env.SECRET_KEY)
            if (verify) {
                next()
            }
        }
        catch (e) {
            res.status(403)
            throw new Error('Accesstoken is not valid')
        }
    }
})

module.exports = verifyToken