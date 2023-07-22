
/**
 * 404
 * @param {} req 
 * @param {*} resp 
 */
const unknownEndpoint = (req, resp) => {
    resp.status(404).send({
        code: 200,
        msg: '网页不存在！' 
    })
}

/**
 * 记录请求详情
 * @param {*} req 
 * @param {*} resp 
 * @param {*} nest 
 */
const reqdetail = (req, resp, nest) => {
    const time = new Date().toLocaleString()
    console.log(time, '=\>', req.method, req.path)
    nest()
}

/**
 * 全局异常处理
 * @param {*} error 
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 * @returns 
 */
const errorHandler = (error, request, response, next) => {
    console.log('errorHandler', error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({
            code: 2000,
            msg: 'Id格式错误' 
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            code: 2000,
            msg: 'invalid token'
        })
    }
    next(error)
}

module.exports = {
    unknownEndpoint, reqdetail, errorHandler
}