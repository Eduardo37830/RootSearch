import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from './role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  verifyCode: number;

  @Prop()
  verifyCodeExpiration: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpiration: Date;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles: Role[] | Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices para mejorar rendimiento
UserSchema.index({ email: 1 });
UserSchema.index({ verifyCode: 1 });
UserSchema.index({ resetPasswordToken: 1 });
