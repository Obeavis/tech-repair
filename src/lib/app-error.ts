export type AppErrorStatus = 401 | 403 | 404 | 422;

export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  readonly status: AppErrorStatus;
  readonly fields: FieldErrors | undefined;

  constructor(status: AppErrorStatus, message: string, fields?: FieldErrors) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.fields = fields;
  }
}
