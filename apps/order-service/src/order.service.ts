import { Injectable } from '@nestjs/common';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

@Injectable()
export class OrderService {
  private orders: Order[] = [
    {
      id: '1',
      userId: '1',
      items: [{ productId: '1', quantity: 1, price: 999.99 }],
      totalAmount: 999.99,
      status: 'confirmed',
      createdAt: new Date(),
    },
    {
      id: '2',
      userId: '2',
      items: [{ productId: '2', quantity: 2, price: 699.99 }],
      totalAmount: 1399.98,
      status: 'pending',
      createdAt: new Date(),
    },
  ];

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id);
  }

  create(data: Partial<Order>): Order {
    const items = data.items ?? [];
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const newOrder: Order = {
      id: String(this.orders.length + 1),
      userId: data.userId ?? '',
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  update(id: string, data: Partial<Order>): Order | null {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return null;
    this.orders[index] = { ...this.orders[index], ...data };
    return this.orders[index];
  }

  remove(id: string): { deleted: boolean } {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return { deleted: false };
    this.orders.splice(index, 1);
    return { deleted: true };
  }
}
