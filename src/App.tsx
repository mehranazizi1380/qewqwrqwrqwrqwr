
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider, useTonConnectUI } from '@tonconnect/ui-react';
import { useRoutes } from 'react-router-dom';
import routes from './router/config';
import { tonWalletService } from './services/tonService';

const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

function AppContent() {
  const [tonConnectUI] = useTonConnectUI();
  const routing = useRoutes(routes);

  useEffect(() => {
    // Initialize TON wallet service with TonConnect UI
    if (tonConnectUI) {
      tonWalletService.initialize(tonConnectUI);
    }
  }, [tonConnectUI]);

  return routing;
}

function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppContent />
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}

export default App;