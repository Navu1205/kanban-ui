/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCards, createCard, Card, CardStatus } from "@/lib/api/card.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const getStatusPillColor = (status: CardStatus): string => {
  switch (status) {
    case "TODO":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "QA":
      return "bg-purple-100 text-purple-800";
    case "DONE":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const KanbanColumn = ({
  title,
  status,
  cards,
}: {
  title: string;
  status: CardStatus;
  cards: Card[];
}) => {
  const filteredCards = cards.filter((card) => card.status === status);

  return (
    <div className="flex-1 p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <p className="text-gray-500 text-sm">No cards in this column.</p>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{card.title}</h3>
                <span
                  className={`px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusPillColor(
                    card.status
                  )}`}
                >
                  {card.status.replace(/_/g, " ")}
                </span>
              </div>
              {card.description && (
                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
              )}
              {card.imgUrl && (
                <div className="mt-2">
                  <Image
                    src={card.imgUrl}
                    alt={card.title}
                    width={200}
                    height={120}
                    className="rounded-md object-cover w-full"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function KanbanBoardComponent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCardTitle, setNewCardTitle] = useState<string>("");
  const [newCardDescription, setNewCardDescription] = useState<string>("");
  const [newCardImgUrl, setNewCardImgUrl] = useState<string>("");
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await getCards();
      setCards(fetchedCards);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCard(true);
    try {
      await createCard({
        title: newCardTitle,
        description: newCardDescription || undefined,
        imgUrl: newCardImgUrl || undefined,
        status: "TODO", // New cards always start as TODO
      });
      setNewCardTitle("");
      setNewCardDescription("");
      setNewCardImgUrl("");
      setIsModalOpen(false);
      fetchCards(); // Refresh the card list
    } catch (err: any) {
      console.error("Failed to create card:", err);
      alert("Failed to create card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading Kanban Board...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Card</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Card</DialogTitle>
              <DialogDescription>
                Fill in the details for your new Kanban card.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCard} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imgUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imgUrl"
                  value={newCardImgUrl}
                  onChange={(e) => setNewCardImgUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <Button type="submit" disabled={isCreatingCard}>
                {isCreatingCard ? "Creating..." : "Create Card"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
        <KanbanColumn title="To Do" status="TODO" cards={cards} />
        <KanbanColumn title="In Progress" status="IN_PROGRESS" cards={cards} />
        <KanbanColumn title="QA" status="QA" cards={cards} />
        <KanbanColumn title="Done" status="DONE" cards={cards} />
      </div>
    </div>
  );
}