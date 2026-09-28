import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <input ref={ref} id={inputId} className={cn('input', error && 'border-danger', className)} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
      {error ? <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="caption mt-1">{hint}</p> : null}
    </div>
  );
});
Input.displayName = 'Input';
