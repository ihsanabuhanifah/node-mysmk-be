

async function guruAccessMiddleware(req, res, next){
    if(req.role !== "Wali Santri"){
        return res.status(403).json({
            status : 'Fail',
            msg : 'Anda tidak dapat memiliki access sebagai Wali Santri'
        })
    }

   

    next()
}


module.exports = guruAccessMiddleware