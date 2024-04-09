"use client";
import * as React from "react";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export default function NavMenu() {
    const { data: session } = useSession();
    const avatar: string = session
        ? session.user.image ?? ""
        : "./images/avatar-default.svg";

    return (
        <div className="flex flex-row border-b-2 py-2">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Home
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    {session && (
                        <NavigationMenuItem>
                            Hi {session?.user.name}
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex-grow"></div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link
                            href={
                                session
                                    ? "/api/auth/signout"
                                    : "/api/auth/signin"
                            }
                            legacyBehavior
                            passHref
                        >
                            <NavigationMenuLink
                                className={
                                    navigationMenuTriggerStyle() + " gap-2"
                                }
                            >
                                <Avatar className="flex h-8 w-8">
                                    <AvatarImage
                                        src={avatar}
                                        alt="@profilpicture"
                                    />
                                    <AvatarFallback>
                                        {session?.user.name?.slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                {session ? "Sign Out" : "Sign In"}
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
