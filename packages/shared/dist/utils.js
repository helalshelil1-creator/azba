"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.dateSchema = exports.decimalSchema = exports.uuidSchema = exports.phoneSchema = exports.passwordSchema = exports.emailSchema = void 0;
exports.roundMoney = roundMoney;
exports.formatMoney = formatMoney;
exports.formatNumber = formatNumber;
exports.formatPercent = formatPercent;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.daysBetween = daysBetween;
exports.monthsBetween = monthsBetween;
exports.addDays = addDays;
exports.addMonths = addMonths;
exports.generateCode = generateCode;
exports.generateNumericCode = generateNumericCode;
exports.sanitizeString = sanitizeString;
exports.maskEmail = maskEmail;
exports.maskPhone = maskPhone;
exports.groupBy = groupBy;
exports.sum = sum;
exports.average = average;
exports.sleep = sleep;
exports.retry = retry;
exports.slugify = slugify;
exports.isValidUrl = isValidUrl;
const zod_1 = require("zod");
// ---------- Validation schemas ----------
exports.emailSchema = zod_1.z.string().email().max(255).trim().toLowerCase();
exports.passwordSchema = zod_1.z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number');
exports.phoneSchema = zod_1.z.string().regex(/^(\+?2)?01[0-9]{9}$/, 'Invalid Egyptian phone number');
exports.uuidSchema = zod_1.z.string().uuid();
exports.decimalSchema = zod_1.z.number().or(zod_1.z.string());
exports.dateSchema = zod_1.z.string().datetime().or(zod_1.z.date());
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().max(200).optional(),
});
// ---------- Money ----------
function roundMoney(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}
function formatMoney(value, currency = 'EGP', locale = 'ar-EG') {
    const symbols = { EGP: 'ج.م', USD: '$', SAR: 'ر.س' };
    const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
    return locale.startsWith('ar') ? `${formatted} ${symbols[currency] || currency}` : `${formatted} ${currency}`;
}
function formatNumber(value, locale = 'ar-EG') {
    return new Intl.NumberFormat(locale).format(value);
}
function formatPercent(value, locale = 'ar-EG') {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value) + '٪';
}
function formatDate(date, locale = 'ar-EG') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}
function formatDateTime(date, locale = 'ar-EG') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(d);
}
// ---------- Dates ----------
function daysBetween(a, b) {
    return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
function monthsBetween(a, b) {
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
// ---------- IDs & codes ----------
function generateCode(prefix, length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++)
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}-${result}`;
}
function generateNumericCode(length = 10) {
    let result = '';
    for (let i = 0; i < length; i++)
        result += Math.floor(Math.random() * 10);
    return result;
}
// ---------- Security ----------
function sanitizeString(input) {
    return input.replace(/[<>]/g, '').trim();
}
function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!domain)
        return email;
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
}
function maskPhone(phone) {
    if (phone.length < 6)
        return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
}
// ---------- Arrays ----------
function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        const k = String(item[key]);
        acc[k] = acc[k] || [];
        acc[k].push(item);
        return acc;
    }, {});
}
function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
function average(arr) {
    if (arr.length === 0)
        return 0;
    return sum(arr) / arr.length;
}
// ---------- Async ----------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function retry(fn, attempts = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch (e) {
            lastError = e;
        }
        if (i < attempts - 1)
            await sleep(delay * Math.pow(2, i));
    }
    throw lastError;
}
// ---------- URLs ----------
function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
