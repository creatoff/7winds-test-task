export type RowResponse = {
    id: number;
    equipmentCosts: number;
    estimatedProfit: number;
    machineOperatorSalary: number;
    mainCosts: number;
    materials: number;
    mimExploitation: number;
    overheads: number;
    rowName: string;
    salary: number;
    supportCosts: number;
    total: number;
};

export type TreeRow = RowResponse & { child?: TreeRow[] };

export type TreeResponse = TreeRow[];

export type OutlayRowRequest = Omit<RowResponse, "child" | "id"> & {
    parentId: number;
};

export type OutlayRowUpdateRequest = Omit<OutlayRowRequest, "parentId">;

type ExtraFields = {
    level: number;
    parentId?: number | null;
    id: number | null;
};

export type FlattenedRow = Omit<
    RowResponse,
    | "child"
    | "id"
    | "machineOperatorSalary"
    | "mainCosts"
    | "materials"
    | "mimExploitation"
    | "supportCosts"
    | "total"
> &
    ExtraFields;

export type RecalculatedRows = {
    changed: RowResponse[];
    current: RowResponse;
};
