import Image from "next/image";

export const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-800 pt-16 pb-8">
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10  rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Image
                    src="/sporto.ico" // Path to the logo in the public folder
                    alt="SportOn logo"
                    width={100} // Adjust the size as needed
                    height={100} // Adjust the size as needed
                    className="object-cover"
                  />
                </div>
              </span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              SportOn
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connecting badminton players of all skill levels.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {["Home", "Find Players", "Tournaments", "Courts"].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Resources
          </h3>
          <ul className="space-y-3">
            {[
              "Coaching",
              "Equipment Guide",
              "Rules & Tips",
              "Community Forum",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Contact
          </h3>
          <ul className="space-y-3">
            <li className="text-gray-600 dark:text-gray-300">
              support@sporton.com
            </li>
            <li className="text-gray-600 dark:text-gray-300">
              +1 (555) 123-4567
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        © 2025 SportOn. All rights reserved.
      </div>
    </div>
  </footer>
);
