import { forwardRef } from 'react';

import type { ForwardedRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: JSX.Element;
  transparent?: boolean;
}

const Input = forwardRef(
  (
    { error, placeholder, icon, transparent = false, ...rest }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <label className="flex flex-col">
        <div className="relative flex items-center">
          <input
            {...rest}
            ref={ref}
            placeholder={placeholder}
            className={`peer w-full rounded-lg ${
              transparent
                ? 'bg-transparent'
                : 'border border-gray bg-gray/20 backdrop-blur-md'
            } pb-2 pt-4 pl-4 pr-12 text-base placeholder-transparent outline-none ring-2 ring-transparent transition ${
              !error
                ? transparent
                  ? ''
                  : 'focus:border-primary focus:ring-primary/30'
                : 'border-error ring-error/30'
            }`}
          />
          <span className="absolute left-4 z-10 origin-left -translate-y-3 scale-50 text-white/70 transition-transform peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-50">
            {placeholder}
          </span>
          {icon ? <div className="absolute right-4">{icon}</div> : null}
        </div>
        <div
          className={`origin-top transition-all ${
            error ? 'mt-1 h-auto' : 'h-0'
          }`}
        >
          <span className="block text-xs text-error transition-all">
            {error ?? ''}
          </span>
        </div>
      </label>
    );
  }
);

Input.displayName = 'Input';

export default Input;
