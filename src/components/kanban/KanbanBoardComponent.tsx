/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCards, createCard, updateCard, deleteCard, Card, CardStatus } from "@/lib/api/card.api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react"; // Assuming lucide-react is installed for icons

const CARD_STATUS_OPTIONS: CardStatus[] = ["TODO", "IN_PROGRESS", "QA", "DONE"];

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
  onCardClick,
  onDeleteClick,
}: {
  title: string;
  status: CardStatus;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onDeleteClick: (card: Card) => void;
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
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onCardClick(card)}
            >
              <div className="flex justify-between items-center mb-2 relative">
                <h3 className="font-medium text-gray-900">{card.title}</h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusPillColor(
                      card.status
                    )}`}
                  >
                    {card.status.replace(/_/g, " ")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from opening update modal
                      onDeleteClick(card);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

  // State for Create Card Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newCardTitle, setNewCardTitle] = useState<string>("");
  const [newCardDescription, setNewCardDescription] = useState<string>("");
  const [newCardImgUrl, setNewCardImgUrl] = useState<string>("");
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);

  // State for Update Card Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedImgUrl, setEditedImgUrl] = useState<string>("");
  const [editedStatus, setEditedStatus] = useState<CardStatus>("TODO");
  const [isUpdatingCard, setIsUpdatingCard] = useState<boolean>(false);

  // State for Delete Card Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState<boolean>(false);

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

  // Effect to populate update modal fields when a card is selected
  useEffect(() => {
    if (selectedCard) {
      setEditedTitle(selectedCard.title);
      setEditedDescription(selectedCard.description || "");
      setEditedImgUrl(selectedCard.imgUrl || "");
      setEditedStatus(selectedCard.status);
    } else {
      // Reset fields when modal closes or no card is selected
      setEditedTitle("");
      setEditedDescription("");
      setEditedImgUrl("");
      setEditedStatus("TODO");
    }
  }, [selectedCard]);

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
      setIsCreateModalOpen(false);
      fetchCards(); // Refresh the card list
    } catch (err: any) {
      console.error("Failed to create card:", err);
      alert("Failed to create card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;

    setIsDeletingCard(true);
    try {
      await deleteCard(cardToDelete.id);
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
      fetchCards(); // Refresh the card list
    } catch (err: any) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeletingCard(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    setIsUpdatingCard(true);
    try {
      await updateCard(selectedCard.id, {
        title: editedTitle,
        description: editedDescription || undefined,
        imgUrl: editedImgUrl || undefined,
        status: editedStatus,
      });
      setIsUpdateModalOpen(false);
      setSelectedCard(null); // Clear selected card
      fetchCards(); // Refresh the card list
    } catch (err: any) {
      console.error("Failed to update card:", err);
      alert("Failed to update card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingCard(false);
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
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
                <Label htmlFor="new-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="new-title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="new-description"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-imgUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="new-imgUrl"
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
        <KanbanColumn title="To Do" status="TODO" cards={cards} onCardClick={handleCardClick} onDeleteClick={handleDeleteClick} />
        <KanbanColumn title="In Progress" status="IN_PROGRESS" cards={cards} onCardClick={handleCardClick} onDeleteClick={handleDeleteClick} />
        <KanbanColumn title="QA" status="QA" cards={cards} onCardClick={handleCardClick} onDeleteClick={handleDeleteClick} />
        <KanbanColumn title="Done" status="DONE" cards={cards} onCardClick={handleCardClick} onDeleteClick={handleDeleteClick} />
      </div>

      {/* Update Card Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Make changes to your card here. Click save when you re done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCard} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-imgUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-imgUrl"
                value={editedImgUrl}
                onChange={(e) => setEditedImgUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={editedStatus}
                onValueChange={(value: CardStatus) => setEditedStatus(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isUpdatingCard}>
              {isUpdatingCard ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the card {cardToDelete?.title}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 py-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeletingCard}>
              {isDeletingCard ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}