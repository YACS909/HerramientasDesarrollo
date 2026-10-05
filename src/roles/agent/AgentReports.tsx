import { useState, useMemo } from "react"
import { contracts } from "../../data/mockData"
import { exportCsv, money } from "../../utils/format"
import DataTable from "../../components/DataTable"
import MetricCard from "../../components/MetricCard"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AgentReports() {
  // 1. Filtrar los contratos correspondientes al agente logueado
  const rawMine = useMemo(() => {
    return contracts.filter((item) => item.agentId === "a-01")
  }, [])

  // 2. Opciones dinámicas para filtros basadas estrictamente en la DB (Contract)
  const statusOptions = useMemo(() => {
    return Array.from(new Set(rawMine.map((item) => item.status).filter(Boolean)))
  }, [rawMine])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(rawMine.map((item) => item.type).filter(Boolean)))
  }, [rawMine])

  // 3. Estados de los filtros
  const [period, setPeriod] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")

  // 4. Limpiar todos los filtros
  const handleResetFilters = () => {
    setPeriod("all")
    setFromDate("")
    setToDate("")
    setStatus("all")
    setType("all")
  }

  // 5. Filtrado combinado (Periodo, Fechas, Estado y Tipo)
  const filteredContracts = useMemo(() => {
    return rawMine.filter((item) => {
      const itemDate = new Date(item.date)
      const now = new Date()

      // Filtro por Estado ("Activo" | "Completado" | "Borrador" | "Vencido")
      if (status !== "all" && item.status !== status) return false

      // Filtro por Tipo ("Venta" | "Alquiler")
      if (type !== "all" && item.type !== type) return false

      // Filtro por Período
      if (period === "this_month") {
        const isSameMonth =
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        if (!isSameMonth) return false
      } else if (period === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const isLastMonth =
          itemDate.getMonth() === lastMonth.getMonth() &&
          itemDate.getFullYear() === lastMonth.getFullYear()
        if (!isLastMonth) return false
      } else if (period === "this_year") {
        if (itemDate.getFullYear() !== now.getFullYear()) return false
      } else if (period === "custom") {
        if (fromDate && itemDate < new Date(fromDate)) return false
        if (toDate && itemDate > new Date(toDate)) return false
      }

      return true
    })
  }, [rawMine, period, fromDate, toDate, status, type])

  // 6. Recálculo dinámico de indicadores KPI
  const totalVolume = useMemo(() => {
    return filteredContracts.reduce((sum, item) => sum + (item.amount || 0), 0)
  }, [filteredContracts])

  const totalContracts = filteredContracts.length

  const conversionRate = useMemo(() => {
    if (filteredContracts.length === 0) return "0%"
    const completed = filteredContracts.filter(
      (item) => item.status === "Completado" || item.status === "Activo"
    ).length
    const rate = Math.round((completed / filteredContracts.length) * 100)
    return `${rate}%`
  }, [filteredContracts])

  // 7. Exportación a CSV
  const download = () =>
    exportCsv(
      "ventas-valeria-rojas.csv",
      filteredContracts.map((item) => ({
        Contrato: item.id,
        Fecha: item.date,
        Propiedad: item.property,
        Cliente: item.client,
        Tipo: item.type,
        Importe: item.amount,
        Estado: item.status,
      }))
    )

  return (
    <>
      <PageHeader
        eyebrow="Rendimiento individual"
        title="Mis resultados"
        description="Resumen de tus operaciones y archivo exportable para impresión o análisis."
        actions={
          <Button
            icon="download"
            onClick={download}
            disabled={filteredContracts.length === 0}
          >
            Exportar mis ventas
          </Button>
        }
      />

      {/* BARRA DE FILTROS */}
      <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50/60 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Período */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
              >
                <option value="all">Todos los períodos</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes anterior</option>
                <option value="this_year">Año actual</option>
                <option value="custom">Rango personalizado</option>
              </select>
            </div>

            {/* Rango de Fechas (Solo si Período = 'custom') */}
            {period === "custom" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Rango de fechas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Estado (Coincide con status de Contract) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
              >
                <option value="all">Todos los estados</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Operación (Coincide con type de Contract) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Tipo de operación
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
              >
                <option value="all">Todos los tipos</option>
                {typeOptions.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón Limpiar Filtros */}
          <button
            onClick={handleResetFilters}
            className="text-xs font-medium text-stone-500 underline transition-colors hover:text-stone-800"
          >
            Limpiar todos los filtros
          </button>
        </div>
      </div>

      {/* TARJETAS DE RESULTADOS (KPIs) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Volumen total"
          value={money(totalVolume)}
          note="Acumulado filtrado"
          icon="chart"
        />
        <MetricCard
          label="Contratos"
          value={String(totalContracts)}
          note="Asociados a tu cuenta"
          icon="file"
          tone="accent"
        />
        <MetricCard
          label="Conversión"
          value={conversionRate}
          note="Visita a cierre"
          icon="badge"
          tone="gold"
        />
      </div>

      {/* TABLA DE RESULTADOS O ESTADO VACÍO PROFESIONAL */}
      {filteredContracts.length > 0 ? (
        <DataTable
          headers={[
            "Contrato",
            "Fecha",
            "Propiedad",
            "Cliente",
            "Importe",
            "Estado",
          ]}
          rows={filteredContracts.map((item) => [
            item.id,
            item.date,
            item.property,
            item.client,
            <b>{money(item.amount)}</b>,
            <StatusBadge status={item.status} />,
          ])}
        />
      ) : (
        <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
          <div className="mb-3 rounded-full bg-stone-200/60 p-3 text-stone-500">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-stone-800">
            No se encontraron operaciones
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            No hay contratos registrados que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </>
  )
}