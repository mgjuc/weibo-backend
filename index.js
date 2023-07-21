require('dotenv').config()
const express = require('express')
require('express-async-errors') //自动调用next处理中间件的async异常
const cors = require('cors')
const app = express()
const middlewares = require('./utils/middleware')
const Weibo = require('./models/weibo')
const weiboRouter = require('./controllers/weibos')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

//夸域处理中间件
app.use(cors())

//添加json中间件自动处理contenttype＝json的Body数据
app.use(express.json())

//路由详情打印，不带()
app.use(middlewares.reqdetail)

app.get('/', (req, resp) => {
    resp.send('<h1>这是后端</h1>')
})

app.use('/api/login', loginRouter)

//动态处理
app.use('/api/contentlist', weiboRouter)    //使用中间件方式处理路由，必须在内部拋出异常next()

//用户处理
app.use('/api/users', usersRouter)

app.use(middlewares.unknownEndpoint)


app.use(middlewares.errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`)
})