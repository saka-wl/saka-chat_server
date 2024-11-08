const allowOrigins = [
    "http://127.0.0.1:5173", "http://localhost:5173",
    "http://127.0.0.1:5174", "http://localhost:5174",
    "http://localhost:9527", "http://127.0.0.1:9527",
    "http://localhost:8000", "http://127.0.0.1:8000",
];

// 导出中间件
module.exports = function (req, res, next) {
    if ("origin" in req.headers) {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    }
    if (req.method === "OPTIONS" && allowOrigins.includes(req.headers.origin)) {
        req.headers["access-control-request-method"] &&
            res.setHeader(
                "Access-Control-Allow-Methods",
                req.headers["access-control-request-method"]
            );
        req.headers["access-control-request-headers"] &&
            res.setHeader(
                "Access-Control-Allow-Headers",
                req.headers["access-control-request-headers"]
            );
    }
    if(allowOrigins.includes(req.headers.origin)) {
        res.setHeader("Access-Control-Allow-Credentials", true);
    }
    next();
};
