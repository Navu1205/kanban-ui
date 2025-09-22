/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Card, CardStatus, updateCard } from "@/lib/api/card.api";
import { CARD_STATUS_OPTIONS } from "@/lib/kanban.utils";

interface UpdateCardModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onCardUpdated: () => void;
}

const UpdateCardModal: React.FC<UpdateCardModalProps> = ({
  isOpen,
  onOpenChange,
  card,
  onCardUpdated,
}) => {
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedImgUrl, setEditedImgUrl] = useState<string>("");
  const [editedStatus, setEditedStatus] = useState<CardStatus>("TODO");
  const [editedAssigneeName, setEditedAssigneeName] = useState<string>(""); // New state for assignee name
  const [editedStoryPoints, setEditedStoryPoints] = useState<number | undefined>(undefined); // New state for story points
  const [isUpdatingCard, setIsUpdatingCard] = useState<boolean>(false);

  useEffect(() => {
    if (card) {
      setEditedTitle(card.title);
      setEditedDescription(card.description || "");
      setEditedImgUrl(card.imgUrl || "");
      setEditedStatus(card.status);
      setEditedAssigneeName(card.assigneeName || "");
      setEditedStoryPoints(card.storyPoints ?? undefined); // Handle null for storyPoints
    } else {
      // Reset fields when modal closes or no card is selected
      setEditedTitle("");
      setEditedDescription("");
      setEditedImgUrl("");
      setEditedStatus("TODO");
      setEditedAssigneeName("");
      setEditedStoryPoints(undefined);
    }
  }, [card]);

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setIsUpdatingCard(true);
    try {
      await updateCard(card.id, {
        title: editedTitle,
        description: editedDescription || undefined,
        imgUrl: editedImgUrl || undefined,
        status: editedStatus,
        assigneeName: editedAssigneeName || undefined,
        storyPoints: editedStoryPoints,
      });
      onOpenChange(false);
      onCardUpdated(); // Notify parent to refresh card list
    } catch (err: any) {
      console.error("Failed to update card:", err);
      alert("Failed to update card: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingCard(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Make changes to your card here. Click save when you&apos;re done.
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
            <Label htmlFor="edit-assigneeName" className="text-right">
              Assignee Name
            </Label>
            <Input
              id="edit-assigneeName"
              value={editedAssigneeName}
              onChange={(e) => setEditedAssigneeName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-storyPoints" className="text-right">
              Story Points
            </Label>
            <Input
              id="edit-storyPoints"
              type="number"
              value={editedStoryPoints ?? ""} // Use nullish coalescing for value
              onChange={(e) => setEditedStoryPoints(e.target.value === "" ? undefined : Number(e.target.value))}
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
  );
};

export default UpdateCardModal;