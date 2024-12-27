import { ApiResponse } from "../models";

export const createApiResponse = <T>({
    data,
    statusCode,
    errorCode,
    message,
}: ApiResponse<T>): ApiResponse<T> => {
    return { data, message, errorCode, statusCode };
};