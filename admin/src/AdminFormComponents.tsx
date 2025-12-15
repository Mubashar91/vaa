import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Reusable form components for admin panels
 * Provides consistent styling and behavior across all admin forms
 */

interface SectionCardProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: React.ElementType;
  description?: string;
}

export const SectionCard = ({ title, isOpen, onToggle, children, icon: Icon, description }: SectionCardProps) => (
  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 shadow-xl hover:border-gold/30 transition-all duration-300">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-4 group"
      type="button"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gold" />}
        <div className="text-left">
          <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{title}</h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-gold transition-colors" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-gold transition-colors" />
      )}
    </button>
    {isOpen && <div className="space-y-3.5">{children}</div>}
  </div>
);

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({ label, required, error, helpText, children, className = '' }: FormFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-semibold text-slate-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
    {helpText && !error && (
      <p className="text-xs text-slate-500">{helpText}</p>
    )}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AdminInput = ({ error, className = '', ...props }: InputProps) => (
  <input
    className={`w-full px-3.5 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
      error
        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
        : 'border-slate-700/60 focus:ring-gold/50 focus:border-gold/50'
    } ${className}`}
    {...props}
  />
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const AdminTextarea = ({ error, className = '', ...props }: TextareaProps) => (
  <textarea
    className={`w-full px-3.5 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-y min-h-[72px] ${
      error
        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
        : 'border-slate-700/60 focus:ring-gold/50 focus:border-gold/50'
    } ${className}`}
    {...props}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const AdminSelect = ({ error, className = '', children, ...props }: SelectProps) => (
  <select
    className={`w-full px-3.5 py-2.5 bg-slate-900/60 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
      error
        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
        : 'border-slate-700/60 focus:ring-gold/50 focus:border-gold/50'
    } ${className}`}
    {...props}
  >
    {children}
  </select>
);

interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  icon?: React.ElementType;
}

export const StatusBadge = ({ type, children, icon: Icon }: StatusBadgeProps) => {
  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${styles[type]}`}>
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
};

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton = ({ variant = 'primary', loading, icon: Icon, size = 'md', children, className = '', disabled, ...props }: ActionButtonProps) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  };
  
  const baseStyles = `flex items-center font-semibold transition-all disabled:cursor-not-allowed ${sizeStyles[size]}`;
  
  const variants = {
    primary: 'bg-gradient-to-r from-gold to-yellow-500 hover:from-gold/90 hover:to-yellow-500/90 text-slate-900 shadow-lg shadow-gold/20 hover:shadow-gold/30 disabled:bg-slate-700/30 disabled:text-slate-600 disabled:shadow-none',
    secondary: 'bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/60 hover:border-slate-500/60 text-slate-300 disabled:bg-slate-800/30 disabled:border-slate-700/30 disabled:text-slate-600',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 disabled:bg-slate-800/30 disabled:border-slate-700/30 disabled:text-slate-600',
    ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white disabled:text-slate-600',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading…
        </>
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
          {children}
        </>
      )}
    </button>
  );
};

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export const Toast = ({ type, message, onClose }: ToastProps) => {
  const styles = {
    success: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300',
    error: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300',
    warning: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300',
    info: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: CheckCircle2,
  };

  const Icon = icons[type];

  return (
    <div className={`fixed right-6 bottom-6 z-50 animate-in slide-in-from-right rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${styles[type]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-slate-400 hover:text-white transition-colors"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  status?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, status }: PageHeaderProps) => (
  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 mb-5 shadow-xl">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
              <Icon className="w-5 h-5 text-gold" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        </div>
        {description && <p className="text-slate-400 text-sm ml-12">{description}</p>}
      </div>
      {status && <div className="flex items-center gap-3">{status}</div>}
    </div>
  </div>
);

interface ControlsBarProps {
  children: ReactNode;
}

export const ControlsBar = ({ children }: ControlsBarProps) => (
  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-3.5 mb-5 shadow-xl">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
      {children}
    </div>
  </div>
);

interface StickyActionBarProps {
  isDirty: boolean;
  onRevert: () => void;
  onSave: () => void;
  saving?: boolean;
  hasToken?: boolean;
  hasErrors?: boolean;
  canSave?: boolean;
}

export const StickyActionBar = ({ isDirty, onRevert, onSave, saving = false, hasToken = true, hasErrors = false, canSave = true }: StickyActionBarProps) => (
  <div className="sticky bottom-0 mt-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-t border-slate-700/60 rounded-t-2xl p-3.5 shadow-2xl">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3.5">
      {isDirty && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>You have unsaved changes</span>
        </div>
      )}
      <div className="flex items-center gap-3 ml-auto">
        <ActionButton
          variant="secondary"
          onClick={onRevert}
          disabled={!isDirty}
          icon={ChevronDown}
        >
          Revert
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={onSave}
          disabled={!hasToken || !isDirty || saving || hasErrors || !canSave}
          loading={saving}
          icon={CheckCircle2}
        >
          Save Changes
        </ActionButton>
      </div>
    </div>
  </div>
);

interface AddFormCardProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: React.ElementType;
  description?: string;
  onAdd?: () => void;
  onPrefill?: () => void;
  canAdd?: boolean;
  adding?: boolean;
}

export const AddFormCard = ({ 
  title, 
  isOpen, 
  onToggle, 
  children, 
  icon: Icon, 
  description,
  onAdd,
  onPrefill,
  canAdd = true,
  adding = false
}: AddFormCardProps) => (
  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-xl hover:border-gold/30 transition-all duration-300 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 group"
      type="button"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-gold/20 rounded-lg border border-gold/30 group-hover:bg-gold/30 transition-colors">
            <Icon className="w-5 h-5 text-gold" />
          </div>
        )}
        <div className="text-left">
          <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{title}</h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-gold transition-colors" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-gold transition-colors" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 border-t border-slate-700/60 pt-6">
        <div className="space-y-4 mb-6">
          {children}
        </div>
        {(onAdd || onPrefill) && (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700/60">
            {onAdd && (
              <ActionButton
                variant="primary"
                onClick={onAdd}
                disabled={!canAdd}
                loading={adding}
                icon={Plus}
              >
                Add Item
              </ActionButton>
            )}
            {onPrefill && (
              <ActionButton
                variant="secondary"
                onClick={onPrefill}
                icon={CheckCircle2}
              >
                Prefill Sample
              </ActionButton>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);

