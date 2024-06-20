import { FlattenedRow } from "../../../types";

export type TableRowProps = {
    data: FlattenedRow & { index: number };
    onSave: (rowData: FlattenedRow) => Promise<void>;
    onDelete: (id: number | null) => Promise<void>;
    onAddRowBelow: () => void;
    isEditing: boolean;
    setEditingRowId: (id: FlattenedRow["id"]) => void;
    distance?: number;
};
