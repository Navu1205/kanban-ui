import { CardStatus } from "@/lib/api/card.api";

export const CARD_STATUS_OPTIONS: CardStatus[] = ["TODO", "IN_PROGRESS", "QA", "DONE"];

export const getStatusPillColor = (status: CardStatus): string => {
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
