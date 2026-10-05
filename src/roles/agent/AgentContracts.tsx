import { useState, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { 
  contracts as initialContracts, 
  properties as initialProperties, 
  clients as initialClients 
} from "../../data/mockData"
import { Button, PageHeader, StatusBadge } from "../../components/ui"
import type { Contract, Property, Client, User } from "../../types"

interface AgentContractsProps {
  currentUser?: User
}

export default function AgentContracts({ currentUser }: AgentContractsProps) {
  // Estado local para los contratos
  const [contractsList, setContractsList] = useState<Contract[]>(initialContracts)
  const [propertiesList] = useState<Property[]>(initialProperties)
  const [clientsList] = useState<Client[]>(initialClients)

  // Usuario / Permisos
  const userRole = currentUser?.role || "agent"
  const canCreateContract = userRole === "admin" || userRole === "agent"

  // Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("Todos")
  const [typeFilter, setTypeFilter] = useState<string>("Todos")

  // Modales y Menú de Acciones
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewContractOpen, setIsNewContractOpen] = useState(false)

  // Formulario de edición
  const [editForm, setEditForm] = useState<Partial<Contract>>({})

  // Formulario de nuevo contrato
  const [newPropId, setNewPropId] = useState("")
  const [newClientId, setNewClientId] = useState("")
  const [newType, setNewType] = useState<"Venta" | "Alquiler">("Venta")
  const [newAmount, setNewAmount] = useState("")
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0])
  const [newStatus, setNewStatus] = useState<Contract["status"]>("Activo")

  // Referencia para impresión
  const printRef = useRef<HTMLDivElement>(null)

  // ---------------------------------------------------------------------------
  // 1. OBTENCIÓN DINÁMICA DE DATOS Y FILTRADO
  // ---------------------------------------------------------------------------
  
  // Filtrar contratos vinculados al agente actual (o todos si es admin)
  const myContracts = useMemo(() => {
    if (userRole === "admin") return contractsList
    return contractsList.filter((c) => c.agentId === "a-01")
  }, [contractsList, userRole])

  // Aplicar filtros dinámicos (Buscador + Estado + Tipo)
  const filteredContracts = useMemo(() => {
    return myContracts.filter((contract) => {
      const matchSearch =
        contract.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.client.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === "Todos" || contract.status === statusFilter

      const matchType =
        typeFilter === "Todos" || contract.type === typeFilter

      return matchSearch && matchStatus && matchType
    })
  }, [myContracts, searchQuery, statusFilter, typeFilter])

  // ---------------------------------------------------------------------------
  // 2. CÁLCULO DINÁMICO DE TARJETAS DE RESUMEN
  // ---------------------------------------------------------------------------
  const summary = useMemo(() => {
    const activeCount = myContracts.filter((c) => c.status === "Activo").length
    const completedCount = myContracts.filter((c) => c.status === "Completado").length
    const totalVolume = myContracts
      .filter((c) => c.status !== "Vencido")
      .reduce((sum, c) => sum + (c.amount || 0), 0)

    return { activeCount, completedCount, totalVolume }
  }, [myContracts])

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("Todos")
    setTypeFilter("Todos")
  }

  // ---------------------------------------------------------------------------
  // 3. ACCIONES Y MANEJADORES
  // ---------------------------------------------------------------------------
  const handleOpenDetail = (contract: Contract, edit: boolean = false) => {
    setSelectedContract(contract)
    setEditForm({ ...contract })
    setIsEditMode(edit)
    setIsDetailOpen(true)
    setActiveMenuId(null)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContract || !editForm) return

    setContractsList((prev) =>
      prev.map((item) =>
        item.id === selectedContract.id ? ({ ...item, ...editForm } as Contract) : item
      )
    )
    setSelectedContract({ ...selectedContract, ...editForm } as Contract)
    setIsEditMode(false)
  }

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPropId || !newClientId || !newAmount) return

    const matchedProp = propertiesList.find((p) => p.id === newPropId)
    const matchedClient = clientsList.find((c) => c.id === newClientId)

    const newContract: Contract = {
      id: `CT-2026-${Math.floor(100 + Math.random() * 900)}`,
      property: matchedProp ? matchedProp.title : "Propiedad Seleccionada",
      clientId: newClientId,
      client: matchedClient ? matchedClient.name : "Cliente Seleccionado",
      agentId: "a-01",
      agent: "Valeria Rojas",
      type: newType,
      amount: Number(newAmount) || 0,
      date: newDate,
      status: newStatus,
    }

    setContractsList([newContract, ...contractsList])
    setIsNewContractOpen(false)
    // Limpiar formulario
    setNewPropId("")
    setNewClientId("")
    setNewAmount("")
  }

  // Descarga simple de PDF mediante iframe de impresión o disparo nativo
  const handleDownloadPDF = (contract: Contract) => {
    setActiveMenuId(null)
    setSelectedContract(contract)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const handlePrint = (contract: Contract) => {
    setActiveMenuId(null)
    setSelectedContract(contract)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  // Obtener datos relacionados para la vista detallada
  const getRelatedProperty = (propName: string) =>
    propertiesList.find((p) => p.title === propName) || propertiesList[0]

  const getRelatedClient = (clientName: string) =>
    clientsList.find((c) => c.name === clientName) || clientsList[0]

  return (
    <div className="space-y-6">
      {/* Ocultar elementos de UI durante la impresión con reglas de medios CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-document, #print-document * {
            visibility: visible;
          }
          #print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ENCABEZADO DE PÁGINA */}
      <div className="no-print">
        <PageHeader
          eyebrow="Operaciones vinculadas"
          title="Mis contratos"
          description="Contratos donde me figuro como agente responsable."
          actions={
            canCreateContract ? (
              <Button icon="plus" onClick={() => setIsNewContractOpen(true)}>
                Nuevo contrato
              </Button>
            ) : undefined
          }
        />
      </div>

      {/* TARJETAS DE RESUMEN (CALCULADAS DINÁMICAMENTE) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#706B65]">
            Contratos activos
          </span>
          <p className="text-3xl font-bold font-serif text-[#1C1A19] mt-2">
            {summary.activeCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#706B65]">
            Contratos completados
          </span>
          <p className="text-3xl font-bold font-serif text-[#1C1A19] mt-2">
            {summary.completedCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#706B65]">
            Valor total negociado
          </span>
          <p className="text-3xl font-bold font-serif text-[#1C1A19] mt-2">
            S/ {summary.totalVolume.toLocaleString("es-PE")}
          </p>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="no-print flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E0D8]">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#706B65]">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, cliente o propiedad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8D2C7] bg-[#F7F5F0] text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#D8D2C7] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Completado">Completado</option>
            <option value="Borrador">Borrador</option>
            <option value="Vencido">Vencido</option>
          </select>

          {/* Filtro Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#D8D2C7] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
          </select>

          {(searchQuery || statusFilter !== "Todos" || typeFilter !== "Todos") && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-[#2D5A43] hover:underline px-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE CONTRATOS */}
      <div className="no-print rounded-2xl bg-white border border-[#E5E0D8] overflow-visible shadow-xs">
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-medium text-[#1C1A19]">
              No encontramos contratos que coincidan con tu búsqueda.
            </p>
            <p className="text-xs text-[#706B65] mt-1">
              Intenta cambiar los términos de búsqueda o limpiar los filtros seleccionados.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center text-xs font-bold text-[#2D5A43] hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0]/60 text-[11px] font-semibold uppercase tracking-wider text-[#706B65]">
                  <th className="py-3.5 px-5">Contrato</th>
                  <th className="py-3.5 px-5">Propiedad</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Tipo</th>
                  <th className="py-3.5 px-5">Importe</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] text-sm text-[#2C2A29]">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-[#F7F5F0]/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-bold font-serif text-[#1C1A19]">
                      {contract.id}
                    </td>
                    <td className="py-4 px-5 max-w-[220px] truncate font-medium">
                      {contract.property}
                    </td>
                    <td className="py-4 px-5 text-[#706B65]">
                      {contract.client}
                    </td>
                    <td className="py-4 px-5 font-medium">{contract.type}</td>
                    <td className="py-4 px-5 font-semibold text-[#1C1A19]">
                      S/ {contract.amount.toLocaleString("es-PE")}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="py-4 px-5 text-right relative">
                      {/* Botón de Menú ⋮ */}
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === contract.id ? null : contract.id
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-[#E5E0D8]/50 text-[#706B65] font-bold text-lg leading-none transition-colors"
                        title="Opciones"
                      >
                        ⋮
                      </button>

                      {/* Menú Desplegable */}
                      {activeMenuId === contract.id && (
                        <div
                          className="absolute right-5 top-12 z-50 w-48 rounded-xl bg-white border border-[#E5E0D8] shadow-lg py-1.5 text-left text-xs text-[#2C2A29]"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => handleOpenDetail(contract, false)}
                            className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] transition-colors font-medium flex items-center gap-2"
                          >
                            <span>👁️</span> Ver detalle
                          </button>

                          {contract.status === "Activo" && canCreateContract && (
                            <button
                              onClick={() => handleOpenDetail(contract, true)}
                              className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] transition-colors font-medium flex items-center gap-2"
                            >
                              <span>✏️</span> Editar / Estado
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadPDF(contract)}
                            className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] transition-colors font-medium flex items-center gap-2"
                          >
                            <span>📄</span> Descargar PDF
                          </button>

                          <button
                            onClick={() => handlePrint(contract)}
                            className="w-full text-left px-4 py-2 hover:bg-[#F7F5F0] transition-colors font-medium flex items-center gap-2 border-t border-[#E5E0D8]/60 mt-1 pt-1.5"
                          >
                            <span>🖨️</span> Imprimir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------------------
          MODAL DETALLE / EDICIÓN DEL CONTRATO
      --------------------------------------------------------------------------- */}
      {isDetailOpen && selectedContract && (
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 no-print">
            <div className="w-full max-w-3xl rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4 mb-6">
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Expediente Contratual
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-[#1C1A19]">
                    Contrato {selectedContract.id}
                  </h3>
                </div>
                <StatusBadge status={selectedContract.status} />
              </div>

              {!isEditMode ? (
                /* VISTA VER DETALLE */
                <div className="space-y-6">
                  {/* INFORMACIÓN DEL CONTRATO */}
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A43]">
                      Información del Contrato
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[#706B65] block">Código:</span>
                        <span className="font-bold text-[#1C1A19]">{selectedContract.id}</span>
                      </div>
                      <div>
                        <span className="text-[#706B65] block">Operación:</span>
                        <span className="font-semibold text-[#1C1A19]">{selectedContract.type}</span>
                      </div>
                      <div>
                        <span className="text-[#706B65] block">Fecha de firma:</span>
                        <span className="font-semibold text-[#1C1A19]">{selectedContract.date}</span>
                      </div>
                      <div>
                        <span className="text-[#706B65] block">Importe total:</span>
                        <span className="font-bold text-[#1C1A19] text-sm">
                          S/ {selectedContract.amount.toLocaleString("es-PE")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INFORMACIÓN DE LA PROPIEDAD */}
                  {(() => {
                    const prop = getRelatedProperty(selectedContract.property)
                    return (
                      <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A43]">
                          Información de la Propiedad
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="sm:col-span-2">
                            <span className="text-[#706B65] block">Título:</span>
                            <span className="font-semibold text-[#1C1A19]">{selectedContract.property}</span>
                            <span className="text-[#706B65] block mt-1">📍 {prop.district}, {prop.address}</span>
                          </div>
                          <div>
                            <span className="text-[#706B65] block">Código Inmueble:</span>
                            <span className="font-semibold text-[#1C1A19]">{prop.code}</span>
                            <span className="text-[#706B65] block mt-1">
                              {prop.area} m² · {prop.bedrooms} dorm. · {prop.bathrooms} baños
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* INFORMACIÓN DEL CLIENTE Y AGENTE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      const client = getRelatedClient(selectedContract.client)
                      return (
                        <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A43]">
                            Información del Cliente
                          </h4>
                          <p className="text-xs font-bold text-[#1C1A19]">{selectedContract.client}</p>
                          <p className="text-xs text-[#706B65]">DNI / Código: {client.code || "72849102"}</p>
                          <p className="text-xs text-[#706B65]">📞 {client.phone || "+51 964 123 456"}</p>
                          <p className="text-xs text-[#706B65]">✉️ {client.email || "cliente@ejemplo.com"}</p>
                        </div>
                      )
                    })()}

                    <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A43]">
                        Agente Responsable
                      </h4>
                      <p className="text-xs font-bold text-[#1C1A19]">{selectedContract.agent}</p>
                      <p className="text-xs text-[#706B65]">✉️ valeria@huancayork.pe</p>
                      <p className="text-xs text-[#706B65]">📞 +51 987 654 321</p>
                      <p className="text-xs text-[#706B65]">Huancayork SAC - Gestión Inmobiliaria</p>
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN DEL MODAL */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[#E5E0D8] gap-3">
                    <div className="flex items-center gap-2">
                      {selectedContract.status === "Activo" && canCreateContract && (
                        <Button variant="secondary" onClick={() => setIsEditMode(true)}>
                          Editar
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => handleDownloadPDF(selectedContract)}>
                        Descargar PDF
                      </Button>
                      <Button variant="secondary" onClick={() => handlePrint(selectedContract)}>
                        Imprimir
                      </Button>
                    </div>
                    <Button onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
                  </div>
                </div>
              ) : (
                /* MODO EDICIÓN */
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase text-[#706B65]">
                        Estado del Contrato
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value as Contract["status"] })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Completado">Completado</option>
                        <option value="Borrador">Borrador</option>
                        <option value="Vencido">Vencido</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase text-[#706B65]">
                        Monto del Contrato (S/)
                      </label>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm({ ...editForm, amount: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                    <Button variant="secondary" onClick={() => setIsEditMode(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar Cambios</Button>
                  </div>
                </form>
              )}

            </div>
          </div>,
          document.body
        )
      )}

      {/* ---------------------------------------------------------------------------
          MODAL REGISTRAR NUEVO CONTRATO
      --------------------------------------------------------------------------- */}
      {isNewContractOpen && (
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 no-print">
            <div className="w-full max-w-lg rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              <h3 className="mb-1 text-2xl font-bold font-serif text-[#1C1A19]">
                Nuevo Contrato
              </h3>
              <p className="mb-6 text-sm text-[#706B65]">
                Vincula un cliente existente con un inmueble de la cartera
              </p>

              <form onSubmit={handleCreateContract} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                    Propiedad
                  </label>
                  <select
                    value={newPropId}
                    onChange={(e) => setNewPropId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                  >
                    <option value="">-- Seleccionar propiedad --</option>
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.code}) - S/ {p.price.toLocaleString("es-PE")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                    Cliente
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                  >
                    <option value="">-- Seleccionar cliente --</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.preference})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                      Tipo de Operación
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as "Venta" | "Alquiler")}
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                    >
                      <option value="Venta">Venta</option>
                      <option value="Alquiler">Alquiler</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                      Estado Inicial
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Contract["status"])}
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Borrador">Borrador</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                      Importe Acordado (S/)
                    </label>
                    <input
                      type="number"
                      placeholder="Monto total"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-[#706B65]">
                      Fecha de Firma
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                  <Button variant="secondary" onClick={() => setIsNewContractOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Generar Contrato</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      )}

      {/* ---------------------------------------------------------------------------
          PLANTILLA DE IMPRESIÓN / DESCARGA PDF CORPORATIVA (Oculta en vista web)
      --------------------------------------------------------------------------- */}
      {selectedContract && (
        <div id="print-document" className="hidden print:block font-sans p-8">
          <div className="flex justify-between items-center border-b-2 border-[#2D5A43] pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1C1A19]">HUANCAYORK</h1>
              <p className="text-xs uppercase tracking-widest text-[#706B65]">Gestión Inmobiliaria S.A.C.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#706B65]">Código de Contrato</span>
              <p className="text-lg font-bold font-serif">{selectedContract.id}</p>
            </div>
          </div>

          <div className="mb-6 bg-[#F7F5F0] p-4 rounded-xl border border-[#E5E0D8]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2D5A43] mb-2">
              Resumen de la Operación
            </h2>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <strong>Tipo:</strong> {selectedContract.type}
              </div>
              <div>
                <strong>Estado:</strong> {selectedContract.status}
              </div>
              <div>
                <strong>Fecha:</strong> {selectedContract.date}
              </div>
              <div>
                <strong>Monto Transacción:</strong> S/ {selectedContract.amount.toLocaleString("es-PE")}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border border-[#E5E0D8] p-4 rounded-xl">
              <h3 className="font-bold text-[#2D5A43] uppercase mb-1">Propiedad Involucrada</h3>
              <p><strong>Título:</strong> {selectedContract.property}</p>
              {(() => {
                const prop = getRelatedProperty(selectedContract.property)
                return (
                  <p><strong>Ubicación:</strong> {prop.district}, {prop.address} (Código: {prop.code})</p>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#E5E0D8] p-4 rounded-xl">
                <h3 className="font-bold text-[#2D5A43] uppercase mb-1">Cliente Adquirente / Arrendatario</h3>
                <p><strong>Nombre:</strong> {selectedContract.client}</p>
                {(() => {
                  const client = getRelatedClient(selectedContract.client)
                  return (
                    <>
                      <p><strong>Teléfono:</strong> {client.phone}</p>
                      <p><strong>Correo:</strong> {client.email}</p>
                    </>
                  )
                })()}
              </div>

              <div className="border border-[#E5E0D8] p-4 rounded-xl">
                <h3 className="font-bold text-[#2D5A43] uppercase mb-1">Agente Responsable</h3>
                <p><strong>Agente:</strong> {selectedContract.agent}</p>
                <p><strong>Email:</strong> valeria@huancayork.pe</p>
                <p><strong>Empresa:</strong> Huancayork SAC</p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-[#E5E0D8] grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t border-black w-3/4 mx-auto pt-1 font-bold">Firma del Cliente</div>
            </div>
            <div>
              <div className="border-t border-black w-3/4 mx-auto pt-1 font-bold">Firma Agente Huancayork</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}