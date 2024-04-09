const Weibo = require('../models/weibo')
const weiboRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const mongoose = require('mongoose')

const getToken = request => {
    const authorization = request.get('authorization')
    console.log(authorization)
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
}

/** 
 * 查询所有
 */
weiboRouter.get('/', (req, resp, next) => {
    // resp.json(contentlist)
    Weibo.find({}).then(p => {
        resp.json({
            code: 1000,
            msg: 'success',
            data: p
        })
    }).catch(error => next(error))
})

/** 
 * 通过页数查询，一页15条
 */
weiboRouter.get('/page/:index', (req, resp, next) => {
    // resp.json(contentlist)
    Weibo.find({}).count((err, count) => {
        if (err) {
            next(err)
        }
        else {
            let total = count
            Weibo.find({}).sort({ time: -1 }).skip(req.params.index * 15).limit(15).then(p => {
                resp.json({
                    code: 1000,
                    msg: 'success',
                    data: {
                        total,
                        list: p
                    }
                })
            }).catch(error => next(error))
        }
    })

})

/**
 * 修改微博
 */
weiboRouter.put('/:id', async (req, resp, next) => {
    let body = req.body
    let token = validateUser(req, resp)
    //重要：find()里匹配_id，必须转成ObjectId格式，并且是
    let wid = new mongoose.Types.ObjectId(req.params.id);
    let uid = new mongoose.Types.ObjectId(token.id);
    Weibo.findOneAndUpdate({ _id: wid, userId: uid }, { content: body.content })
        .then(p => {
            resp.json({
                code: 1000,
                msg: 'success',
                data: p
            })
        })
        .catch(error => {
            next(error)
        })
})


/** 
 * 通过ID查询
 */
weiboRouter.get('/:id', (req, resp, next) => {
    // const id = Number(req.params.id)   //默认传的是字符串
    // const article = contentlist.find(p => p.id === id)
    Weibo.findById(req.params.id)
        .then(p => {
            resp.json({
                code: 1000,
                msg: 'success',
                data: p
            })
        })
        .catch(err => {
            next(err)
        })
})

/** 
 * 通过ID删除
 */
weiboRouter.delete('/:id', (req, resp, next) => {
    validateUser(req, resp);

    const id = Number(req.params.id)
    // contentlist = contentlist.filter(p => p.id !== id)
    Weibo.findByIdAndDelete(req.params.id)
        .then(p => {
            resp.status(204).end()
        })
        .catch(error => next(error))
})

/*
* 增加单条数据
*/
weiboRouter.post('/', async (req, resp, next) => {
    let decodedToken = validateUser(req, resp);

    const user = await User.findById(decodedToken.id)
    const data = req.body
    // data.id = maxID + 1
    // contentlist.push(data)
    // contentlist = contentlist.concat(data)  //最佳实践 返回新数组
    const weibo = new Weibo({
        content: data.content,
        time: new Date(),
        auther: user.username,
        userId: user._id,
    })
    // resp.json(data) //一定要处理返回,不然停不下来
    weibo.save()
        .then(p => {
            console.log('saved weibo')
            user.weibos = user.weibos.concat(p._id)
            user.save()
            resp.json({
                code: 1000,
                msg: 'success',
                data: p
            })
        }).then(p => console.log('update weiboid in user'))
        .catch(error => {
            next(error) //异常必须要调用next,否则请求没人被处理
            //console.log('save error:', error.message)
        })
})

/**
 * 搜索内容
 */
weiboRouter.get('/search/:index/:s', async (req, resp, next) => {
    if(!req.params.s){
        resp.json({
            code: 1000,
            msg: 'success',
        })
    }
    let querystr = req.params.s.slice(0,100)
    Weibo.find({content: { $regex: '.*' + querystr + '.*' , $options: 'i'} }).count((err, count) => {
        if (err) {
            next(err)
        }
        else {
            let total = count
            Weibo.find({content: { $regex: '.*' + querystr + '.*' , $options: 'i'} }).sort({ time: -1 })/*.skip(req.params.index * 15).limit(15)*/.then(p => {
                resp.json({
                    code: 1000,
                    msg: 'success',
                    data: {
                        total,
                        list: p
                    }
                })
            }).catch(error => next(error))
        }
    })
})

/**
 * 检验权限
 * @param {w} req 
 * @param {*} resp 
 * @returns 
 */
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

module.exports = weiboRouter