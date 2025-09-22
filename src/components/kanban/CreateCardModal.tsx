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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCard } from "@/lib/api/card.api";

interface CreateCardModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCardCreated: () => void;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({
  isOpen,
  onOpenChange,
  onCardCreated,
}) => {
  const [newCardTitle, setNewCardTitle] = useState<string>("");
  const [newCardDescription, setNewCardDescription] = useState<string>("");
  const [newCardImgUrl, setNewCardImgUrl] = useState<string>("");
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);

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
      onOpenChange(false);
      onCardCreated(); // Notify parent to refresh card list
    } catch (err: any) {
      console.error("Failed to create card:", err);
      alert("Failed to create card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingCard(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};

export default CreateCardModal;
