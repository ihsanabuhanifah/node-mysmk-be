const { func } = require("joi");

function paramsQueryAND(params, column, string = true) {
  if (params === undefined) {
    let parameter = string ? `${params}` : parmas;
    return (Object.keys({ params })[0] = ` ${column} = ${parameter}`);
  } else {
    return (Object.keys({ params })[0] = "");
  }
}

function check(value){

  if(value !== undefined) return true
  if(value !== 'undefined') return true
  if(value !== null) return true
  if(value !== '') return true
  return false

}
module.exports = {paramsQueryAND, check};




