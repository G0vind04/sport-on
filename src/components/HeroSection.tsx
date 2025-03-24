import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link"; // Import Link from Next.js

export const HeroSection = () => (
  <div className="relative rounded-3xl overflow-hidden mb-16">
    <div className="relative w-full h-[500px]">
      {/* Semi-transparent background */}
      <div className="absolute inset-0 bg-[#4A5568] opacity-50 z-10"></div>

      {/* Image */}
      <Image
        src="/bad1.jpg"
        alt="Badminton players"
        width={1800}
        height={600}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="absolute inset-0 flex flex-col justify-center items-start z-20 p-8 md:p-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Find Your Perfect Match on the Court
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8">
          Connect with players at your skill level, join tournaments, and book
          courts all in one place. Elevate your badminton game today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Wrap buttons in Link components */}
          <Link href="/users">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg">
              Find Players
            </Button>
          </Link>

          <Link href="/tournaments">
            <Button
              variant="outline"
              className="border-white text-indigo-600 hover:bg-indigo/10 px-8 py-6 text-lg rounded-xl"
            >
              Explore Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
