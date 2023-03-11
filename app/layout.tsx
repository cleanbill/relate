import './global.css';
import { Inter } from '@next/font/google'

 const inter = Inter({
     subsets: ['latin']
 })

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title >Relatable</title> 
        <meta name="description" content="Relatable data" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} >{children}</body>
    </html>
  );
}