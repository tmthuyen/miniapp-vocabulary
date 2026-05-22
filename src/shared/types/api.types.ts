export type ApiErrorBody = { code: string; message: string; errors: string[] };

export type ApiOkBody<T> = {
  code: 'ok';
  data: T;
  message: string;
};
