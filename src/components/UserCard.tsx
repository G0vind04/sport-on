"use client";

import { UserProfile } from "../app/page";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface UserCardProps {
  user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome, {user?.name}!</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        {user?.profile_pic ? (
          <Avatar>
            <AvatarImage src={user.profile_pic} alt="Profile" />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <p className="text-sm text-gray-600">Badminton Enthusiast</p>
      </CardContent>
    </Card>
  );
}
