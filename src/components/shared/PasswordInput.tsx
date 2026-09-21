import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** A password field with an accessible visibility toggle. */
export default function PasswordInput({ className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const action = visible ? 'Hide password' : 'Show password';

  return (
    <span className="relative block">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
        aria-label={action}
        aria-pressed={visible}
        title={action}
      >
        {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
      </button>
    </span>
  );
}
