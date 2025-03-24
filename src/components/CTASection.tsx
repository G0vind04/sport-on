import { Button } from "./ui/button";
import { Card } from "./ui/card";
import Image from "next/image";
import Link from "next/link"; // Import Link from Next.js

export const CTASection = () => (
  <div className="relative">
    {/* Wrapping Card inside a div */}
    <Card className="border-0 rounded-3xl overflow-hidden shadow-xl">
      <div className="relative">
        {/* Optional gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-purple-700 opacity-90"></div>

        {/* Image as background */}
        <Image
          src="/bad2.jpg"
          alt="Badminton players"
          width={1200}
          height={400}
          className="w-full h-64 md:h-80 object-cover"
          style={{ backgroundColor: "#5A67D8" }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Improve Your Game?
          </h2>
          <p className="text-white/90 max-w-2xl mb-8">
            Join our community of badminton enthusiasts today and get access to
            exclusive tournaments, coaching sessions, and connect with players
            at your skill level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Wrap Button with Link */}
            <Link href="/signup" passHref>
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-xl">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
