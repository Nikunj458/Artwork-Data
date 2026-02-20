import { useEffect, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
interface Artwork {
  id: number
  title: string
  place_of_origin: string
  artist_display: string
  inscriptions: string | null
  date_start: number
  date_end: number
}

interface ApiResponse {
  data: Artwork[]
  pagination: {
    total: number
    current_page: number
    total_pages: number
  }
}

export default function ArtworkTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [selectCount, setSelectCount] = useState<string>("")

  const rowsPerPage = 12

  const fetchArtworks = async (pageNumber: number) => {
    try {
      setLoading(true)

      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
      )

      const json: ApiResponse = await response.json()

      setArtworks(json.data)
      setTotalRecords(json.pagination.total)
    } catch (error) {
      console.error("Error fetching artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtworks(page)
  }, [page])

  const onPageChange = (event: any) => {
    setPage(event.page + 1)
  }

  const currentPageSelected = artworks.filter((art) =>
    selectedIds.has(art.id)
  )

  const handleCustomSelect = () => {
    const count = parseInt(selectCount)

    if (!count || count <= 0) return

    const rowsToSelect = artworks.slice(0, count)
    const updatedIds = new Set(selectedIds)

    rowsToSelect.forEach((row) => {
      updatedIds.add(row.id)
    })

    setSelectedIds(updatedIds)
    setSelectCount("")
    setShowDialog(false)
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Button
          label="Custom Select"
          icon="pi pi-check-square"
          onClick={() => setShowDialog(true)}
        />

        <div style={{ color:"black" }}>
          <strong>Selected Rows:</strong> {selectedIds.size}
        </div>
      </div>

      <Dialog
        header="Custom Row Selection"
        visible={showDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowDialog(false)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <InputText
            type="number"
            value={selectCount}
            onChange={(e) => setSelectCount(e.target.value)}
            placeholder="Enter number of rows"
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              label="Select"
              onClick={handleCustomSelect}
              disabled={!selectCount || parseInt(selectCount) <= 0}
            />
            <Button
              label="Cancel"
              severity="secondary"
              onClick={() => setShowDialog(false)}
            />
          </div>
        </div>
      </Dialog>

      <DataTable
        value={artworks}
        paginator
        lazy
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        first={(page - 1) * rowsPerPage}
        onPage={onPageChange}
        selection={currentPageSelected}
        dataKey="id"
        selectionMode="multiple"
        onSelectionChange={(e: any) => {
          const newSelection = e.value as Artwork[]
          const updatedIds = new Set(selectedIds)

          artworks.forEach((row) => {
            updatedIds.delete(row.id)
          })

          newSelection.forEach((row) => {
            updatedIds.add(row.id)
          })

          setSelectedIds(updatedIds)
        }}
        responsiveLayout="scroll"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column
          header="Inscriptions"
          body={(rowData: Artwork) => rowData.inscriptions || "—"}
        />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  )
}