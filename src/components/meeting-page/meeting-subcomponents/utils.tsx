import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faPlay,
    faCircleXmark,
    faCircleNotch,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "~/lib/utils";

export function usePersistedState<T>(
    key: string,
    defaultValue: T,
): [T, (value: T) => void] {
    const [state, setState] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null
            ? (JSON.parse(storedValue) as T)
            : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export function stringifyDate(date: Date): string {
    return date
        .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replaceAll(", ", "  ")
        .replaceAll("/", ".");
}

export function getStatusIcon(
    status: string | undefined,
    className?: string | undefined,
): JSX.Element {
    switch (status) {
        case "ready":
            return (
                <FontAwesomeIcon
                    className={cn("pr-1.5 text-blue-600", className)}
                    icon={faPlay}
                />
            );
        case "pending":
            return (
                <FontAwesomeIcon
                    className={cn(" mr-1.5 text-muted-foreground", className)}
                    icon={faCircleNotch}
                    spin
                />
            );
        case "done":
            return (
                <FontAwesomeIcon
                    className={cn("pr-1.5 text-green-600", className)}
                    icon={faCircleCheck}
                />
            );

        case "error":
            return (
                <FontAwesomeIcon
                    className={cn("pr-1.5 text-red-600", className)}
                    icon={faXmark}
                />
            );
        case "blocked":
            return (
                <FontAwesomeIcon
                    className={cn("pr-1.5 text-muted-foreground", className)}
                    icon={faCircleXmark}
                />
            );
        default:
            return (
                <FontAwesomeIcon
                    className={cn("pr-1.5 text-muted-foreground", className)}
                    icon={faCircleXmark}
                />
            );
    }
}
