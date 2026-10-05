import { useState } from "react"
import { createPortal } from "react-dom"
import DataTable from "../../components/DataTable"
import { visits as initialVisits, properties, clients } from "../../data/mockData"
import { Button, PageHeader, StatusBadge } from "../../components/ui"
import type { Visit } from "../../types"

export default function AgentVisits() {
  const [visitsList, setVisitsList] = useState<Visit[]>(initialVisits)
  
  // Modales
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false)

  // Formulario para Nueva Visita
  const [newPropertyId, setNewPropertyId] = useState(properties[0]?.id || "")
  const [newClientId, setNewClientId] = useState(clients[0]?.id || "")
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")

  // Filtrar las visitas de Valeria Rojas (a-01)
  const mine = visitsList.filter((item) => item.agentId === "a-01")

  const handleUpdateVisit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisit) return

    setVisitsList((prev) =>
      prev.map((item) => (item.id === selectedVisit.id ? selectedVisit : item))
    )
    setSelectedVisit(null)
  }

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const propObj = properties.find((p) => p.id === newPropertyId)
    const clientObj = clients.find((c) => c.id === newClientId)

    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      propertyId: newPropertyId,
      property: propObj ? propObj.title : "Propiedad no encontrada",
      clientId: newClientId,
      client: clientObj ? clientObj.name : "Cliente no asignado",
      agentId: "a-01",
      agent: "Valeria Rojas",
      date: newDate || "Pendiente",
      time: newTime || "00:00",
      status: "Programada",
    }

    setVisitsList([newVisit, ...visitsList])
    setIsNewVisitOpen(false)
    setNewDate("")
    setNewTime("")
  }

  return (
    <>
      <PageHeader
        eyebrow="Agenda personal"
        title="Mis visitas"
        description="Confirma horarios y registra el resultado de cada recorrido."
        actions={
          <Button icon="plus" onClick={() => setIsNewVisitOpen(true)}>
            Nueva visita
          </Button>
        }
      />

      <DataTable
        headers={["Fecha", "Propiedad", "Cliente", "Estado", "Seguimiento"]}
        rows={mine.map((visit) => [
          <div key={`date-${visit.id}`}>
            <b>{visit.date}</b>
            <p className="text-xs text-[var(--accent)]">{visit.time}</p>
          </div>,
          visit.property,
          visit.client,
          <StatusBadge key={`badge-${visit.id}`} status={visit.status} />,
          <Button
            key={`btn-${visit.id}`}
            variant="secondary"
            onClick={() => setSelectedVisit(visit)}
          >
            Actualizar
          </Button>,
        ])}
      />

      {/* --- MODAL: ACTUALIZAR VISITA --- */}
      {selectedVisit &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              <h3 className="mb-1 text-2xl font-bold font-serif text-[#1C1A19]">
                Actualizar Visita
              </h3>
              <p className="mb-6 text-sm text-[#706B65]">
                {selectedVisit.property}
              </p>

              <form onSubmit={handleUpdateVisit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Estado
                  </label>
                  <select
                    value={selectedVisit.status}
                    onChange={(e) =>
                      setSelectedVisit({
                        ...selectedVisit,
                        status: e.target.value as Visit["status"],
                      })
                    }
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  >
                    <option value="Programada">Programada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Fecha
                  </label>
                  <input
                    type="text"
                    value={selectedVisit.date}
                    onChange={(e) =>
                      setSelectedVisit({ ...selectedVisit, date: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Hora
                  </label>
                  <input
                    type="text"
                    value={selectedVisit.time}
                    onChange={(e) =>
                      setSelectedVisit({ ...selectedVisit, time: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                  <Button variant="secondary" onClick={() => setSelectedVisit(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar Cambios</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* --- MODAL: NUEVA VISITA --- */}
      {isNewVisitOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              <h3 className="mb-1 text-2xl font-bold font-serif text-[#1C1A19]">
                Agendar Nueva Visita
              </h3>
              <p className="mb-6 text-sm text-[#706B65]">
                Registra una nueva cita para tu cliente
              </p>

              <form onSubmit={handleCreateVisit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Propiedad
                  </label>
                  <select
                    value={newPropertyId}
                    onChange={(e) => setNewPropertyId(e.target.value)}
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Cliente
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Fecha
                  </label>
                  <input
                    type="text"
                    placeholder="25 Jun 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Hora
                  </label>
                  <input
                    type="text"
                    placeholder="11:30"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                  <Button variant="secondary" onClick={() => setIsNewVisitOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Agendar Visita</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}