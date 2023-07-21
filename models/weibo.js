const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to mongodb')

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

const Weibo = mongoose.model('Weibo', weiboSchema)


weiboSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = Weibo