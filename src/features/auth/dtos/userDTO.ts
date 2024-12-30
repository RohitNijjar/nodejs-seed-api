export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  token?: string;
}
