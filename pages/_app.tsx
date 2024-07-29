import * as React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LoadScript } from '@react-google-maps/api';

const theme = createTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
        <Component {...pageProps} />
      </LoadScript>
    </ThemeProvider>
  );
}