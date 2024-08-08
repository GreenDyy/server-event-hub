const { default: mongoose } = require('mongoose');

require('dotenv').config();

const dbUrl = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.os50zbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const database = async () => {
    try {
        const connection = await mongoose.connect(dbUrl)
        console.log('Kết nối db thành công')
    }
    catch (e) {
        console.log(e)
        console.log('KẾt nối lỗi cmnr')
        process.exit(1)
    }
}

module.exports = database
