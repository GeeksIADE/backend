const errorMiddleware = (err, req, res, next) => {
    console.log("Err: " + err.message)
    const statusCode = err.status || 500;
    const errorCode = err.code || 'E012';
    const message = err.message || err.details || 'Internal Server Error';

    res.status(statusCode).json({
        errorCode: errorCode,
        message: message,
        timestamp: Date.now()
    });
};

module.exports = { errorMiddleware };
