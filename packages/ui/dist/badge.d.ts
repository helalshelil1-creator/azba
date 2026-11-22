import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const badgeVariants: (props?: ({
    variant?: "default" | "gold" | "success" | "warning" | "danger" | "info" | "outline" | "ghost" | null | undefined;
} & import("class-variance-authority/dist/types").ClassProp) | undefined) => string;
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
export declare function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;
export { badgeVariants };
