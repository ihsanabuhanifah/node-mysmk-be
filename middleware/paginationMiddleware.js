const paginationMiddleware = (req, res, next) => {
    let pageSize = parseFloat(req.query.pageSize);
    let page = parseFloat(req.query.page);
  
    if (isNaN(pageSize) && isNaN(page)) return next();
    if (isNaN(page)) {
      page = 0;
    } else {
      page = (page - 1) * pageSize;
    }
  
    req.query.page = page;
    req.query.pageSize = pageSize;
    next();
  };
  
  module.exports = paginationMiddleware;