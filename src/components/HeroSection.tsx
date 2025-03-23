// src/components/HeroSection.tsx
import { Button } from "./ui/button";
import Image from "next/image";

export const HeroSection = () => (
  <div className="relative rounded-3xl overflow-hidden mb-16">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 z-10"></div>
    <Image
      src="/hero-bg"
      alt="Badminton players"
      width={1800}
      height={600}
      className="w-full h-[500px] object-cover"
      style={{ backgroundColor: "#4A5568" }}
    />
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
          <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg">
            Find Players
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
          >
            Explore Tournaments
          </Button>
        </div>
      </div>
    </div>
  </div>
);
