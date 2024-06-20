import {
    FlattenedRow,
    OutlayRowRequest,
    OutlayRowUpdateRequest,
} from "../types";

export function prepareData(
    row: FlattenedRow,
): OutlayRowRequest | OutlayRowUpdateRequest {
    const preparedData = {
        ...row,
        machineOperatorSalary: 0,
        mainCosts: 0,
        materials: 0,
        mimExploitation: 0,
        supportCosts: 0,
        total: 0,
    };

    return preparedData;
}
