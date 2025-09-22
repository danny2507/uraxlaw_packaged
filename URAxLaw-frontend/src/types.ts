// src/types.ts

/**
 * Defines the possible senders of a message in the chat.
 */
export type Sender = 'user' | 'bot';

/**
 * Represents a single message object in the chat history.
 */
export interface Message {
    id: string;      // A unique identifier for each message, useful for React keys.
    sender: Sender;  // Who sent the message ('user' or 'bot').
    content: string; // The text or HTML content of the message.
}