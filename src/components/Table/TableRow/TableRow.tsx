import { useState, useEffect, useId } from "react";
import type { FlattenedRow } from "../../../types";
import type { TableRowProps } from "./TableRow.types";
import "./TableRow.styles.scss";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";

const ROW_HEIGHT = 60;

const fields: Array<keyof FlattenedRow> = [
    "rowName",
    "salary",
    "equipmentCosts",
    "overheads",
    "estimatedProfit",
] as const;

export function TableRow({
    data,
    onSave,
    onDelete,
    onAddRowBelow,
    isEditing,
    setEditingRowId,
    distance = 0,
}: TableRowProps) {
    const formId = useId();

    const [rowData, setRowData] = useState<FlattenedRow>(data);
    const { id, level } = rowData;
    const { index } = data;

    const [shouldFocus, setShouldFocus] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (shouldFocus) {
            const inputElement = shouldFocus.querySelector(
                "input:not([hidden])",
            ) as HTMLInputElement;

            if (inputElement) {
                inputElement.focus();
            }

            setShouldFocus(null);
        }
    }, [shouldFocus]);

    useEffect(() => {
        setRowData(data);
    }, [data]);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditing) {
            setEditingRowId(id);
            setShouldFocus(e.currentTarget);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Escape") {
            setEditingRowId(null);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(rowData);
        setEditingRowId(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRowData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClickAdd = () => onAddRowBelow();

    const handleClickDelete = () => onDelete(id);

    return (
        <tr className="table__row">
            <td className="table__cell table__cell_first">
                <div
                    className="actions"
                    style={{ left: `${level > 0 ? level * 20 : 0}px` }}
                >
                    {index > 0 && (
                        <div
                            className="actions__lines"
                            style={{ height: `${distance * ROW_HEIGHT}px` }}
                        ></div>
                    )}
                    <div className="actions__toolbar">
                        <button
                            className="actions__button"
                            onClick={() => handleClickAdd()}
                            disabled={isEditing}
                        >
                            <DescriptionIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            className="actions__button actions__button_delete"
                            onClick={() => handleClickDelete()}
                            disabled={isEditing}
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>
            </td>
            {fields.map((field, index) => {
                let content = null;

                if (!isEditing) {
                    content = String(rowData[field]);
                } else {
                    const input = (
                        <input
                            className="table__input"
                            form={formId}
                            type={field === "rowName" ? "text" : "number"}
                            name={field}
                            defaultValue={String(rowData[field])}
                            onChange={(e) => handleInputChange(e)}
                            required
                        />
                    );
                    content =
                        index === 0 ? (
                            <form
                                id={formId}
                                onSubmit={handleFormSubmit}
                                onKeyDown={handleKeyDown}
                            >
                                {input}
                                <input type="submit" hidden />
                            </form>
                        ) : (
                            input
                        );
                }

                return (
                    <td
                        key={`${rowData.id}${field}`}
                        className="table__cell"
                        onDoubleClick={handleDoubleClick}
                    >
                        {content}
                    </td>
                );
            })}
        </tr>
    );
}
