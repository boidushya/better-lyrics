import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en" className="light">
      <Head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="f9fdefc7-b1fe-49fd-973f-c312f9c824b6"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
