import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { ThemeProvider } from "~/components/layouts/theme-providers";
import SessionProvider from "~/components/layouts/next-auth-session-provider";
import { Toaster } from "~/components/ui/sonner";

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
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <SessionProvider session={session}>
                            {children}
                        </SessionProvider>
                    </ThemeProvider>
                </TRPCReactProvider>
                <Toaster />
            </body>
        </html>
    );
}
