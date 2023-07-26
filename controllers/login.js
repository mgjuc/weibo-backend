const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const axios = require('axios');


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
      lastlogin: lastlogin,
      expire: user.lastlogin.getTime() + 60 * 60 * 1000
    }
  })
})

//api/login 从前端跳转到这里
loginRouter.get('/', async (req, resp) => {
  const code = req.query.code;
  let url = 'https://github.com/login/oauth/access_token?' +
    `client_id=${process.env.CLIENT_ID}&` +
    `client_secret=${process.env.CLIENT_SECRET}&` +
    `code=${code}`;

  console.log(url)

  let ret = await axios({
    timeout: 10000,
    method: 'post',
    url: url,
    headers: { Accept: 'application/json' },
  });

  // console.log('data', ret.data);

  let accessToken = ret.data.access_token;

  if (!accessToken) {
    return resp.status(200).send({
      code: 2000,
      msg: ret.data.error,
    });
  }

  // console.log('accessToken', accessToken);

  const user = await axios({
    timeout: 10000,
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Accept: 'application/json',
      Authorization: `token ${accessToken}`
    }
  });

  // console.log('github user date', user.data)

  return resp.status(200).send({
    code: 1000,
    msg: 'success',
    data: {
      token: accessToken,
      username: user.data.login,
      name: user.data.name,
      headUrl: user.data.avatar_url,
      lastlogin: '',
      expire: Date.now() + 60 * 60 * 1000
    }
  });
})


module.exports = loginRouter