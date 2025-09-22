"use client";

import React, { useEffect, useState } from "react";
import { getCards, Card, CardStatus, updateCard } from "@/lib/api/card.api";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import KanbanColumn from "./KanbanColumn";
import CreateCardModal from "./CreateCardModal";
import UpdateCardModal from "./UpdateCardModal";
import DeleteCardModal from "./DeleteCardModal";
import { CARD_STATUS_OPTIONS } from "@/lib/kanban.utils";

export default function KanbanBoardComponent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Create Card Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // State for Update Card Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // State for Delete Card Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await getCards();
      setCards(fetchedCards);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to fetch cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If card is dropped outside a droppable area or in the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const draggedCardId = Number(draggableId);
    const draggedCard = cards.find((card) => card.id === draggedCardId);

    if (!draggedCard) return;

    // Optimistic UI update
    const newCards = Array.from(cards);
    const [removed] = newCards.splice(
      cards.findIndex((card) => card.id === draggedCardId),
      1
    );

    // If moving within the same column, reorder locally
    if (source.droppableId === destination.droppableId) {
      newCards.splice(destination.index, 0, removed);
      setCards(newCards);
    } else {
      // Moving to a different column
      const newStatus = destination.droppableId as CardStatus;
      removed.status = newStatus;
      newCards.splice(destination.index, 0, removed);
      setCards(newCards);

      // API call to update status
      try {
        await updateCard(draggedCardId, { status: newStatus });
      } catch (err) {
        console.error("Failed to update card status via drag and drop:", err);
        // Revert UI if API call fails
        fetchCards();
      }
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
        <CreateCardModal
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onCardCreated={fetchCards}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
          {CARD_STATUS_OPTIONS.map((statusOption) => (
            <KanbanColumn
              key={statusOption}
              title={statusOption.replace(/_/g, " ")}
              status={statusOption}
              cards={cards}
              onCardClick={handleCardClick}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </DragDropContext>

      <UpdateCardModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        card={selectedCard}
        onCardUpdated={fetchCards}
      />

      <DeleteCardModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        card={cardToDelete}
        onCardDeleted={fetchCards}
      />
    </div>
  );
}