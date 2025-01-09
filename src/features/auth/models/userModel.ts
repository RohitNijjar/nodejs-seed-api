import mongoose, { Document, Schema } from 'mongoose';

import { authProvider } from '../constants';

export interface User {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  provider: authProvider;
  isVerified: boolean;
}

const UserSchema: Schema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === 'email';
      },
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: 'email',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const UserModel = mongoose.model<User & Document>('User', UserSchema);
export { UserModel };
