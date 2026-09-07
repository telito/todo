import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
  description: string;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  finishDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    description: { type: String, required: true, trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    finishDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
