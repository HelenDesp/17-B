import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              #__next-build-watcher,
              [data-nextjs-dialog],
              [data-nextjs-dialog-overlay],
              [data-nextjs-refresh-overlay],
              #__next-prerender-indicator,
              .nextjs-portal {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
              }
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
