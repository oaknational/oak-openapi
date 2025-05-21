import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Oak OpenAPI - Oak National Academy',
  icons: [
    { rel: 'icon', type: 'image/x-icon', url: '/images/favicon.ico' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '48x48',
      url: '/images/favicon-48x48.png',
    },
  ],
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={lexend.className}>
      <body>{children}</body>
    </html>
  );
}
