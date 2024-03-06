import * as React from "react";

import { cn } from "~/lib/utils";

// Not sure why, but this was included like this and eslint doesnt like it
// export interface InputProps
//     extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "text-lg font-bold text-foreground placeholder:text-foreground focus-visible:outline-none active:border-none disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            onClick={(event) => event.stopPropagation()}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
