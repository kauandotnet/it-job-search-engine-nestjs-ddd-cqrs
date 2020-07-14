import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Response } from 'express';

import { AppError, BaseController } from 'shared/core';

import { DeleteRoleCommand } from '../impl';
import {
  DeleteRoleDto,
  DeleteRoleErrors,
  DeleteRoleUseCase,
} from '../../useCases/deleteRole';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler extends BaseController
  implements ICommandHandler<DeleteRoleCommand> {
  constructor(private deleteRoleUseCase: DeleteRoleUseCase) {
    super();
  }

  async execute(command: DeleteRoleCommand) {
    const { deleteRoleDto, res } = command;
    this.deleteRole(deleteRoleDto, res);
  }

  async deleteRole(deleteRoleDto: DeleteRoleDto, res: Response) {
    try {
      const result = await this.deleteRoleUseCase.execute(deleteRoleDto);

      if (result.isLeft()) {
        const error = result.value;

        Logger.error(error.errorValue());

        switch (error.constructor) {
          case AppError.ValidationError:
            return this.clientError(res, error.errorValue());
          case DeleteRoleErrors.RoleNotFoundError:
            return this.notFound(res, error.errorValue());
          default:
            return this.fail(res, error.errorValue());
        }
      }

      Logger.verbose('Role successfully deleted');
      return this.ok(res);
    } catch (err) {
      Logger.error(err);
      return this.fail(res, err);
    }
  }
}