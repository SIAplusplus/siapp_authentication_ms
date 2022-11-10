"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var logging_1 = __importDefault(require("../config/logging"));
var user_1 = __importDefault(require("../models/user"));
var signJTW_1 = __importDefault(require("../functions/signJTW"));
var ldap_1 = __importDefault(require("../functions/ldap"));
var NAMESPACE = 'User';
var validateToken = function (req, res, next) {
    logging_1.default.info(NAMESPACE, 'Token validated, user authorized.');
    return res.status(200).json({
        message: 'Token(s) validated'
    });
};
var register = function (req, res, next) {
    var _a = req.body, username = _a.username, password = _a.password, type = _a.type, name = _a.name, surname = _a.surname, doc = _a.doc, career = _a.career;
    bcryptjs_1.default.hash(password, 10, function (hashError, hash) {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
            });
        }
        var _user = new user_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            username: username,
            type: type,
            name: name,
            surname: surname,
            doc: doc,
            career: career,
            password: hash
        });
        return _user
            .save()
            .then(function (user) {
            return res.status(201).json({
                user: user
            });
        })
            .catch(function (error) {
            return res.status(500).json({
                message: error.message,
                error: error
            });
        });
    });
};
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, loginState;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, (0, ldap_1.default)(req.body)];
            case 1:
                loginState = _b.sent();
                if (!loginState) {
                    console.log("No user in ldap");
                    return [2 /*return*/, res.status(401).json({
                            message: 'User not found in LDAP',
                        })];
                }
                else {
                    user_1.default.find({ username: username })
                        .exec()
                        .then(function (users) {
                        if (users.length !== 1) {
                            console.log("1");
                            return res.status(401).json({
                                message: 'Unauthorized',
                            });
                        }
                        bcryptjs_1.default.compare(password, users[0].password, function (error, result) {
                            if (error) {
                                return res.status(401).json({
                                    message: 'Password Mismatch',
                                });
                            }
                            else if (result) {
                                (0, signJTW_1.default)(users[0], function (_error, token) {
                                    if (_error) {
                                        return res.status(500).json({
                                            message: _error.message,
                                            error: _error
                                        });
                                    }
                                    else if (token) {
                                        return res.status(200).json({
                                            message: 'Auth successful',
                                            token: token,
                                            user: users[0]
                                        });
                                    }
                                });
                            }
                            else {
                                return res.status(401).json({
                                    message: 'Password Mismatch',
                                    token: '',
                                    user: ''
                                });
                            }
                        });
                    })
                        .catch(function (err) {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
                return [2 /*return*/];
        }
    });
}); };
var getAllUsers = function (req, res, next) {
    user_1.default.find()
        .select('-password')
        .exec()
        .then(function (users) {
        return res.status(200).json({
            users: users,
            count: users.length
        });
    })
        .catch(function (error) {
        return res.status(500).json({
            message: error.message,
            error: error
        });
    });
};
var getUsers = function (req, res, next) {
    var userList = req.body;
    //let userInfo: user[][] = []
    console.log(userList);
    var userIdList = userList.map(function (element) { return element.StudentId; });
    console.log(userIdList);
    user_1.default.find({
        '_id': { $in: userIdList }
    }, function (err, docs) {
        console.log(docs);
    }).exec().then(function (users) {
        return res.status(200).json(users);
    })
        .catch(function (error) {
        return res.status(500).json({
            message: error.message,
            error: error
        });
    });
};
exports.default = { validateToken: validateToken, register: register, login: login, getAllUsers: getAllUsers, getUsers: getUsers };
