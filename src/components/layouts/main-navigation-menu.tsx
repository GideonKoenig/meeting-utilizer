"use client";
import * as React from "react";
import Link from "next/link";

import { useSession } from "next-auth/react";
import * as Avatar from "../ui/avatar";
import * as NavigationMenu from "../ui/navigation-menu";
import { ModeToggle } from "./mood-toggle";

export default function NavMenu() {
    const { data: session } = useSession();
    const avatar: string = session
        ? session.user.image ?? ""
        : "./images/avatar-default.svg";

    return (
        <div className="flex flex-row border-b-2 py-2">
            <NavigationMenu.NavigationMenu>
                <NavigationMenu.NavigationMenuList>
                    <NavigationMenu.NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenu.NavigationMenuLink
                                className={NavigationMenu.navigationMenuTriggerStyle()}
                            >
                                Home
                            </NavigationMenu.NavigationMenuLink>
                        </Link>
                    </NavigationMenu.NavigationMenuItem>
                    {session && (
                        <NavigationMenu.NavigationMenuItem>
                            Hi {session?.user.name}
                        </NavigationMenu.NavigationMenuItem>
                    )}
                </NavigationMenu.NavigationMenuList>
            </NavigationMenu.NavigationMenu>
            <div className="flex-grow"></div>
            <ModeToggle />
            <NavigationMenu.NavigationMenu>
                <NavigationMenu.NavigationMenuList>
                    <NavigationMenu.NavigationMenuItem>
                        <Link
                            href={
                                session
                                    ? "/api/auth/signout"
                                    : "/api/auth/signin"
                            }
                            legacyBehavior
                            passHref
                        >
                            <NavigationMenu.NavigationMenuLink
                                className={
                                    NavigationMenu.navigationMenuTriggerStyle() +
                                    " gap-2"
                                }
                            >
                                <Avatar.Avatar className="flex h-8 w-8">
                                    <Avatar.AvatarImage
                                        src={avatar}
                                        alt="@profilpicture"
                                    />
                                    <Avatar.AvatarFallback>
                                        {session?.user.name?.slice(0, 2)}
                                    </Avatar.AvatarFallback>
                                </Avatar.Avatar>
                                {session ? "Sign Out" : "Sign In"}
                            </NavigationMenu.NavigationMenuLink>
                        </Link>
                    </NavigationMenu.NavigationMenuItem>
                </NavigationMenu.NavigationMenuList>
            </NavigationMenu.NavigationMenu>
        </div>
    );
}
