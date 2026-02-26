import { NextFunction, Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { successResponse } from '../helpers/response-helper';

export const getAllPermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await PermissionService.getAll();
    successResponse(res, 'List hak akses berhasil diambil', permissions, 200);
  } catch (err) {
    next(err);
  }
};

export const getPermissionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const permission = await PermissionService.getById(id);
    successResponse(res, 'List hak akses berhasil diambil', permission, 200);
  } catch (err) {
    next(err);
  }
};
