import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date(),
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(data: Partial<User>): User {
    const newUser: User = {
      id: String(this.users.length + 1),
      name: data.name ?? '',
      email: data.email ?? '',
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, data: Partial<User>): User | null {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  remove(id: string): { deleted: boolean } {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return { deleted: false };
    this.users.splice(index, 1);
    return { deleted: true };
  }
}
