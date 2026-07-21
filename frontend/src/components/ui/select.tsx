import * as React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className || ""}`} {...props}>
    {children}
  </div>
);

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectItem = ({ value, children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) => (
  <option value={value} {...props}>{children}</option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
