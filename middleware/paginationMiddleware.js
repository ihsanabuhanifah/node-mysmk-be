const paginationMiddleware = (req, res, next) => {
    let pageSize = parseFloat(req.query.pageSize);
    let page = parseFloat(req.query.page);
    let pageFromFE = parseFloat(req.query.page);
  
    if (isNaN(pageSize) && isNaN(page)) return next();
    if (isNaN(page)) {
      page = 0;
      pageFromFE = 1;
    } else {
      page = (page - 1) * pageSize;
      pageFromFE = 1;
    }

    
  
    req.query.page = page;
    req.query.pageSize = pageSize;
    req.page = pageFromFE;
    next();
  };
  
  module.exports = paginationMiddleware;