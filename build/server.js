"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_1 = __importDefault(require("express"));
var logging_1 = __importDefault(require("./config/logging"));
var config_1 = __importDefault(require("./config/config"));
var user_1 = __importDefault(require("./routes/user"));
var mongoose_1 = __importDefault(require("mongoose"));
var NAMESPACE = 'Server';
var router = (0, express_1.default)();
var httpServer = http_1.default.createServer(router);
httpServer.listen(config_1.default.server.port, function () { return logging_1.default.info(NAMESPACE, "Server is running ".concat(config_1.default.server.hostname, ":").concat(config_1.default.server.port)); });
/** Connect to Mongo */
mongoose_1.default
    .connect(config_1.default.mongo.url, config_1.default.mongo.options)
    .then(function (result) {
    logging_1.default.info(NAMESPACE, 'Mongo Connected');
})
    .catch(function (error) {
    logging_1.default.error(NAMESPACE, error.message, error);
});
/** Log the request */
router.use(function (req, res, next) {
    /** Log the req */
    logging_1.default.info(NAMESPACE, "METHOD: [".concat(req.method, "] - URL: [").concat(req.url, "] - IP: [").concat(req.socket.remoteAddress, "]"));
    res.on('finish', function () {
        /** Log the res */
        logging_1.default.info(NAMESPACE, "METHOD: [".concat(req.method, "] - URL: [").concat(req.url, "] - STATUS: [").concat(res.statusCode, "] - IP: [").concat(req.socket.remoteAddress, "]"));
    });
    next();
});
/** Parse the body of the request */
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.use(body_parser_1.default.json());
var cors = require('cors');
router.use(cors({
    origin: '*'
}));
/** Routes go here */
router.use('/users', user_1.default);
/** Error handling */
router.use(function (req, res, next) {
    var error = new Error('Not found');
    res.status(404).json({
        message: error.message
    });
});
