import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TUVERIX | لوحة الامتثال التنظيمي',
  description:
    'منصة TUVERIX للامتثال التنظيمي في قطاع الأغذية والمشروبات بالمملكة العربية السعودية',
  openGraph: {
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
