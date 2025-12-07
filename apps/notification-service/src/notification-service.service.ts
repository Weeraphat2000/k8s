import { Injectable } from '@nestjs/common';

interface Item {
  id: string;
  [key: string]: any;
}

@Injectable()
export class NotificationServiceService {
  private items: Item[] = [];
  private podName = process.env.HOSTNAME || 'unknown';

  ping(): string {
    console.log(`[${this.podName}] Received ping request`);
    return `pong from ${this.podName}`;
  }

  getItems() {
    return this.items;
  }

  getItem(id: string) {
    return this.items.find((item) => item.id === id);
  }

  createItem(data: Record<string, any>) {
    const newItem: Item = { id: Date.now().toString(), ...data };
    this.items.push(newItem);
    return newItem;
  }

  updateItem(payload: { id: string; data: Record<string, any> }) {
    const index = this.items.findIndex((item) => item.id === payload.id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...payload.data };
      return this.items[index];
    }
    return null;
  }

  deleteItem(id: string) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }
}
