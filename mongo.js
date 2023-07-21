/**
 * mongoose的测试程序
 */

const mongoose = require('mongoose')

const url = "mongodb://root:root@localhost:27017/?authSource=admin"

mongoose.connect(url)

const weiboSchema = new mongoose.Schema({
    content: String,
    time: Date,
    auther: String,
})

const Weibo = mongoose.model('Weibo', weiboSchema)

const weibo = new Weibo({
    content: 'mongoose test',
    time: new Date(),
    auther: '果酱',
})

// weibo.save().then(result => {
//     console.log('weibo saved!')
//     mongoose.connection.close()
// })

Weibo.find({}).then(result => {
    result.forEach(p => {
        console.log(p)
    })
    mongoose.connection.close()
})