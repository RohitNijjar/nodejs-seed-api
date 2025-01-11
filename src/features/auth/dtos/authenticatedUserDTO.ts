import { UserDTO } from '.';

export interface AuthenticatedUserDTO {
  user: UserDTO;
  refreshToken: string;
}
