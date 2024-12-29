import { UserPayload } from "../../shared/models";
import { User } from "./models/userModel";

export const toUser = (email: string, password: string, firstName: string, lastName: string, isVerified: boolean): User => ({
    email,
    password,
    firstName,
    lastName,
    isVerified
});

export const toUserPayload = (userId: string, email: string, isVerified: boolean): UserPayload => ({
    userId,
    email,
    isVerified
});
