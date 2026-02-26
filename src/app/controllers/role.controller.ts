import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../helpers/response-helper';
import { RoleService } from '../services/role.service';

export const getAllRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleService.getAll();
    successResponse(res, 'List role berhasil diambil', roles, 200);
  } catch (err) {
    next(err);
  }
};

export const getRoleByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const role = await RoleService.getById(id);
    successResponse(res, 'List role berhasil diambil', role, 200);
  } catch (err) {
    next(err);
  }
};
