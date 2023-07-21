
const unknownEndpoint = (req, resp) => {
    resp.status(404).send({ error: '网页不存在！' })
}

const reqdetail = (req, resp, nest) => {
    const time = new Date().toLocaleString()
    console.log(time, '=\>', req.method, req.path)
    nest()
}

const errorHandler = (error, request, response, next) => {
    console.log('errorHandler', error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'Id格式错误' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }
    next(error)
}

module.exports = {
    unknownEndpoint, reqdetail, errorHandler
}