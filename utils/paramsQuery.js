function paramsQueryAND(params, column, string = true) {
  if (params === undefined) {
    let parameter = string ? `${params}` : parmas;
    return (Object.keys({ params })[0] = `AND ${column} = ${parameter}`);
  } else {
    return (Object.keys({ params })[0] = "");
  }
}
module.exports = {paramsQueryAND};
