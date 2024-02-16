import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import SessionProvider from "./_components/next-auth-session-provider";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {
    title: "Meeting Utilizer",
    description: "Helps you when you didn't pay attention.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerAuthSession();

    return (
        <html lang="de">
            <body className={`font-sans ${inter.variable}`}>
                <NextSSRPlugin
                    routerConfig={extractRouterConfig(ourFileRouter)}
                />
                <TRPCReactProvider cookies={cookies().toString()}>
                    <SessionProvider session={session}>
                        {children}
                    </SessionProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
