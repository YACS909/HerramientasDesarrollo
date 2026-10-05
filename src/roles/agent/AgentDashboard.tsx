import MetricCard from "../../components/MetricCard"
import DataTable from "../../components/DataTable"
import {
  agents,
  contracts,
  properties,
  visits,
} from "../../data/mockData"
import { money } from "../../utils/format"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"

export default function AgentDashboard({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  // ============================================================
  // AGENTE ACTUAL
  // ============================================================

  const agentId = "a-01"

  const currentAgent = agents.find(
    (agent) => agent.id === agentId
  )

  if (!currentAgent) {
    return null
  }

  // ============================================================
  // DATOS DEL AGENTE
  // ============================================================

  const myProperties = properties.filter(
    (property) => property.agentId === agentId
  )

  const myVisits = visits.filter(
    (visit) => visit.agentId === agentId
  )

  const myContracts = contracts.filter(
    (contract) => contract.agentId === agentId
  )

  // ============================================================
  // RESUMEN DE CARTERA
  // ============================================================

  const availableProperties = myProperties.filter(
    (property) => property.status === "Disponible"
  ).length

  const reservedProperties = myProperties.filter(
    (property) => property.status === "Reservada"
  ).length

  const soldProperties = myProperties.filter(
    (property) => property.status === "Vendida"
  ).length

  const rentedProperties = myProperties.filter(
    (property) => property.status === "Alquilada"
  ).length

  // ============================================================
  // VISITAS
  // ============================================================

  const confirmedVisits = myVisits.filter(
    (visit) => visit.status === "Confirmada"
  ).length

  const pendingVisits = myVisits.filter(
    (visit) => visit.status === "Programada"
  ).length

  // ============================================================
  // OBJETIVO MENSUAL
  //
  // Se mantienen los valores actuales del dashboard.
  // No se agregan propiedades nuevas al Agent.
  // ============================================================

  const monthlyGoal = 10
  const currentSales = currentAgent.sales

  const progress = Math.min(
    (currentSales / monthlyGoal) * 100,
    100
  )

  const remainingOperations = Math.max(
    monthlyGoal - currentSales,
    0
  )

  // ============================================================
  // VOLUMEN GESTIONADO
  // ============================================================

  const contractVolume = myContracts.reduce(
    (sum, contract) => sum + contract.amount,
    0
  )

  // ============================================================
  // COMISIÓN
  //
  // Se mantiene el valor que ya utilizaba tu dashboard.
  // ============================================================

  const estimatedCommission = 24600

  // ============================================================
  // GRÁFICO DE RENDIMIENTO
  //
  // Agrupamos los contratos existentes por mes.
  // No necesitamos modificar mockData.
  // ============================================================

  const monthlyData = [
    {
      month: "Abr",
      value: 0,
    },
    {
      month: "May",
      value: myContracts
        .filter((contract) => contract.date.includes("May"))
        .reduce((sum, contract) => sum + contract.amount, 0),
    },
    {
      month: "Jun",
      value: myContracts
        .filter((contract) => contract.date.includes("Jun"))
        .reduce((sum, contract) => sum + contract.amount, 0),
    },
  ]

  const maxMonthlyValue = Math.max(
    ...monthlyData.map((item) => item.value),
    1
  )

  // ============================================================
  // AGENDA
  // ============================================================

  const upcomingVisits = myVisits.slice(0, 3)

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          CABECERA
          ======================================================== */}

      <PageHeader
        eyebrow="Espacio de agente"
        title={`Hola, ${currentAgent.name.split(" ")[0]}`}
        description="Prioridades, agenda y avance de tu cartera comercial."
        actions={
          <Button
            onClick={() => onNavigate("visits")}
            icon="calendar"
          >
            Abrir agenda
          </Button>
        }
      />

      {/* ========================================================
          MÉTRICAS PRINCIPALES
          ======================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* PROPIEDADES */}

        <button
          type="button"
          onClick={() => onNavigate("portfolio")}
          className="text-left transition-transform hover:-translate-y-0.5"
        >
          <MetricCard
            label="Propiedades asignadas"
            value={String(myProperties.length)}
            note={`${availableProperties} disponibles`}
            icon="building"
          />
        </button>

        {/* VISITAS */}

        <MetricCard
          label="Visitas próximas"
          value={String(myVisits.length)}
          note={`${confirmedVisits} confirmadas`}
          icon="calendar"
          tone="accent"
        />

        {/* VENTAS */}

        <MetricCard
          label="Ventas del periodo"
          value={String(currentSales)}
          note={`Objetivo: ${monthlyGoal} ventas`}
          icon="chart"
          tone="gold"
        />

        {/* COMISIÓN */}

        <MetricCard
          label="Comisión estimada"
          value={money(estimatedCommission)}
          note="+12% este mes"
          icon="badge"
          tone="info"
        />
      </div>

      {/* ========================================================
          RESUMEN DE CARTERA
          ======================================================== */}

      <Card className="mt-6 p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Resumen de cartera
            </p>

            <h2 className="font-display mt-2 text-xl font-bold">
              Propiedades asignadas
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Distribución actual de las propiedades bajo tu gestión.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => onNavigate("portfolio")}
          >
            Ver mi cartera
          </Button>

        </div>

        {/* DISTRIBUCIÓN */}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Disponibles
            </p>

            <p className="font-display mt-1 text-2xl font-bold">
              {availableProperties}
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Reservadas
            </p>

            <p className="font-display mt-1 text-2xl font-bold">
              {reservedProperties}
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Vendidas
            </p>

            <p className="font-display mt-1 text-2xl font-bold">
              {soldProperties}
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Alquiladas
            </p>

            <p className="font-display mt-1 text-2xl font-bold">
              {rentedProperties}
            </p>
          </div>

        </div>
      </Card>

      {/* ========================================================
          OBJETIVO + AGENDA
          ======================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">

        {/* ======================================================
            OBJETIVO MENSUAL
            ====================================================== */}

        <Card className="p-6">

          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Objetivo mensual
          </p>

          <h2 className="font-display mt-2 text-2xl font-bold">
            {currentSales} de {monthlyGoal} operaciones
          </h2>

          {/* BARRA DE PROGRESO */}

          <div className="my-6 h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* INFORMACIÓN DEL OBJETIVO */}

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs text-[var(--muted)]">
                Cumplimiento
              </p>

              <p className="font-display mt-1 text-xl font-bold">
                {Math.round(progress)}%
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs text-[var(--muted)]">
                Operaciones restantes
              </p>

              <p className="font-display mt-1 text-xl font-bold">
                {remainingOperations}
              </p>
            </div>

          </div>

          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            {remainingOperations > 0
              ? `Te faltan ${remainingOperations} ${
                  remainingOperations === 1
                    ? "operación"
                    : "operaciones"
                } para alcanzar tu meta mensual.`
              : "Has alcanzado tu meta mensual."}
          </p>

          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => onNavigate("reports")}
          >
            Ver resultados
          </Button>

        </Card>

        {/* ======================================================
            AGENDA INMEDIATA
            ====================================================== */}

        <div>

          <div className="mb-4 flex items-center justify-between">

            <h2 className="font-display text-xl font-bold">
              Agenda inmediata
            </h2>

            <button
              type="button"
              onClick={() => onNavigate("visits")}
              className="text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              Ver agenda
            </button>

          </div>

          <DataTable
            headers={[
              "Fecha",
              "Propiedad",
              "Cliente",
              "Estado",
            ]}
            rows={upcomingVisits.map((visit) => [
              <b key={`date-${visit.id}`}>
                {visit.date} · {visit.time}
              </b>,

              visit.property,

              visit.client,

              <StatusBadge
                key={`status-${visit.id}`}
                status={visit.status}
              />,
            ])}
          />

          {/* RESUMEN DE VISITAS */}

          <div className="mt-3 flex justify-end">
            <p className="text-xs text-[var(--muted)]">
              {pendingVisits} visitas pendientes de confirmación
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================
          RESUMEN FINANCIERO
          ======================================================== */}

      <Card className="mt-6 p-6">

        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Resumen financiero
              </p>

              <h2 className="font-display mt-2 text-xl font-bold">
                Comisión estimada
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Estimación asociada a las operaciones gestionadas.
              </p>
            </div>

            <p className="font-display text-2xl font-bold text-[var(--brand)]">
              {money(estimatedCommission)}
            </p>

          </div>

          {/* INFORMACIÓN FINANCIERA */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            <div className="rounded-xl bg-[var(--surface-soft)] p-4">

              <p className="text-xs text-[var(--muted)]">
                Volumen gestionado
              </p>

              <p className="font-display mt-1 text-lg font-bold">
                {money(contractVolume)}
              </p>

            </div>

            <div className="rounded-xl bg-[var(--surface-soft)] p-4">

              <p className="text-xs text-[var(--muted)]">
                Contratos asociados
              </p>

              <p className="font-display mt-1 text-lg font-bold">
                {myContracts.length}
              </p>

            </div>

            <div className="rounded-xl bg-[var(--surface-soft)] p-4">

              <p className="text-xs text-[var(--muted)]">
                Ventas registradas
              </p>

              <p className="font-display mt-1 text-lg font-bold">
                {currentAgent.sales}
              </p>

            </div>

          </div>

        </div>
      </Card>

      {/* ========================================================
          VOLUMEN GESTIONADO + MINI GRÁFICO
          ======================================================== */}

      <Card className="mt-6 p-6">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Rendimiento
            </p>

            <h2 className="font-display text-xl font-bold">
              Volumen gestionado
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Evolución del volumen de contratos registrados.
            </p>

          </div>

          <p className="font-display text-2xl font-bold text-[var(--brand)]">
            {money(contractVolume)}
          </p>

        </div>

        {/* ======================================================
            GRÁFICO DE BARRAS
            ====================================================== */}

        <div className="mt-8">

          <div className="flex h-56 items-end gap-4 sm:gap-8">

            {monthlyData.map((item) => {

              const barHeight =
                item.value > 0
                  ? Math.max(
                      (item.value / maxMonthlyValue) * 100,
                      10
                    )
                  : 4

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col justify-end"
                >

                  {/* VALOR */}

                  <div className="mb-2 text-center text-xs font-medium text-[var(--muted)]">
                    {item.value > 0
                      ? money(item.value)
                      : "—"}
                  </div>

                  {/* BARRA */}

                  <div
                    className="w-full rounded-t-xl bg-[var(--brand)] transition-all duration-500"
                    style={{
                      height: `${barHeight}%`,
                    }}
                    title={`${item.month}: ${money(item.value)}`}
                  />

                  {/* MES */}

                  <div className="mt-2 text-center text-xs font-medium text-[var(--muted)]">
                    {item.month}
                  </div>

                </div>
              )
            })}

          </div>

        </div>

        {/* PIE DEL GRÁFICO */}

        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">

          <p className="text-sm text-[var(--muted)]">
            Total acumulado de contratos
          </p>

          <p className="font-semibold">
            {money(contractVolume)}
          </p>

        </div>

      </Card>
    </>
  )
}