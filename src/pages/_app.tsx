import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppThemeProvider } from '../theme/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { PatientModalProvider } from '../context/PatientModalContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Pragati Foundation Medical Camp — Admin Portal</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <PatientModalProvider>
              <Component {...pageProps} />
            </PatientModalProvider>
          </ToastProvider>
        </AuthProvider>
      </AppThemeProvider>
    </>
  );
}
