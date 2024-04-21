"use client";

import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import * as DropdownMenu from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export function ModeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu.DropdownMenu>
            <DropdownMenu.DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenu.DropdownMenuTrigger>
            <DropdownMenu.DropdownMenuContent align="end">
                <DropdownMenu.DropdownMenuItem
                    onClick={() => setTheme("light")}
                >
                    <SunIcon className="mr-2 size-4" />
                    <span>Light</span>
                </DropdownMenu.DropdownMenuItem>
                <DropdownMenu.DropdownMenuItem onClick={() => setTheme("dark")}>
                    <MoonIcon className="mr-2 size-4" />
                    <span>Dark</span>
                </DropdownMenu.DropdownMenuItem>
                <DropdownMenu.DropdownMenuItem
                    onClick={() => setTheme("system")}
                >
                    <LaptopIcon className="mr-2 size-4" />
                    <span>System</span>
                </DropdownMenu.DropdownMenuItem>
            </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
    );
}
