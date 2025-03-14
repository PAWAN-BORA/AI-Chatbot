import { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { ReactScan } from "@/components/ReactScan";
import ThemeProvider from "./ThemeProvider";
import Store from "./Store";

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
export default function RootLayout({children}:Readonly<{children:ReactNode}>){

  return(
    <html lang="en" className="theme-light">
      <ReactScan/>
      <body >
        <ThemeProvider>
          <Store>
            {children}
          </Store>
        </ThemeProvider>
      </body>
    </html>
  )
}
