import { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import "./globals.css";
import { ReactScan } from "@/components/ReactScan";
import ThemeProvider from "./ThemeProvider";
import Store from "./Store";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// import localFont from "next/font/local";



// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata:Metadata = {
  title:"Chat Bot",
  description:"This is an ai chat bot with llm"
}
export default async function RootLayout({children}:Readonly<{children:ReactNode}>){
  const cookie = await cookies()
  const theme = cookie.get("theme")??{value:"light"}
  return(
    <html lang="en" className={`theme-${theme.value}`}>
      {/* <ReactScan/> */}
      <body >
        <ThemeProvider>
          <Store>
            <Suspense fallback="Loading...">
              {children}
            </Suspense>
          </Store>
        </ThemeProvider>
      </body>
    </html>
  )
}
