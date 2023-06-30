import './global.css';
import { Saira } from '@next/font/google'

 const font = Saira({
   subsets: ['latin'],
   weight: '300'
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
      <body className={font.className} >{children}</body>
    </html>
  );
}