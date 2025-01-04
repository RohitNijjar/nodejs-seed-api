export interface ResetPasswordRequest {
  token: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
