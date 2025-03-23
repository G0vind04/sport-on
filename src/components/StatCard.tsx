// src/components/StatCard.tsx
import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <Card className="bg-white dark:bg-gray-800 shadow-md border-0">
    <CardContent className="p-6 flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{label}</p>
    </CardContent>
  </Card>
);
