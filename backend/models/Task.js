import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: {
      type: String,
      enum: ["ALTA", "MEDIA", "BAJA"],
      default: "MEDIA",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDIENTE", "EN_PROGRESO", "COMPLETADA"],
      default: "PENDIENTE",
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
