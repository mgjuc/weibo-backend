const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')


loginRouter.post('/', async (req, resp) => {
    const body = req.body

    const user = await User.findOne({ username: body.username })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return resp.status(200).json({
            code: 2000,
            msg: '用户名或密码错误',
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }
    let lastlogin = user.lastlogin
    user.lastlogin = new Date()
    await User.findByIdAndUpdate(user._id, { lastlogin: user.lastlogin })

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })
    console.log(`${user.username}已登录`)

    return resp.status(200).send({
        code: 1000,
        msg: 'success',
        data: {
            token,
            username: user.username,
            name: user.name,
            headUrl: user.headUrl,
            lastlogin: lastlogin
        }
    })
})


module.exports = loginRouter