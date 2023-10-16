const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router()
const jwt = require('jsonwebtoken')


//新增用户
usersRouter.post('/', async (req, resp) => {
    const body = req.body
    // console.log(body)
    if(!body.username || body.username.length == 0  || !body.password || body.password.length == 0){
        return resp.json({
            msg: "用户名或密码为空",
            code: 2000
        });
    }
    let regName = /^[\u4e00-\u9fa5a-zA-Z0-9]{1,10}$/
    //密码是前端加密后的值
    let regPwd = /^[a-z0-9]+$/ 
    if(!regName.test(body.username) || !regPwd.test(body.password)){
        return resp.json({
            msg: "用户名或密码不符要求",
            code: 2000
        });
    }
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

    return resp.json({
        code: 1000,
        msg: 'success',
        data: {
            token, 
            username: user.username, 
            name: user.name
        }
    })
})

//查询所有用户
usersRouter.get('/', async (req, resp) => {
    const users = await User.find({})
    resp.json({
        code: 1000,
        msg: 'success',
        data: users,
    })
})

/** 修改用户头像 */
usersRouter.put('/', async (req, resp) => {
    const body = req.body
    if(!body.headUrl) {
        return resp.json({
            code: 2000,
            msg: 'headUrl为空'
        })
    }
    let token = validateUser(req, resp);
    //只允许改自己的
    // if(token.id != body.id){
    //     return resp.json({
    //         code: 2000,
    //         msg: '权限不足'
    //     })
    // }
    // console.log('修改头像', token.id, body)
    // 注意区分大小写
    const user = await User.findByIdAndUpdate(token.id, {headUrl: body.headUrl})
    return resp.json({
        code: 1000,
        msg: 'success',
        data: user,
    })
})

const getToken = request => {
    const authorization = request.get('authorization')
    console.log(authorization)
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
}

const validateUser = (req, resp) => {
    const token = getToken(req)
    //用私钥验证Token，并解析出Token绑定的值
    const decodedToken = jwt.verify(token, process.env.SECRET)
    //Token绑定的值
    if (!decodedToken.id) {
        return resp.status(400).json({ 
            code: 2000,
            msg: 'content or userinfo missing' 
        })
    }
    return decodedToken
}

module.exports = usersRouter