"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
exports.CardHeader = CardHeader;
exports.CardTitle = CardTitle;
exports.CardDescription = CardDescription;
exports.CardContent = CardContent;
exports.CardFooter = CardFooter;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("./utils");
function Card({ className, ...props }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)('rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300', className), ...props }));
}
function CardHeader({ className, ...props }) {
    return (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)('flex flex-col gap-1.5 pb-4', className), ...props });
}
function CardTitle({ className, ...props }) {
    return (0, jsx_runtime_1.jsx)("h3", { className: (0, utils_1.cn)('text-lg font-bold text-primary', className), ...props });
}
function CardDescription({ className, ...props }) {
    return (0, jsx_runtime_1.jsx)("p", { className: (0, utils_1.cn)('text-sm text-muted-foreground', className), ...props });
}
function CardContent({ className, ...props }) {
    return (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)('pt-0', className), ...props });
}
function CardFooter({ className, ...props }) {
    return (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)('flex items-center gap-3 pt-4', className), ...props });
}
