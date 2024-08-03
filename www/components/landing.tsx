import Link from "next/link";
import React from "react";
import { TStatus, cn, getApiStatus } from "../utils/functions";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";

const TopBanner = () => {
  return (
    <div className="absolute z-10 flex items-center justify-between w-full h-12 gap-4 px-6 py-4 text-sm text-yellow-800 whitespace-pre bg-yellow-200 top-14 border-y border-yellow-800/10">
      {/* <span className="hidden lg:block">
        Better Lyric's backend was offline for a couple hours on June 11, 2024
        from 0830 GMT to 1230 GMT due to a service incident from Railway.{" "}
      </span>
      <span className="block lg:hidden">Service incident report </span>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://status.railway.app/clxa4z5c81345703e2oe5y8bmsy9"
        className="flex items-center gap-1 font-medium text-yellow-900 hover:underline"
      >
        Learn More
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="inline size-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a> */}
      Better Lyrics is on Product Hunt! 🚀
      <Link
        href="https://www.producthunt.com/posts/better-lyrics?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-better&#0045;lyrics"
        target="_blank"
        className="transition-transform hover:scale-105"
        data-umami-event="ph-btn"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=463141&theme=light"
          alt="Better&#0032;Lyrics - Upgrade&#0032;YouTube&#0032;music&#0032;with&#0032;stunning&#0044;&#0032;synced&#0032;lyrics | Product Hunt"
          width="166.67"
          height="36"
          className=""
        />
      </Link>
    </div>
  );
};

export function Landing() {
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<TStatus>("operational");

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const src = "https://i.ibb.co/QFHpVfy/Screenshot-2024-06-04-at-22-33-35.png";

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/status");
      const { status: apiStatus } = await response.json();

      setStatus(apiStatus);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="fixed z-50 flex items-center w-full px-4 border-b bg-white/75 backdrop-blur lg:px-6 h-14 border-black/5">
        <Link className="flex items-center justify-center" href="#">
          <img alt="Logo" className="mr-2 size-6" src="/icon-512.png" />
          <span className="hidden text-xl font-bold sm:block">Better Lyrics</span>
        </Link>
        <nav className="flex items-center gap-4 ml-auto sm:gap-6">
          <Link className="hidden text-sm font-medium hover:underline underline-offset-4 sm:block" href="#features">
            Features
          </Link>
          <Link className="hidden text-sm font-medium hover:underline underline-offset-4 sm:block" href="#demo">
            Demo
          </Link>
          <Link className="hidden text-sm font-medium hover:underline underline-offset-4 sm:block" href="#testimonials">
            Testimonials
          </Link>
          <Link
            className={cn(
              "inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors border rounded-md shadow h-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
              status === "operational" && "text-green-800 bg-green-50 border-green-600/40 hover:bg-green-100",
              status === "degraded" && "text-yellow-800 bg-yellow-50 border-yellow-600/40 hover:bg-yellow-100",
              status === "downtime" && "text-red-800 bg-red-50 border-red-600/40 hover:bg-red-100"
            )}
            href="https://better-lyrics-status.boidu.dev"
          >
            <span className="relative flex w-2 h-2 mr-2">
              <span
                className={cn(
                  "absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping",
                  status === "operational" && "bg-green-400",
                  status === "degraded" && "bg-yellow-400",
                  status === "downtime" && "bg-red-400"
                )}
              ></span>
              <span
                className={cn(
                  "relative inline-flex w-2 h-2 rounded-full",
                  status === "operational" && "bg-green-500",
                  status === "degraded" && "bg-yellow-500",
                  status === "downtime" && "bg-red-500"
                )}
              ></span>
            </span>
            Status
          </Link>

          <Link
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors bg-gray-900 rounded-md shadow h-9 text-gray-50 hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            href="https://github.com/boidushya/better-lyrics"
          >
            <svg
              viewBox="0 0 256 250"
              className="w-4 h-4 mr-2"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
            >
              <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
            </svg>
            Source Code
          </Link>

          <Link
            className="inline-flex items-center justify-center p-2 text-sm font-medium transition-colors bg-[#5865F2] rounded-md shadow h-9 text-gray-50 hover:bg-[#4053D6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            href="https://discord.gg/UsHE3d5fWF"
            target="_blank"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-[1.25rem] h-[1.25rem]" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"
              />
            </svg>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-24">
        <TopBanner />
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36 hero-bg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Elevate Your Lyrical Experience
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Better Lyrics is the ultimate extension to step up your Youtube Music experience. Get beautiful
                    time-synced lyrics, real-time translations, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="h-12 px-4 overflow-hidden transition-all bg-white border rounded-md shadow-md border-black/15 hover:border-black/20 hover:shadow-lg"
                    href="https://chromewebstore.google.com/detail/better-lyrics/effdbpeggelllpfkjppbokhmmiinhlmg"
                    target="_blank"
                    data-umami-event="chrome-btn"
                  >
                    <img
                      src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/YT2Grfi9vEBa2wAPzhWa.png"
                      alt="Chrome Web Store"
                      className="h-full mx-auto"
                    />
                  </Link>
                  <Link
                    className="h-12 overflow-hidden px-10 py-1 bg-[#0E9AD6] border border-black/5 rounded-md shadow-md hover:border-black/20 hover:shadow-lg transition-all"
                    href="https://addons.mozilla.org/en-US/firefox/addon/better-lyrics/"
                    target="_blank"
                    data-umami-event="firefox-btn"
                  >
                    <img
                      src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg"
                      alt="Firefox Add-On Store"
                      className="h-full mx-auto"
                    />
                  </Link>
                </div>
              </div>
              <div className="relative flex flex-col items-center mb-8 md:mb-0">
                <img
                  alt="Hero"
                  onLoad={handleImageLoad}
                  style={{
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  className="object-cover mx-auto overflow-hidden transition-opacity duration-300 rounded-xl sm:w-full"
                  src={src}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 bg-gray-100 md:py-24 lg:py-32 dark:bg-gray-800 " id="features">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="mb-12 space-y-2 ">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Better Lyrics offers a suite of powerful features to enhance your Youtube Music experience.
                </p>
              </div>
            </div>
            <div className="grid items-start max-w-5xl gap-8 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                  />
                </svg>

                <h3 className="text-lg font-bold">Zero Config</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No configuration required. Just install the extension and enjoy the benefits.
                </p>
              </div>
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="text-lg font-bold">Time-synced Lyrics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get beautiful time-synced lyrics for your favorite songs.
                </p>
              </div>
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                  />
                </svg>

                <h3 className="text-lg font-bold">Seek</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Seamlessly seek through sections of the song by clicking on the lines of the lyrics.
                </p>
              </div>
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
                  />
                </svg>

                <h3 className="text-lg font-bold">Multiple Languages</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get gorgeous lyrics irrespective of the language of the song.
                </p>
              </div>
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
                  />
                </svg>

                <h3 className="text-lg font-bold">Lightweight</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Better Lyrics is lightweight and won't slow down your browser.
                </p>
              </div>
              <div className="grid gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  />
                </svg>

                <h3 className="text-lg font-bold">Translations</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get real-time translations for lyrics in languages you don't understand.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="demo" className="w-full py-12 md:py-24 lg:py-32 ">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="mb-12 space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Watch Better Lyrics in Action</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  See how the Better Lyrics Extension can enhance your Youtube Music experience.
                </p>
              </div>
              <div className="w-full max-w-2xl overflow-hidden rounded-lg aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/GACsqMfhDVE"
                  title="Better Lyrics for Youtube Music | Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 bg-gray-100 md:py-24 lg:py-32 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Hear from our users about how Better Lyrics has transformed their Youtube Music experience.
                </p>
              </div>
              <div className="grid max-w-5xl grid-cols-1 gap-6 pt-12 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:gap-8">
                <Card className="flex flex-col p-6 space-y-4 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <img
                          src="https://styles.redditmedia.com/t5_4245r2/styles/profileIcon_thorr38dpvj91.jpg?width=256&height=256&frame=1&auto=webp&crop=256:256,smart&s=47712e9bb5030c41b249691a1194b0d84ee1898e"
                          alt="User Avatar"
                        />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">MisterMew151</div>
                    </div>
                    <p className="py-2 text-left text-gray-500 dark:text-gray-400">
                      Love this! 10/10 works even better than I expected. I've wanted this for ages!
                    </p>
                  </div>
                </Card>
                <Card className="flex flex-col p-6 space-y-4 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <img
                          src="https://i.redd.it/snoovatar/avatars/a71b88a3-9086-40a9-b926-8e16bac43bd5.png"
                          alt="User Avatar"
                        />
                      </Avatar>
                      <div className="font-medium">NetherCookiez</div>
                    </div>
                    <p className="py-2 text-left text-gray-500 dark:text-gray-400">
                      This is really great! Love the little animation where the lyrics get bigger. Already works as well
                      (or even better) than YTM's lyrics.
                    </p>
                  </div>
                </Card>
                <Card className="flex flex-col p-6 space-y-4 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <img
                          src="https://lh3.googleusercontent.com/a-/ALV-UjVrYLipC28NxGa2S190dbX1DvUEnJbt7TUT64u4VFx9pYqG5ovj4A=s96-w96-h96"
                          alt="User Avatar"
                        />
                        <AvatarFallback>KP</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">Kevin Patel</div>
                    </div>
                    <p className="py-2 text-left text-gray-500 dark:text-gray-400">
                      A much needed extension for YouTube Music. It just works!!! Highly recommended.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col items-center w-full gap-2 px-4 py-6 border-t sm:flex-row shrink-0 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2024 Better Lyrics. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            href="https://better-lyrics-status.boidu.dev/"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
            data-umami-event="status-link"
          >
            Status
          </Link>
          <Link
            href="https://discord.gg/UsHE3d5fWF"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
            target="_blank"
            data-umami-event="discord-link"
          >
            Discord
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
          <Link href="https://boidu.dev" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
