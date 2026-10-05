import { useState } from "react"
import { createPortal } from "react-dom"
import { properties as initialProperties } from "../../data/mockData"
import { Button, PageHeader, StatusBadge } from "../../components/ui"
import type { Property } from "../../types"

export default function AgentProperties() {
  const [propertiesList, setPropertiesList] = useState<Property[]>(initialProperties)

  // Modales
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false)

  // Formulario de edición
  const [editForm, setEditForm] = useState<Property | null>(null)

  // Formulario para Nueva Propiedad
  const [newTitle, setNewTitle] = useState("")
  const [newDistrict, setNewDistrict] = useState("El Tambo")
  const [newAddress, setNewAddress] = useState("Av. San Carlos")
  const [newPrice, setNewPrice] = useState("")
  const [newArea, setNewArea] = useState("")
  const [newBedrooms, setNewBedrooms] = useState("3")
  const [newBathrooms, setNewBathrooms] = useState("2")
  const [newImage, setNewImage] = useState("")

  // Filtrar propiedades asignadas
  const mine = propertiesList.filter((item) => item.agentId === "a-01")

  // Abrir modal de detalle
  const handleOpenDetail = (property: Property) => {
    setSelectedProperty(property)
    setEditForm({ ...property })
    setIsEditing(false)
  }

  // Guardar cambios editados
  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm) return

    setPropertiesList((prev) =>
      prev.map((item) => (item.id === editForm.id ? editForm : item))
    )
    setSelectedProperty(editForm)
    setIsEditing(false)
  }

  // Crear nueva propiedad
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault()

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      code: `HY-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle || "Nueva Propiedad",
      district: newDistrict,
      address: newAddress,
      price: Number(newPrice) || 0,
      operation: "Venta",
      status: "Disponible",
      bedrooms: Number(newBedrooms) || 0,
      bathrooms: Number(newBathrooms) || 0,
      area: Number(newArea) || 100,
      image:
        newImage.trim() ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      agentId: "a-01",
      agentName: "Valeria Rojas",
    }

    setPropertiesList([newProp, ...propertiesList])
    setIsNewPropertyOpen(false)
    setNewTitle("")
    setNewPrice("")
    setNewArea("")
    setNewImage("")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cartera asignada"
        title="Mis propiedades"
        description="Consulta y actualiza los inmuebles que tienes bajo responsabilidad."
        actions={
          <Button icon="plus" onClick={() => setIsNewPropertyOpen(true)}>
            Registrar propiedad
          </Button>
        }
      />

      {/* Lista de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mine.map((property) => (
          <div
            key={property.id}
            className="flex flex-col rounded-2xl bg-white border border-[#E5E0D8] overflow-hidden shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full overflow-hidden bg-[#F7F5F0]">
              <img
                src={property.image}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <StatusBadge status={property.status} />
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#706B65] mb-1">
                  <span className="font-semibold uppercase tracking-wider">
                    {property.operation} · {property.code}
                  </span>
                  <span>{property.area} m²</span>
                </div>
                <h3 className="text-lg font-bold font-serif text-[#1C1A19] leading-snug">
                  {property.title}
                </h3>
                <p className="text-xs text-[#706B65] mt-1 flex items-center gap-1">
                  <span>📍</span> {property.district}, {property.address}
                </p>
                {property.bedrooms > 0 && (
                  <p className="text-xs text-[#706B65] mt-2">
                    {property.bedrooms} dormitorios · {property.bathrooms} baños
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D8]">
                <p className="text-lg font-bold text-[#1C1A19]">
                  S/ {property.price.toLocaleString("es-PE")}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handleOpenDetail(property)}
                >
                  Ver detalle
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETALLE / EDICIÓN */}
      {selectedProperty && editForm &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    {selectedProperty.code} · {selectedProperty.operation}
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-[#1C1A19]">
                    {isEditing ? "Editar Ficha Técnica" : selectedProperty.title}
                  </h3>
                </div>
                <StatusBadge status={selectedProperty.status} />
              </div>

              <div className="h-52 w-full rounded-xl overflow-hidden mb-6 bg-slate-200">
                <img
                  src={isEditing ? editForm.image : selectedProperty.image}
                  alt={selectedProperty.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white border border-[#E5E0D8]">
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Precio</p>
                      <p className="text-lg font-bold text-[#1C1A19]">
                        S/ {selectedProperty.price.toLocaleString("es-PE")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Área</p>
                      <p className="text-sm font-semibold text-[#1C1A19]">{selectedProperty.area} m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Distrito</p>
                      <p className="text-sm font-semibold text-[#1C1A19]">{selectedProperty.district}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Dormitorios</p>
                      <p className="text-sm font-semibold text-[#1C1A19]">{selectedProperty.bedrooms || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Baños</p>
                      <p className="text-sm font-semibold text-[#1C1A19]">{selectedProperty.bathrooms || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706B65] uppercase tracking-wider">Agente</p>
                      <p className="text-sm font-semibold text-[#1C1A19]">{selectedProperty.agentName}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]">
                    <Button variant="secondary" onClick={() => setSelectedProperty(null)}>
                      Cerrar
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      Editar datos
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProperty} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Título del Inmueble
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Estado
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value as Property["status"],
                          })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Reservada">Reservada</option>
                        <option value="Vendida">Vendida</option>
                        <option value="Alquilada">Alquilada</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Precio (S/)
                      </label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Distrito
                      </label>
                      <input
                        type="text"
                        value={editForm.district}
                        onChange={(e) =>
                          setEditForm({ ...editForm, district: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Área (m²)
                      </label>
                      <input
                        type="number"
                        value={editForm.area}
                        onChange={(e) =>
                          setEditForm({ ...editForm, area: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Dormitorios
                      </label>
                      <input
                        type="number"
                        value={editForm.bedrooms}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bedrooms: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        Baños
                      </label>
                      <input
                        type="number"
                        value={editForm.bathrooms}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bathrooms: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                        URL de la Imagen
                      </label>
                      <input
                        type="text"
                        value={editForm.image}
                        onChange={(e) =>
                          setEditForm({ ...editForm, image: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar Cambios</Button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* MODAL REGISTRAR PROPIEDAD */}
      {isNewPropertyOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 shadow-2xl border border-[#E5E0D8] text-[#2C2A29] max-h-[90vh] overflow-y-auto">
              <h3 className="mb-1 text-2xl font-bold font-serif text-[#1C1A19]">
                Registrar Inmueble
              </h3>
              <p className="mb-6 text-sm text-[#706B65]">
                Agrega una nueva propiedad a tu cartera asignada
              </p>

              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    Título de la propiedad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Departamento moderno en San Carlos"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Distrito
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. El Tambo"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Dirección
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Av. San Carlos"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      placeholder="250000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Habitaciones
                    </label>
                    <input
                      type="number"
                      value={newBedrooms}
                      onChange={(e) => setNewBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                      Baños
                    </label>
                    <input
                      type="number"
                      value={newBathrooms}
                      onChange={(e) => setNewBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full rounded-xl border border-[#D8D2C7] bg-white p-3 text-sm text-[#2C2A29] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8] mt-6">
                  <Button variant="secondary" onClick={() => setIsNewPropertyOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar Propiedad</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}