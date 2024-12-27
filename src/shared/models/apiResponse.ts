export type ApiResponse<T> = {
    data?: T;
    statusCode: number;
} & errorResponse;

export type errorResponse = {
    errorCode?: string;
    message?: string;
}