"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = Logo;
exports.LogoIcon = LogoIcon;
exports.AppIcon = AppIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("./utils");
function Logo({ className, size = 48, showText = true }) {
    const src = showText ? '/logo.png' : '/icon.png';
    return (
    // eslint-disable-next-line @next/next/no-img-element
    (0, jsx_runtime_1.jsx)("img", { src: src, alt: "AZBA | \u0639\u0632\u0628\u0629", width: size, height: size, style: { height: size, width: 'auto' }, className: (0, utils_1.cn)('inline-block select-none', className), draggable: false }));
}
function LogoIcon({ size = 40, className }) {
    return (
    // eslint-disable-next-line @next/next/no-img-element
    (0, jsx_runtime_1.jsx)("img", { src: "/icon.png", alt: "", width: size, height: size, style: { width: size, height: size }, className: (0, utils_1.cn)('inline-block select-none', className), draggable: false }));
}
/**
 * أيقونة التطبيق: مربع بزوايا مستديرة على خلفية سوداء مع الرمز الذهبي.
 */
function AppIcon({ size = 64, className }) {
    return ((0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)('inline-flex items-center justify-center rounded-[22%] shadow-xl', className), style: {
            width: size,
            height: size,
            background: 'linear-gradient(160deg, #0A0A0A 0%, #000000 100%)',
            padding: size * 0.14,
        }, children: (0, jsx_runtime_1.jsx)("img", { src: "/icon.png", alt: "AZBA", width: size * 0.72, height: size * 0.72, style: { width: size * 0.72, height: size * 0.72 }, className: "block", draggable: false }) }));
}
exports.default = Logo;
