import { Injectable } from '@nestjs/common';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
}

@Injectable()
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      stock: 50,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest smartphone model',
      price: 699.99,
      stock: 100,
      createdAt: new Date(),
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  create(data: Partial<Product>): Product {
    const newProduct: Product = {
      id: String(this.products.length + 1),
      name: data.name ?? '',
      description: data.description ?? '',
      price: data.price ?? 0,
      stock: data.stock ?? 0,
      createdAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: string, data: Partial<Product>): Product | null {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  remove(id: string): { deleted: boolean } {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return { deleted: false };
    this.products.splice(index, 1);
    return { deleted: true };
  }
}
