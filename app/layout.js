import "./globals.css";
import Header from "./((comp))/Header";

export const metadata = {
  title: "Viximate",
  description: "you imagine we create",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Revalia&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        {children}
        
      </body>
    </html>
  );
}
