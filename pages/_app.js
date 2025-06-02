// import { useEffect, useState } from "react";
// import ContextProvider from "../context";
// import "../styles/globals.css";

// function MyApp({ Component, pageProps }) {
//   // For cookie handling in pages router
//   const [cookieString, setCookieString] = useState(null);

//   useEffect(() => {
//     // Get cookies on client side
//     setCookieString(document.cookie);
//   }, []);

//   return (
//     <ContextProvider cookies={cookieString}>
//       <Component {...pageProps} />
//     </ContextProvider>
//   );
// }

// export default MyApp;

import { useEffect, useState } from "react";
import ContextProvider from "../context";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/globals.css";

import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet, embeddedWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2", // ✅ Your Smart Wallet factory
  gasless: false,
  client,
  personalWallets: [embeddedWallet()],
});

function MyApp({ Component, pageProps }) {
  const [cookieString, setCookieString] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCookieString(document.cookie);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
      <ThemeProvider>
        <ContextProvider cookies={cookieString}>
          <Component {...pageProps} />
        </ContextProvider>
      </ThemeProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
