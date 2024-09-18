import Image from "next/image";
import Link from "next/link";
import AcmeLogo from "@/components/acme-logo";

export default async function Index() {
  return (
    <>
      <main className="flex min-h-screen flex-col p-6">
        <div className="flex h-20 shrink-0 items-end rounded-lg bg-[#13112e] p-4 md:h-52">
          <AcmeLogo />
        </div>
        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
            <div
              className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
            />
            <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal `} >
              <strong>Welcome to Spectpro.</strong> This is the example for the{' '}
              <a href="https://nextjs.org/learn/" className="text-[#13112e]">
                SpectPro Invoicing
              </a>
              , brought to you by ASNP.
            </p>
          </div>
          <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
            {/* Add Hero Images Here */}
            <Image
              src='/hero-desktop.png'
              width={1000}
              height={760}
              className='hidden md:block'
              alt='screenshot of the dashboard project showing desktop version' />
            <Image
              src='/hero-mobile.png'
              width={560}
              height={620}
              className='md:hidden block'
              alt='Screenshot of the dashboard project showing mobile version' />

          </div>
        </div>
      </main>
    </>
  );
}
