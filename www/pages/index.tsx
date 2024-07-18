import Head from "next/head";
import { Landing } from "../components/landing";

export default function Home() {
  return (
    <>
      <Head>
        <title>Better Lyrics</title>
        <meta name="description" content="Better Lyrics for Youtube Music" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="hsxkLtNCoahD0HV2cRmDi9op-0LMgf7wPrcehV7vEyU" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="https://i.ibb.co/QFHpVfy/Screenshot-2024-06-04-at-22-33-35.png" as="image" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="f9fdefc7-b1fe-49fd-973f-c312f9c824b6" />
      </Head>
      <Landing />
    </>
  );
}
