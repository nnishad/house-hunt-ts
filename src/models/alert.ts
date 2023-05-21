import { Document, Schema, model } from 'mongoose';

interface IAlert extends Document {
  locationIdentifier: string;
  radius: string;
  maxPrice: string;
  minBedrooms: string;
  letFurnishType: string;
  taggedUsers: string[];
}

const alertSchema = new Schema<IAlert>({
  locationIdentifier: { type: String, required: true },
  radius: { type: String, required: true },
  maxPrice: { type: String, required: true },
  minBedrooms: { type: String, required: true },
  letFurnishType: { type: String, required: true },
  taggedUsers: { type: [String], required: false },
});

const Alert = model<IAlert>('Alert', alertSchema);

export default Alert;
