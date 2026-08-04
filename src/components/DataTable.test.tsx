import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DataTable, type Column } from './DataTable'

type Row = { id: string; name: string; score: number }
const rows: Row[] = [{ id: '1', name: 'Bravo', score: 2 }, { id: '2', name: 'Alpha', score: 1 }]
const columns: Column<Row>[] = [{ key: 'name', title: '이름', sortable: true }, { key: 'score', title: '점수', sortable: true }]

afterEach(cleanup)

describe('DataTable', () => {
  it('searches rows', () => {
    render(<DataTable data={rows} columns={columns} />)
    fireEvent.change(screen.getByPlaceholderText('전체 데이터 검색...'), { target: { value: 'Alpha' } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument()
  })

  it('sorts a column', () => {
    render(<DataTable data={rows} columns={columns} />)
    fireEvent.click(screen.getByRole('button', { name: '이름 정렬' }))
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alpha')
  })

  it('selects a row', () => {
    render(<DataTable data={rows} columns={columns} />)
    fireEvent.click(screen.getByLabelText('1 행 선택'))
    expect(screen.getByText(/1개 선택/)).toBeInTheDocument()
  })
})
