import React from 'react';
/**
 * شعار AZBA | عزبة الرسمي.
 * الأصل مرسوم من ملف الهوية الرسمي: `public/logo.webp` (رمز + AZBA + عزبة)
 * و`public/icon.png` (الرمز وحده للأيقونة وال favicon).
 * الخلفية شفافة، لذا يظهر الذهب على أي خلفية.
 */
export interface LogoProps {
    className?: string;
    size?: number;
    variant?: 'color' | 'monochrome' | 'light' | 'dark';
    showText?: boolean;
    lang?: 'ar' | 'en';
}
export declare function Logo({ className, size, showText }: LogoProps): React.JSX.Element;
export declare function LogoIcon({ size, className }: {
    size?: number;
    className?: string;
}): React.JSX.Element;
/**
 * أيقونة التطبيق: مربع بزوايا مستديرة على خلفية سوداء مع الرمز الذهبي.
 */
export declare function AppIcon({ size, className }: {
    size?: number;
    className?: string;
}): React.JSX.Element;
export default Logo;
