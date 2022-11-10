import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import User from '../models/user';
import signJWT from '../functions/signJTW';
import user from '../interfaces/user';
import ldapAsyncAuthenticate from '../functions/ldap';
const NAMESPACE = 'User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    return res.status(200).json({
        message: 'Token(s) validated'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password, type, name, surname, doc, career } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
            });
        }

        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            type,
            name,
            surname,
            doc,
            career,
            password: hash
        });

        return _user
            .save()
            .then((user) => {
                return res.status(201).json({
                    user
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    message: error.message,
                    error
                });
            });
    });
};



const login = async (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    let loginState = await ldapAsyncAuthenticate(req.body)
    if(!loginState){
        console.log("No user in ldap")
        return res.status(401).json({
            message: 'User not found in LDAP',
        });
    } else {
    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                console.log("1")
                return res.status(401).json({
                    message: 'Unauthorized',
                });
            }

            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Password Mismatch',
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            return res.status(500).json({
                                message: _error.message,
                                error: _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                message: 'Auth successful',
                                token: token,
                                user: users[0]
                            });
                        }
                    });
                } else {
                    return res.status(401).json({
                        message: 'Password Mismatch',
                        token: '',
                        user: ''
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const getUsers = (req: Request, res: Response, next: NextFunction) => {
    const userList = req.body;
    //let userInfo: user[][] = []
    console.log(userList);
    const userIdList = userList.map((element: { StudentId: any; }) => { return element.StudentId })
    console.log(userIdList);
    User.find({
        '_id': { $in: userIdList}
    }, function(err, docs){
         console.log(docs);
    }).exec().then((users) => {
            return res.status(200).json(users);
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

export default { validateToken, register, login, getAllUsers, getUsers };
