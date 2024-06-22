import { useState, useEffect, useId, useRef } from "react";
import type { FlattenedRow } from "../../../types";
import type { TableRowProps } from "./TableRow.types";
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
    data: rowData,
    setRowData,
    onSave,
    onDelete,
    onAddRowBelow,
    onEdit,
    onCancel,
    isEditing,
    distance = 0,
}: TableRowProps) {
    const formId = useId();

    const { id, level, index } = rowData;

    const [shouldFocus, setShouldFocus] = useState<HTMLElement | null>(null);

    const firstInputRef = useRef<HTMLInputElement | null>(null);

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
        if (isEditing && shouldFocus === null) {
            firstInputRef.current?.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditing) {
            setShouldFocus(e.currentTarget);
            setRowData(rowData);
            onEdit();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            onCancel();
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(rowData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRowData((prev) => {
            if (prev === null) return null;

            return {
                ...prev,
                [name]: name === "rowName" ? value : Number(value),
            };
        });
    };

    const handleClickAdd = () => onAddRowBelow();

    const handleClickDelete = () => onDelete(id);

    return (
        <tr className="table__row">
            <td className="table__cell table__cell_first">
                <div
                    className="table__actions"
                    style={{ marginLeft: `${level > 0 ? level * 20 : 0}px` }}
                >
                    {index > 0 && (
                        <div
                            className="table__actions-lines"
                            style={{ height: `${distance * ROW_HEIGHT}px` }}
                        ></div>
                    )}
                    <div className="table__actions-toolbar">
                        <button
                            className="table__actions-button"
                            onClick={() => handleClickAdd()}
                            disabled={isEditing}
                        >
                            <DescriptionIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            className="table__actions-button table__actions-button_delete"
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
                const isFirstCell = index === 0;

                if (!isEditing) {
                    content = String(rowData[field]);
                } else {
                    const input = (
                        <input
                            {...(isFirstCell ? { ref: firstInputRef } : {})}
                            className="table__input"
                            form={formId}
                            type={field === "rowName" ? "text" : "number"}
                            name={field}
                            defaultValue={String(rowData[field])}
                            onChange={(e) => handleInputChange(e)}
                            onKeyDown={handleKeyDown}
                            required
                        />
                    );
                    content =
                        isFirstCell ? (
                            <form
                                id={formId}
                                onSubmit={handleFormSubmit}
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
