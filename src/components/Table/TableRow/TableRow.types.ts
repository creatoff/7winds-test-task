import { Dispatch, SetStateAction } from "react";
import { FlattenedRow } from "../../../types";

export type TableRowProps = {
    data: FlattenedRow & { index: number };
    onSave: (rowData: FlattenedRow) => Promise<void>;
    onDelete: (id: FlattenedRow["id"]) => Promise<void>;
    onAddRowBelow: () => void;
    isEditing: boolean;
    // setEditingRowId: (id: FlattenedRow["id"]) => void;
    onEdit: () => void;
    onCancel: () => void;
    distance?: number;
    setRowData: Dispatch<SetStateAction<FlattenedRow | null>>;
};