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
import { useAppKitTheme } from "@reown/appkit/react"; // ✅ Reown hook
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const [cookieString, setCookieString] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { setThemeMode } = useAppKitTheme(); // ✅ Get Reown theme control

  useEffect(() => {
    setCookieString(document.cookie);
    setMounted(true);
  }, []);

  // ✅ Sync Reown modal theme with app theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeMode(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [setThemeMode]);

  if (!mounted) return null;

  return (
    <ThemeProvider>
      <ContextProvider cookies={cookieString}>
        <Component {...pageProps} />
      </ContextProvider>
    </ThemeProvider>
  );
}

export default MyApp;
