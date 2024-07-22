const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRoute');
const database = require('./src/configs/database');
const errorMiddleware = require('./src/middlewares/errorMiddleware');
require('dotenv').config()

// Tạo một ứng dụng Express
const app = express();

// Cấu hình các middleware toàn cục
app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu
database();

// Đăng ký các tuyến đường
app.use('/auth', authRouter);

// Đăng ký middleware xử lý lỗi
app.use(errorMiddleware);

// Khởi động máy chủ và lắng nghe trên cổng
const PORT = 3001;
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
