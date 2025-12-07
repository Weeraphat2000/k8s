export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
}

export interface UpdateOrderDto {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}
