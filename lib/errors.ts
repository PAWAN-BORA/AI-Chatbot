
export const ERROR_STATUS_CODE_MAP: Record<string, number> = {
  UnauthorizedError: 401,
  ValidationError: 400,
  DatabaseError: 500,
  // Add more mappings
} as const

export class UnauthorizedError extends Error {
  constructor(message:string="Unauthorized"){
    super(message);
    this.name = "UnauthorizedError";
  }
}
export class ValidationError extends Error {
  constructor(message:string="validation error"){
    super(message);
    this.name = "ValidationError";
  }
}
export class DatabaseError extends Error {
  constructor(message:string="Database Error"){
    super(message);
    this.name = "DatabaseError";
  }
}
