const mongoose = require('mongoose')

//开发时在.env文件，发布在docker定义环境变量
const url = process.env.MONGODB_URI

console.log('connecting to mongodb:', url)

/**
 * 建立数据库连接
 */
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    },
    reject => {
        console.log('rejected: filed to connect MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

/**
 * 定义数据库表结构 schema
 */
const weiboSchema = new mongoose.Schema({
    //content: String,
    content: {
        type: String,
        required: true,
    },
    time: Date,
    auther: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' //引用User表
    }
})

/**
 * 自定义Json解析
 */
weiboSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

/**
 * 绑定模型
 */
const Weibo = mongoose.model('Weibo', weiboSchema)




module.exports = Weibo