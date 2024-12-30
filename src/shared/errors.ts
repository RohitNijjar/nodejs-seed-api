import { HTTP_STATUS } from './constants';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errorMessage?: string;

  constructor(
    message: string,
    errorCode: string,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorMessage?: string,
  ) {
    super(message);

    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errorMessage = errorMessage;
  }
}
