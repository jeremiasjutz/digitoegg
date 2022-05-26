import { useEffect, useState } from 'react';
import { HiOutlineCheck } from 'react-icons/hi';

export default function Activate() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="grid h-full place-items-center">
      <div className="grid place-items-center gap-6">
        <HiOutlineCheck
          className={`text-6xl text-success transition-transform ${
            isLoaded ? 'scale-100' : 'scale-0'
          }`}
        />
        <h1 className="font-serif text-2xl md:text-4xl">
          Dein Konto wurde erstellt!
        </h1>
        <p className="text-center">
          Bitte prüfe dein Postfach und klicke auf den Aktivierungslink.
        </p>
      </div>
    </div>
  );
}
