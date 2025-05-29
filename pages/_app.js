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
import { AppKitProvider } from "@reown/appkit/react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const [cookieString, setCookieString] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCookieString(document.cookie);
    setMounted(true);
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppKitProvider>
        <ContextProvider cookies={cookieString}>
          <Component {...pageProps} />
        </ContextProvider>
      </AppKitProvider>
    </ThemeProvider>
  );
}

export default MyApp;
