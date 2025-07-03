export const isAuthenticated = (err, req, res, next) => {
  const userId = req.session.passport.user;
  if (userId) {
    next();
  } else {
    res.status(401).json({ msg: "Unauthorized" });
  }
};
