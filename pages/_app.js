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

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

function MyApp({ Component, pageProps }) {
  const [cookieString, setCookieString] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCookieString(document.cookie);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThirdwebProvider client={client} activeChain={base}>
      <ThemeProvider>
        <ContextProvider cookies={cookieString}>
          <Component {...pageProps} />
        </ContextProvider>
      </ThemeProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
