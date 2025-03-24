import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";

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
  images: string[];
};

export const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const router = useRouter();

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
      {tournament.images && tournament.images.length > 0 ? (
        <Image
          src={tournament.images[0]}
          alt={`${tournament.name} image`}
          width={400}
          height={224}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div
          className="w-full h-56"
          style={{ backgroundColor: tournament.color }}
        />
      )}
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {tournament.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {tournament.description}
        </p>
        <div className="space-y-2 text-gray-500 dark:text-gray-400">
          <p>
            <strong>Date:</strong> {tournament.date}
          </p>
          <p>
            <strong>Location:</strong> {tournament.location}
            {tournament.city && `, ${tournament.city}`}
          </p>
          <p>
            <strong>Players:</strong> {tournament.registered_players}/
            {tournament.max_players}
          </p>
          <p>
            <strong>Category:</strong> {tournament.category}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => router.push(`/tournaments/${tournament.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
