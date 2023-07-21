const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router()
const jwt = require('jsonwebtoken')


//新增用户
usersRouter.post('/', async (req, resp) => {
    const body = req.body
    // console.log(body)

    const hasuser = await User.findOne({username: body.username})
    if(hasuser) return resp.json({
        msg: "该用户已存在",
        code: 2000
    });

    //加盐：防止彩虹表功击
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()

    const userForToken = {
        username: savedUser.username,
        id: savedUser._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn: 60*60})    //expiresIn过期是时间

    resp.json({ token, username: user.username, name: user.name })
})

//查询所有用户
usersRouter.get('/', async (req, resp) => {
    const users = await User.find({})
    resp.json(users)
})

module.exports = usersRouter