import { GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react';


export default function AcmeLogo(): JSX.Element {
    return (
      <div
        className={`flex flex-row items-center leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#fb6608] to-[#e0271c]`}
      >

        <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
        <p className="text-[44px]">SpectPro</p>
      </div>
    );
  }