import httpClient from "./httpClient";

export type CardStatus = "TODO" | "IN_PROGRESS" | "QA" | "DONE";

export interface Card {
  id: number;
  title: string;
  description?: string;
  imgUrl?: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateCardDto {
  title: string;
  description?: string;
  imgUrl?: string;
  status?: CardStatus; // Optional for creation, as it has a default
}

interface UpdateCardDto {
  title?: string;
  description?: string;
  imgUrl?: string;
  status?: CardStatus;
}

export const createCard = async (cardData: CreateCardDto): Promise<Card> => {
  const response = await httpClient.post<Card>("/cards", cardData);
  return response.data;
};

export const getCards = async (): Promise<Card[]> => {
  const response = await httpClient.get<Card[]>("/cards");
  return response.data;
};

export const getCardById = async (id: number): Promise<Card> => {
  const response = await httpClient.get<Card>(`/cards/${id}`);
  return response.data;
};

export const updateCard = async (
  id: number,
  cardData: UpdateCardDto
): Promise<Card> => {
  const response = await httpClient.patch<Card>(`/cards/${id}`, cardData);
  return response.data;
};

export const deleteCard = async (id: number): Promise<void> => {
  await httpClient.delete(`/cards/${id}`);
};

export const deleteAllCards = async (): Promise<void> => {
  await httpClient.delete('/cards');
};
