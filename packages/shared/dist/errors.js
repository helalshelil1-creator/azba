"use strict";
// ============================================
// Error codes & business errors
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ERROR_CODES = void 0;
exports.isAppError = isAppError;
exports.ERROR_CODES = {
    // Auth
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    // Investment
    INSUFFICIENT_SHARES: 'INSUFFICIENT_SHARES',
    PROJECT_NOT_FUNDING: 'PROJECT_NOT_FUNDING',
    RESERVATION_EXPIRED: 'RESERVATION_EXPIRED',
    RESERVATION_NOT_FOUND: 'RESERVATION_NOT_FOUND',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_ALREADY_CONFIRMED: 'PAYMENT_ALREADY_CONFIRMED',
    INVESTMENT_NOT_FOUND: 'INVESTMENT_NOT_FOUND',
    INSUFFICIENT_WALLET_BALANCE: 'INSUFFICIENT_WALLET_BALANCE',
    WITHDRAWAL_LIMIT_EXCEEDED: 'WITHDRAWAL_LIMIT_EXCEEDED',
    // Financial
    UNAUTHORIZED_TRANSACTION: 'UNAUTHORIZED_TRANSACTION',
    APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
    ACCOUNTING_IMBALANCE: 'ACCOUNTING_IMBALANCE',
    // Farm
    ANIMAL_NOT_FOUND: 'ANIMAL_NOT_FOUND',
    PEN_CAPACITY_EXCEEDED: 'PEN_CAPACITY_EXCEEDED',
    FARM_INACTIVE: 'FARM_INACTIVE',
    // System
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    MAINTENANCE_MODE: 'MAINTENANCE_MODE',
};
class AppError extends Error {
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.AppError = AppError;
function isAppError(err) {
    return err instanceof AppError;
}
