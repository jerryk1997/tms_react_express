export const catchAsyncErrors = function (func) {
  return (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);
};

export const handleServerError = (error, res) => {
  console.error(error);
  return res.status(500).json({
    error: "Internal server error"
  });
};
