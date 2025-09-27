import { Router } from "express";
import Task from "../models/Task.js";
import mongoose from "mongoose";

const router = Router();

/** Crear */
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title?.trim())
      return res.status(400).json({ error: "title es requerido" });

    const created = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      priority: (priority || "MEDIA").toUpperCase(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/** Listar con filtros + paginación */
router.get("/", async (req, res) => {
  try {
    const {
      q,
      priority,
      status,
      from,
      to,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (q)
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    if (priority) filter.priority = priority.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/** Obtener por id */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "id inválido" });
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: "No encontrada" });
  res.json(task);
});

/** Actualizar */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "id inválido" });

    const { title, description, priority, status, dueDate } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (priority !== undefined) updates.priority = priority.toUpperCase();
    if (status !== undefined) updates.status = status.toUpperCase();
    if (dueDate !== undefined)
      updates.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "No encontrada" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/** Eliminar */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "id inválido" });
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "No encontrada" });
  res.json({ ok: true });
});

export default router;
