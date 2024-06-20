import { TreeResponse } from "../../types";

export function flattenWithLevel(data: TreeResponse, level = 0) {
    let result: typeof data = [];
    data.forEach((item) => {
        const newItem = { ...item, level };
        delete newItem.child;
        result.push(newItem);
        if (item.child && item.child.length > 0) {
            result = result.concat(flattenWithLevel(item.child, level + 1));
        }
    });
    return result;
}
