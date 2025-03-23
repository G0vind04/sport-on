// src/components/TournamentCard.tsx
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin } from "lucide-react";

type Tournament = {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  registeredPlayers: number;
  maxPlayers: number;
  color: string;
  category: string;
};

export const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
  <Card className="group overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition duration-300 border-0 rounded-xl">
    <div className="relative">
      <div
        className="w-full h-48"
        style={{ backgroundColor: tournament.color }}
      />
      <Badge className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700">
        {tournament.category}
      </Badge>
    </div>
    <div className="p-6">
      <div className="flex items-center mb-3 text-gray-500 dark:text-gray-400 text-sm">
        <Calendar className="w-4 h-4 mr-2" />
        {tournament.date}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {tournament.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {tournament.description}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-5">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {tournament.location}
        </div>
        <div>
          {tournament.registeredPlayers}/{tournament.maxPlayers} Players
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-600 h-1.5 rounded-full"
          style={{
            width: `${
              (tournament.registeredPlayers / tournament.maxPlayers) * 100
            }%`,
          }}
        ></div>
      </div>
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2">
        Register Now
      </Button>
    </div>
  </Card>
);
