import type { Metadata, Viewport } from "next";
import { League_Gothic, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/motion/Cursor";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Nav from "@/components/nav/Nav";
import Footer from "@/components/sections/Footer";
import SiteLoader from "@/components/siteLoader/SiteLoader";
import PageTransition from "@/components/transition/PageTransition";
import RouteTransitions from "@/components/transition/RouteTransitions";
import { site } from "@/config/site";

const display = League_Gothic({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// latin-ext carries the rupee sign the budget options use.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.motto}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} | ${site.motto}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${montserrat.variable} ${poppins.variable} antialiased`}
    >
      <body>
        <noscript>
          <style>{".vx-loader{display:none!important}"}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteLoader />
        <SmoothScroll />
        <Cursor />
        <Nav />
        {children}
        <Footer />
        <PageTransition />
        <RouteTransitions />
      </body>
    </html>
  );
}
