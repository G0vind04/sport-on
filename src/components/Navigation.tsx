import { Button } from "./ui/button";

export const Navigation = () => (
  <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
    <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">BN</span>
        </div>
        <span className="font-bold text-xl text-gray-900 dark:text-white">
          SportOn
        </span>
      </div>
      <div className="hidden md:flex space-x-8">
        {["Home", "Tournaments", "Courts", "My Matches"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(" ", "-")}`}
            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
          >
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className="hidden md:block border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700"
        >
          Sign In
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Join Now
        </Button>
      </div>
    </div>
  </nav>
);
