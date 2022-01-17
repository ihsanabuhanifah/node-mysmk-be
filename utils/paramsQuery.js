function paramsQueryAND(params, name, string = true){
    if(params !== undefined){
        const value = string ? `${params}` : params
       return  `AND a.${name} = ` +  value
    }else {
        name = ""
    }
}

module.exports = {paramsQueryAND}