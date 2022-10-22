import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        type: { type: String, required: true },
        name: { type: String, required: true },
        surname: { type: String, required: true },
        doc: { type: String, required: true, unique: true  },
        career: { type: String, required: true, unique: true  }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IUser>('User', UserSchema);
