"use client";
import * as React from "react";
import Link from "next/link";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "~/app/_components/ui/navigation-menu";
import { useSession } from "next-auth/react";

export default function NavMenu() {
    const { data: session } = useSession();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {session && (
                    <NavigationMenuItem>
                        Hi {session?.user.name}
                    </NavigationMenuItem>
                )}
                <div className="flex-grow"> </div>
                <NavigationMenuItem>
                    <Link
                        href={
                            session ? "/api/auth/signout" : "/api/auth/signin"
                        }
                        legacyBehavior
                        passHref
                    >
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                        >
                            {session ? "Sign Out" : "Sign In"}
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
