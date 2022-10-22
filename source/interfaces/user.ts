import { Document } from 'mongoose';

export default interface IUser extends Document {
    username: string;
    password: string;
    type: string;
    name: string;
    surname: string;
    doc: String;
    career: String;
}
