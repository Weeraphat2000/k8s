import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
