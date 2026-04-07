interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  details?: unknown;
}

export class ApiRequestError extends Error {
  readonly statusCode?: number;
  readonly details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function parseApiError(response: Response): Promise<ApiRequestError> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return new ApiRequestError(
      payload.message ?? 'Request failed.',
      payload.statusCode ?? response.status,
      payload.details,
    );
  } catch {
    return new ApiRequestError(
      `Request failed with status ${response.status}.`,
      response.status,
    );
  }
}
