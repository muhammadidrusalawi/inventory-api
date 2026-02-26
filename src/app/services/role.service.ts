import { RoleDTO } from '../DTOs/role';
import { RoleRepository } from '../repositories/role.repository';
import { ApiError } from '../helpers/response-helper';

export const RoleService = {
  getAll: async (): Promise<RoleDTO[]> => {
    const roles = await RoleRepository.findAll();

    if (roles.length === 0) {
      return [];
    }

    return roles.map((R) => ({
      id: R.id,
      key: R.key,
      label: R.label,
      description: R.description,
    }));
  },

  getById: async (id: string): Promise<RoleDTO> => {
    const role = await RoleRepository.findById(id);

    if (!role) {
      throw new ApiError(404, 'Role tidak ditemukan');
    }

    return {
      id: role.id,
      key: role.key,
      label: role.label,
      description: role.description,
    };
  },
};
