import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Method } from '../enums/method.enum';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(Method),
    required: true,
  })
  method: Method;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
