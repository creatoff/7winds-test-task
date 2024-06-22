import { useDebugValue, useState, useEffect } from "react";
import { FlattenedRow } from "src/types";
import {
    useGetTreeRowsQuery,
    useCreateRowMutation,
    useUpdateRowMutation,
    useDeleteRowMutation,
} from "src/api/apiSlice";
import { TableRow } from "./TableRow";
import { prepareData } from "src/utils/prepareData";
import "./Table.styles.scss";

const tableHeader = [
    "Уровень",
    "Наименование работ",
    "Основная з/п",
    "Оборудование",
    "Накладные расходы",
    "Сметная прибыль",
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
    };
}

const distanceToPrevRowWithSameLevel = (rows: FlattenedRow[], index: number) => {
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

function useLabeledState<T>(label: string, initialState: T | (() => T)) {
    const [state, setState] = useState<T>(initialState);
    useDebugValue(label, (label) => `${label}: ${state}`);
    return [state, setState] as const;
}

export function Table() {
    const { data: rows = [], isLoading, isSuccess } = useGetTreeRowsQuery();
    const [updateRow] = useUpdateRowMutation();
    const [createRow] = useCreateRowMutation();
    const [deleteRow] = useDeleteRowMutation();

    const [editingRowIndex, setEditingRowIndex] = useLabeledState<
        number | null
    >("Row index", null);

    const [editingRowData, setEditingRowData] =
        useLabeledState<FlattenedRow | null>("Row data", null);

    useEffect(() => {
        if (isSuccess && rows.length === 0) {
            setEditingRowData({
                ...getEmptyRowData(),
                level: 0,
                parentId: null,
            });
            setEditingRowIndex(0);
        }
    }, [rows]);

    const handleEditRow = (index: number) => {
        setEditingRowIndex(index);
    };

    const handleCancelEditRow = () => {
        if (rows.length === 0) return;

        setEditingRowIndex(null);
        if (editingRowData) {
            setEditingRowData(null);
        }
    };

    const handleSaveRow = async (rowData: FlattenedRow) => {
        setEditingRowData(null);
        setEditingRowIndex(null);

        const preparedData = prepareData(rowData);
        const isRowExists = Boolean(rowData.id);

        if (isRowExists) {
            await updateRow(preparedData).unwrap();
        } else {
            await createRow(preparedData).unwrap();
        }
    };

    const handleDeleteRow = async (id: number | null) => {
        if (!id) {
            setEditingRowIndex(null);
        }
        await deleteRow(id);
    };

    const handleAddRowBelow = (
        index: number,
        level: FlattenedRow["level"],
        parentId: FlattenedRow["id"],
    ) => {
        let nextIndexWithSameLevel = rows.length;

        for (let i = index + 1; i < rows.length; i++) {
            const currentLevel = rows[i]["level"];
            if (currentLevel <= level) {
                nextIndexWithSameLevel = i;
                break;
            }
        }

        setEditingRowData({
            ...getEmptyRowData(),
            level: level + 1,
            parentId,
        });

        setEditingRowIndex(nextIndexWithSameLevel);
    };

    const combinedRows = [...rows];

    if (editingRowData) {
        const isRowExists = Boolean(editingRowData.id);

        combinedRows.splice(
            editingRowIndex!,
            isRowExists ? 1 : 0,
            editingRowData,
        );
    }

    if (isLoading) {
        return "Загрузка...";
    }

    return (
        <div className="table">
            <table className="table__table">
                <TableHead />
                <tbody>
                    {combinedRows.map((row, index) => {
                        const distance = distanceToPrevRowWithSameLevel(
                            combinedRows,
                            index,
                        );

                        return (
                            <TableRow
                                key={row.id}
                                distance={distance}
                                data={{ ...row, index }}
                                onSave={handleSaveRow}
                                onDelete={handleDeleteRow}
                                onEdit={() => handleEditRow(index)}
                                onCancel={() => handleCancelEditRow()}
                                isEditing={editingRowIndex === index}
                                setRowData={setEditingRowData}
                                onAddRowBelow={() =>
                                    handleAddRowBelow(index, row.level, row.id!)
                                }
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function TableHead() {
    return (
        <thead>
            <tr className="table__row">
                {tableHeader.map((cell) => (
                    <th key={cell} className="table__cell table__header-cell">
                        {cell}
                    </th>
                ))}
            </tr>
        </thead>
    );
}
