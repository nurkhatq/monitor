import './globals.css';

export const metadata = {
  title: 'NOVAMANYA Monitor',
  description: 'Threads brand monitoring dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
