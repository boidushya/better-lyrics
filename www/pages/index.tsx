import Head from "next/head";
import { Landing } from "../@/components/landing";

export default function Home() {
  return (
    <>
      <Head>
        <title>Better Lyrics</title>
        <meta name="description" content="Better Lyrics for Youtube Music" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Landing />
    </>
  );
}
