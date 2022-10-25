import { Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetupWorkerApi } from 'msw';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'theme-ui';
import App from './App';
import { AuthProvider } from './features/auth/AuthContext';
import { store } from './features/store/store';
import './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './theme';

if (process.env.NODE_ENV === 'development') {
  const worker = require('./mocks/browser').worker as SetupWorkerApi;
  worker.start({
    quiet: false,
    onUnhandledRequest(req, print) {
      if (!req.url.toString().match(/nordigen/)) {
        return;
      }

      print.warning();
    },
  });
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider initialState={{ kind: 'UNINITIALIZED' }}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              <Global
                styles={(theme) => ({
                  '*:focus, *:focus-visible': {
                    outlineColor: '#024750',
                  },
                  body: { overflow: 'hidden' },
                  a: {
                    color: '#024750',
                  },
                  'button:disabled': {
                    opacity: 0.5,
                  },
                  fieldset: { border: 0, padding: 0, marginBottom: '0.5rem', marginTop: '1rem' },
                  legend: {
                    padding: 0,
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  },
                  ul: {
                    padding: 0,
                  },
                  'a, button': {
                    touchAction: 'manipulation',
                  },
                })}
              />
              <App />
              {/* <ReactQueryDevtools /> */}
            </QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
