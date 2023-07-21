const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true  
    },
    name: String,
    passwordHash: String,
    weibos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Weibo'
        }
    ],
})

// userSchema.plugin(uniqueValidator)    //mongoose数据校验插件

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = document._id.toString(),
        delete returnedObject._id,
        delete returnedObject.__v,
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User
