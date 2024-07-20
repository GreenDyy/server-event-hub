const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const PORT = 3001

app.get('/cc', (_req, res) => {
    res.send('<h2>Con cac </h2>')
})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
        return
    }

    console.log(`Server chạy cổng http://localhost:${PORT}`)
})