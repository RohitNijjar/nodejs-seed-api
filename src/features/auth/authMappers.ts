import { UserPayload } from "../../shared/models";
import { UserDTO } from "./dtos/userDto";
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

export const toUserDto = (user: User, token?: string): UserDTO => ({
    id: user.id ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isVerified: user.isVerified,
    token: token
});