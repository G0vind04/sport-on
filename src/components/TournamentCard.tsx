"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";

type Tournament = {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  registered_players: number;
  max_players: number;
  color: string;
  category: string;
  created_by?: string;
  city: string | null;
};

export const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/tournaments/${tournament.id}`);
  };

  return (
    <Card
      className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div
          className="h-2 w-full mb-4"
          style={{ backgroundColor: tournament.color }}
        />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {tournament.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {tournament.description}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tournament.date} • {tournament.location}, {tournament.city || "N/A"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Category: {tournament.category}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Players: {tournament.registered_players}/{tournament.max_players}
        </p>
      </CardContent>
    </Card>
  );
};
