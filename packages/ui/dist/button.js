"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonVariants = exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const class_variance_authority_1 = require("class-variance-authority");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
const buttonVariants = (0, class_variance_authority_1.cva)('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
    variants: {
        variant: {
            primary: 'bg-primary text-ivory shadow-lg shadow-primary/20 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
            gold: 'bg-gold text-primary-900 shadow-lg shadow-gold/30 hover:bg-gold-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
            outline: 'border-2 border-primary/20 bg-transparent text-primary hover:border-gold hover:text-gold-600 hover:-translate-y-0.5 active:translate-y-0',
            ghost: 'text-primary hover:bg-primary/5',
            destructive: 'bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-red-700',
            link: 'text-gold-600 underline-offset-4 hover:underline',
        },
        size: {
            default: 'h-11 px-6 py-2',
            sm: 'h-9 px-4 text-xs',
            lg: 'h-12 px-8 text-base',
            xl: 'h-14 px-10 text-lg',
            icon: 'h-11 w-11',
        },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
});
exports.buttonVariants = buttonVariants;
exports.Button = (0, react_1.forwardRef)(({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return ((0, jsx_runtime_1.jsxs)("button", { className: (0, utils_1.cn)(buttonVariants({ variant, size, className })), ref: ref, disabled: disabled || loading, ...props, children: [loading && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin" }), children] }));
});
exports.Button.displayName = 'Button';
