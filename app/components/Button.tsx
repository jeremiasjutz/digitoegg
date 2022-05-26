import { forwardRef } from 'react';

import type { ButtonHTMLAttributes, ForwardedRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  secondary?: boolean;
}

const Button = forwardRef(
  (
    { children, className, secondary = false, ...rest }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={`flex w-full justify-center rounded-lg ${
          secondary
            ? 'border border-gray bg-gray/20 text-white backdrop-blur-md'
            : 'bg-primary text-black'
        } py-3 font-medium outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
