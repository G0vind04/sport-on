// src/components/MatchCard.tsx
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Calendar, MapPin } from "lucide-react";

type Match = {
  id: number;
  players: string[];
  against: string[];
  date: string;
  time: string;
  court: string;
};

export const MatchCard = ({ match }: { match: Match }) => (
  <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition duration-300 border-0 rounded-xl overflow-hidden">
    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="mb-4 md:mb-0">
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          {match.date} • {match.time}
        </div>
        <div className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-2">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-1 px-3 rounded-full text-sm mr-3">
            Doubles
          </span>
          {match.players.join(" & ")} vs. {match.against.join(" & ")}
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          {match.court}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
        >
          Reschedule
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          View Details
        </Button>
      </div>
    </div>
  </Card>
);
