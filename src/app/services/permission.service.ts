import { PermissionDTO } from '../DTOs/permission';
import { PermissionRepository } from '../repositories/permission.repository';
import { ApiError } from '../helpers/response-helper';

export const PermissionService = {
  getAll: async (): Promise<PermissionDTO[]> => {
    const permissions = await PermissionRepository.findAll();

    if (permissions.length === 0) {
      return [];
    }

    return permissions.map((P) => ({
      id: P.id,
      key: P.key,
      label: P.label,
      description: P.description,
      group: P.group,
    }));
  },

  getById: async (id: string): Promise<PermissionDTO> => {
    const permission = await PermissionRepository.findById(id);

    if (!permission) {
      throw new ApiError(404, 'Hak akses tidak ditemukan');
    }

    return {
      id: permission.id,
      key: permission.key,
      label: permission.label,
      description: permission.description,
      group: permission.group,
    };
  },
};
