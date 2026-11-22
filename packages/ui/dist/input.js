"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = exports.Textarea = exports.Input = void 0;
exports.Label = Label;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const utils_1 = require("./utils");
exports.Input = (0, react_1.forwardRef)(({ className, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("input", { id: inputId, ref: ref, className: (0, utils_1.cn)('input-field', error && 'border-destructive focus:border-destructive focus:ring-destructive/20', className), "aria-invalid": !!error, ...props }), hint && !error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1.5 text-xs text-muted-foreground", children: hint }), error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1.5 text-xs text-destructive", children: error })] }));
});
exports.Input.displayName = 'Input';
exports.Textarea = (0, react_1.forwardRef)(({ className, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("textarea", { id: inputId, ref: ref, className: (0, utils_1.cn)('input-field min-h-[100px] resize-y', error && 'border-destructive focus:border-destructive focus:ring-destructive/20', className), "aria-invalid": !!error, ...props }), hint && !error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1.5 text-xs text-muted-foreground", children: hint }), error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1.5 text-xs text-destructive", children: error })] }));
});
exports.Textarea.displayName = 'Textarea';
function Label({ className, required, children, ...props }) {
    return ((0, jsx_runtime_1.jsxs)("label", { className: (0, utils_1.cn)('label', className), ...props, children: [children, required && (0, jsx_runtime_1.jsx)("span", { className: "mr-1 text-destructive", children: "*" })] }));
}
exports.Select = (0, react_1.forwardRef)(({ className, options, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("select", { id: inputId, ref: ref, className: (0, utils_1.cn)('input-field appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[left_0.75rem_center] bg-no-repeat pl-10', error && 'border-destructive focus:border-destructive focus:ring-destructive/20', className), "aria-invalid": !!error, ...props, children: options.map((o) => ((0, jsx_runtime_1.jsx)("option", { value: o.value, children: o.label }, o.value))) }), error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1.5 text-xs text-destructive", children: error })] }));
});
exports.Select.displayName = 'Select';
