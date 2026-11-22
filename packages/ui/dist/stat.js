"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stat = Stat;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("./utils");
function Stat({ label, value, icon: Icon, trend, hint, className }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)('card', className), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-muted-foreground", children: label }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-2xl font-bold text-primary sm:text-3xl", children: value })] }), Icon && ((0, jsx_runtime_1.jsx)("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary", children: (0, jsx_runtime_1.jsx)(Icon, { className: "h-5 w-5" }) }))] }), (trend || hint) && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex items-center gap-2 text-xs", children: [trend && ((0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold', trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'), children: trend.value })), hint && (0, jsx_runtime_1.jsx)("span", { className: "text-muted-foreground", children: hint })] }))] }));
}
