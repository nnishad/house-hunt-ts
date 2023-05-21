import { Document, Schema, model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  // ... add more fields if needed
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // ... define other fields in the schema
});

const User = model<IUser>('User', userSchema);

export default User;
