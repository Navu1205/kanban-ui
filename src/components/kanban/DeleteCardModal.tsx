/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, deleteCard } from "@/lib/api/card.api";

interface DeleteCardModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onCardDeleted: () => void;
}

const DeleteCardModal: React.FC<DeleteCardModalProps> = ({
  isOpen,
  onOpenChange,
  card,
  onCardDeleted,
}) => {
  const [isDeletingCard, setIsDeletingCard] = useState<boolean>(false);

  const handleConfirmDelete = async () => {
    if (!card) return;

    setIsDeletingCard(true);
    try {
      await deleteCard(card.id);
      onOpenChange(false);
      onCardDeleted(); // Notify parent to refresh card list
    } catch (err: any) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeletingCard(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the card {card?.title}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeletingCard}
          >
            {isDeletingCard ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCardModal;