

async function guruAccessMiddleware(req, res, next){
    if(req.role !== "Guru"){
        return res.status(403).json({
            status : 'Fail',
            msg : 'Anda tidak dapat memiliki access sebagai guru'
        })
    }

   

    next()
}


module.exports = guruAccessMiddleware