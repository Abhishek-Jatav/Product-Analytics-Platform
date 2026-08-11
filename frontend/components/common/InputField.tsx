import { forwardRef, type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, id, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-small font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>

        <input ref={ref} id={id} className="input-field" {...rest} />

        {error && <span className="text-caption text-danger">{error}</span>}
      </div>
    );
  },
);

InputField.displayName = "InputField";
