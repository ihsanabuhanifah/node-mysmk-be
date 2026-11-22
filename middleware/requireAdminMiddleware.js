// Dipakai setelah jwtValidateMiddleware (butuh req.allRole)
const ADMIN_ROLES = ["Admin", "Super Administrator"];

const requireAdminMiddleware = (req, res, next) => {
  const roles = Array.isArray(req.allRole) ? req.allRole : [req.role];
  const allowed = roles.some((r) => ADMIN_ROLES.includes(r));
  if (!allowed) {
    return res.status(403).json({
      status: "fail",
      msg: "Hanya Admin yang dapat mengakses fitur ini",
    });
  }
  next();
};

module.exports = requireAdminMiddleware;
