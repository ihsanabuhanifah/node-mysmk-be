const parentModel = require("../../models").Parent;
const profile = async (req, res)=> {
    res.json({
        status : "ok"
    })
}

const create = async (req, res) => {
    try{

    }catch (err){
        return res.status(403).json({
            status : 'fail',
            msg : 'Ada Kesalaan'
        })
    }
}

module.exports = { profile , create};