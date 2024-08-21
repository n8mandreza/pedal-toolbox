import { h } from "preact"
import { useEffect, useState } from "preact/hooks";

interface ISpotIllustration {
  communicationType: 'decorative' | 'success'
  lightSpotIllustration: React.ReactNode
  darkSpotIllustration: React.ReactNode
}

export default function SpotIllustration({ communicationType, lightSpotIllustration, darkSpotIllustration }: ISpotIllustration) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Function to check if the 'figma-dark' class is on the 'html' element
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('figma-dark');
      setIsDarkMode(isDark);
    };

    // Initial check and setup event listeners for DOM content loaded and window load
    updateTheme();
    window.addEventListener('DOMContentLoaded', updateTheme);
    window.addEventListener('load', updateTheme);

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('DOMContentLoaded', updateTheme);
      window.removeEventListener('load', updateTheme);
    };
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  const communicationTypeClasses = {
    'decorative': 'spot-bg-blurple',
    'success': 'spot-bg-success'
  };

  const bgClasses = [
    'opacity-60 rounded-full spot-bg',
    communicationTypeClasses[communicationType]
  ];
  
  return (
    <div class="w-20 h-20 relative flex items-center justify-center">
      <div class={bgClasses.filter(Boolean).join(' ')}></div>

      <div class="z-10 absolute top-0 left-0 right-0 bottom-0">
        {isDarkMode ? darkSpotIllustration : lightSpotIllustration}
      </div>
    </div>
  )
}