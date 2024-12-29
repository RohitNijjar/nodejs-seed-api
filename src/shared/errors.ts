import { HTTP_STATUS } from "./constants";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;

    constructor(message: string, errorCode: string, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);

        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}