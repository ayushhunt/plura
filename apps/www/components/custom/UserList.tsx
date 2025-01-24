"use client";

import React, { useEffect, useState } from "react";
import { betterFetch } from "@better-fetch/fetch";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  isOnboarding: boolean;
  sessions: any[]; // Replace `any[]` with the Session type if defined
  accounts: any[]; // Replace `any[]` with the Account type if defined
  workspaces: any[]; // Replace `any[]` with the Workspace type if defined
  projects: any[]; // Replace `any[]` with the Project type if defined
  feedbacks: any[]; // Replace `any[]` with the Feedback type if defined
  banned?: boolean;
  banReason?: string;
  banExpires?: string;
  role: string;
  normalizedEmail: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await betterFetch<User[]>("http://localhost:3001/v1/adminclient/usersList", {
          method: "GET",
          credentials: "include",
        });

        if (!response.data) {
          throw new Error("Failed to fetch users");
        }

        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="border p-4 rounded shadow">
            <div className="flex items-center space-x-4">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            {user.banned && (
              <div className="text-red-600">
                <p>
                  <strong>Banned:</strong> Yes
                </p>
                {user.banReason && (
                  <p>
                    <strong>Reason:</strong> {user.banReason}
                  </p>
                )}
                {user.banExpires && (
                  <p>
                    <strong>Ban Expires:</strong>{" "}
                    {new Date(user.banExpires).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            <p className="text-gray-500">
              <strong>Joined:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
