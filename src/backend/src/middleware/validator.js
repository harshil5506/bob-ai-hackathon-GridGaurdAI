function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Missing required fields: ${missing.join(', ')}`,
          status: 400,
        },
      });
    }
    next();
  };
}

module.exports = { validateBody };