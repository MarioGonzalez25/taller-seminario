import { useEffect, useMemo, useState } from "react";
import api from "./api";
import "./styles.css";

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA"];
const LABEL = {
  ALTA: "Prioridad Alta",
  MEDIA: "Prioridad Media",
  BAJA: "Prioridad Baja",
};

function Badge({ value }) {
  const v = (value || "MEDIA").toUpperCase();
  const cls = v === "ALTA" ? "alta" : v === "BAJA" ? "baja" : "media";
  return <span className={`badge ${cls}`}>{LABEL[v]}</span>;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [title, setTitle] = useState("");
  const [prio, setPrio] = useState("BAJA"); // como tu maqueta

  // filtros
  const [fStatus, setFStatus] = useState("TODAS");
  const [fPrio, setFPrio] = useState("TODAS");

  async function load() {
    const { data } = await api.get("/api/tasks?sort=-createdAt&limit=200");
    const items = data.items || data;
    setTasks(items);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await api.post("/api/tasks", { title, priority: prio });
    setTasks((prev) => [data, ...prev]);
    setTitle("");
    setPrio("BAJA");
  }

  async function toggleDone(t) {
    const next = t.status === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA";
    const { data } = await api.put(`/api/tasks/${t._id}`, { status: next });
    setTasks((prev) => prev.map((x) => (x._id === t._id ? data : x)));
  }

  async function removeTask(id) {
    await api.delete(`/api/tasks/${id}`);
    setTasks((prev) => prev.filter((x) => x._id !== id));
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const comp = tasks.filter((t) => t.status === "COMPLETADA").length;
    return { total, comp, pend: total - comp };
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (fStatus !== "TODAS" && t.status !== fStatus) return false;
      if (fPrio !== "TODAS" && t.priority !== fPrio) return false;
      return true;
    });
  }, [tasks, fStatus, fPrio]);

  return (
    <div className="container">
      {/* CABECERA */}
      <div className="header">
        <h1>📄 TaskMaster</h1>
        <p>Organiza tus tareas de manera eficiente</p>
      </div>

      {/* CONTADORES */}
      <div className="stats">
        <div className="stat">
          <span className="num">{stats.total}</span>
          <span className="label">Total</span>
        </div>
        <div className="stat">
          <span className="num">{stats.comp}</span>
          <span className="label">Completadas</span>
        </div>
        <div className="stat">
          <span className="num">{stats.pend}</span>
          <span className="label">Pendientes</span>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={addTask} className="toolbar">
        <input
          className="input"
          placeholder="Escribe tu nueva tarea..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="select"
          value={prio}
          onChange={(e) => setPrio(e.target.value)}
        >
          <option value="BAJA">Prioridad Baja</option>
          <option value="MEDIA">Prioridad Media</option>
          <option value="ALTA">Prioridad Alta</option>
        </select>
        <button className="btn" type="submit">
          ＋ Agregar Tarea
        </button>
      </form>

      {/* FILTROS */}
      <div className="filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>
            Filtrar por:
          </span>
          <select
            className="select"
            value={fStatus}
            onChange={(e) => setFStatus(e.target.value)}
          >
            <option value="TODAS">Todas las tareas</option>
            <option value="PENDIENTE">Solo pendientes</option>
            <option value="COMPLETADA">Solo completadas</option>
          </select>
          <select
            className="select"
            value={fPrio}
            onChange={(e) => setFPrio(e.target.value)}
          >
            <option value="TODAS">Todas las prioridades</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="icon">📋</div>
          <h3>No hay tareas todavía</h3>
          <p>¡Agrega tu primera tarea para comenzar!</p>
        </div>
      ) : (
        <div className="list">
          {filtered.map((t) => (
            <div className="item" key={t._id}>
              <div className="left">
                <Badge value={t.priority} />
                <div>
                  <h3
                    style={{
                      textDecoration:
                        t.status === "COMPLETADA" ? "line-through" : "none",
                    }}
                  >
                    {t.title}
                  </h3>
                  {t.dueDate && (
                    <p style={{ margin: 0, color: "#64748b" }}>
                      Vence: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="actions">
                <button className="done" onClick={() => toggleDone(t)}>
                  {t.status === "COMPLETADA"
                    ? "Marcar pendiente"
                    : "Marcar completada"}
                </button>
                <button onClick={() => removeTask(t._id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
