
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;


  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }


  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    return res.status(400).json({ success: false, message: error.message });
  }


  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }


  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }


  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
