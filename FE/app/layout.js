import './globals.css';

export const metadata = {
  title: 'Sistem POS Kasir',
  description: 'Sistem sederhana untuk Point of Sale',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
