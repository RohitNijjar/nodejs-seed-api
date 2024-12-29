import mongoose, { Document, Schema } from "mongoose";

export interface User {
    id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
}

const UserSchema: Schema = new Schema<User>({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});

const UserModel = mongoose.model<User & Document>('User', UserSchema);
export default UserModel;