export type AppErrorStatus = 401 | 403 | 404 | 422;

export class AppError extends Error {
  readonly status: AppErrorStatus;

  constructor(status: AppErrorStatus, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
