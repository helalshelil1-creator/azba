import React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    hint?: string;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    hint?: string;
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}
export declare function Label({ className, required, children, ...props }: LabelProps): React.JSX.Element;
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: {
        value: string;
        label: string;
    }[];
    error?: string;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
