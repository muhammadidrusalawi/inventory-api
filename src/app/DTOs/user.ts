import { RoleDTO } from './role';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

export interface UserWithStoreDTO {
  id: string;
  email: string;
  name: string;
  stores: {
    id: string;
    name: string;
    plan: string;
    role: {
      id: string;
      key: string;
      label: string;
    };
  }[];
}

export interface StoreUserDTO {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: RoleDTO;
}
