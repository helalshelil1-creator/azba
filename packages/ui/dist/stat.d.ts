import React from 'react';
export interface StatProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    trend?: {
        value: string;
        positive?: boolean;
    };
    hint?: string;
    className?: string;
}
export declare function Stat({ label, value, icon: Icon, trend, hint, className }: StatProps): React.JSX.Element;
