import { useState, Fragment } from 'react';
import { FlattenedRow } from 'src/types';
import { useGetTreeRowsQuery, useCreateRowMutation, useUpdateRowMutation, useDeleteRowMutation } from 'src/api/apiSlice';
import { TableRow } from './TableRow';
import { prepareData } from 'src/utils/prepareData';
import './Table.styles.scss';

const tableHeader = [
    'Уровень',
    'Наименование работ',
    'Основная з/п',
    'Оборудование',
    'Накладные расходы',
    'Сметная прибыль',
];

function getEmptyRowData() {
    return {
        level: 0,

        id: null,
        parentId: null,

        rowName: "",
        salary: 0,
        equipmentCosts: 0,
        overheads: 0,
        estimatedProfit: 0,

        index: 0,
    };
}

export function Table() {
    const { data: rows = [], isLoading, } = useGetTreeRowsQuery();
    const [updateRow] = useUpdateRowMutation();
    const [createRow] = useCreateRowMutation();
    const [deleteRow] = useDeleteRowMutation();

    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [newRowIndex, setNewRowIndex] = useState<number | null>(null);
    const [newRowData, setNewRowData] = useState<FlattenedRow | null>({
        ...getEmptyRowData(),
        level: 0,
        parentId: null,
    });

    const handleSave = async (rowData: FlattenedRow) => {
        const preparedData = prepareData(rowData);

        const isRowExists = Boolean(rowData.id);

        if (isRowExists) {
            await updateRow(preparedData).unwrap()
        } else {
            setNewRowIndex(null);
            await createRow(preparedData).unwrap();
        }
    };

    const handleDelete = async (id: number | null) => {
        if (!id) {
            setNewRowIndex(null);
        }
        await deleteRow(id);
    }

    const handleAddRowBelow = (index: number, level: FlattenedRow["level"], parentId: number) => {
        setNewRowData({
            ...getEmptyRowData(),
            level: level + 1,
            parentId,
        });

        let nextIndexWithSameLevel = rows.length;

        for (let i = index + 1; i < rows.length; i++) {
            const currentLevel = rows[i]['level'];
            if (currentLevel <= level) {
                nextIndexWithSameLevel = i;
                break;
            }
        }

        setNewRowIndex(nextIndexWithSameLevel);

        setEditingRowId(null);
    };

    const distanceToPrevRowWithSameLevel = (index: number) => {
        let distance = 1;

        const currentLevel = rows[index].level;

        for (let i = index - 1; i >= 0; i--) {
            const prevLevel = rows[i].level;
            if (prevLevel > currentLevel) {
                distance++;
            } else {
                break;
            }
        }

        return distance;
    };

    if (isLoading) {
        return 'Загрузка...';
    }

    return (
        <div className="table">
            <table className="table__table">
                <TableHead />
                <tbody>
                    {rows.map((row, index) => {
                        const showNewRow = newRowIndex === index + 1;

                        let distance = distanceToPrevRowWithSameLevel(index);

                        if (newRowIndex && index >= newRowIndex) {
                            distance++;
                        }

                        return (
                            <Fragment key={`${row.id}wrap`}>
                                <TableRow
                                    key={row.id}
                                    distance={distance}
                                    data={{ ...row, index }}
                                    onSave={handleSave}
                                    onDelete={handleDelete}
                                    isEditing={editingRowId === row.id}
                                    setEditingRowId={setEditingRowId}
                                    onAddRowBelow={() => handleAddRowBelow(index, row.level, row.id!)}
                                />
                                {showNewRow && (
                                    <TableRow
                                        key={newRowIndex}
                                        distance={distance}
                                        data={{ ...newRowData, index: newRowIndex }}
                                        onSave={handleSave}
                                        onDelete={handleDelete}
                                        isEditing={true}
                                        setEditingRowId={setEditingRowId}
                                        onAddRowBelow={() => handleAddRowBelow(index, row.level, row.id!)}
                                    />
                                )}
                            </Fragment>)
                    }
                    )}
                    {rows.length === 0 && (
                        <TableRow
                            key="new"
                            data={getEmptyRowData()}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            isEditing={true}
                            setEditingRowId={setEditingRowId}
                            onAddRowBelow={() => { }}
                        />
                    )}
                </tbody>
            </table>
        </div>
    )
}

function TableHead() {
    return (
        <thead>
            <tr className="table__row">
                {tableHeader.map(cell => (
                    <th key={cell} className="table__cell table__header-cell">{cell}</th>
                ))}
            </tr>
        </thead>
    )
}