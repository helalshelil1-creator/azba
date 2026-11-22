"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeVariants = void 0;
exports.Badge = Badge;
const jsx_runtime_1 = require("react/jsx-runtime");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("./utils");
const badgeVariants = (0, class_variance_authority_1.cva)('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors', {
    variants: {
        variant: {
            default: 'border-primary/20 bg-primary/5 text-primary',
            gold: 'border-gold/30 bg-gold/10 text-gold-700',
            success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            warning: 'border-amber-200 bg-amber-50 text-amber-700',
            danger: 'border-red-200 bg-red-50 text-red-700',
            info: 'border-blue-200 bg-blue-50 text-blue-700',
            outline: 'border-border text-muted-foreground',
            ghost: 'border-transparent bg-transparent',
        },
    },
    defaultVariants: { variant: 'default' },
});
exports.badgeVariants = badgeVariants;
function Badge({ className, variant, ...props }) {
    return (0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)(badgeVariants({ variant }), className), ...props });
}
