export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User authentication required before checking role permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Permitted role(s): [${allowedRoles.join(', ')}]. Your authenticated role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

export default roleMiddleware;
