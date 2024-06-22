import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    FlattenedRow,
    RecalculatedRows,
    TreeResponse,
    TreeRow,
} from 'src/types';
import { RowResponse } from 'src/types';

const eID = 126417;

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://185.244.172.108:8081' }),
    endpoints: (builder) => ({
        getTreeRows: builder.query<FlattenedRow[], void>({
            query: () => `/v1/outlay-rows/entity/${eID}/row/list`,
            transformResponse: (response: TreeResponse): FlattenedRow[] => {
                const makeFlat = (
                    array: TreeRow[],
                    parentId: number | null = null,
                    level: number = 0,
                ): FlattenedRow[] => {
                    return array.reduce<FlattenedRow[]>((acc, item) => {
                        const { child, id, ...rest } = item;
                        const current: FlattenedRow = {
                            ...rest,
                            parentId,
                            level,
                            id,
                        };
                        const children = child
                            ? makeFlat(child, id, level + 1)
                            : [];
                        return acc.concat(current, children);
                    }, []);
                };

                return makeFlat(response);
            },
        }),
        createRow: builder.mutation({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            query: ({ level, index, id, ...body }) => ({
                url: `/v1/outlay-rows/entity/${eID}/row/create`,
                method: 'POST',
                body: body,
            }),
            async onQueryStarted(
                newRow,
                { dispatch, getState, queryFulfilled },
            ) {
                try {
                    const selectGetTreeRowsResult =
                        apiSlice.endpoints.getTreeRows.select();
                    const { data: currentTreeRows } =
                        selectGetTreeRowsResult(getState());

                    if (!currentTreeRows) {
                        throw new Error(
                            'No current tree rows found in the state',
                        );
                    }

                    const optimisticTreeRows = [...currentTreeRows];

                    const findLastChildIndex = (
                        rows: FlattenedRow[],
                        parentId: FlattenedRow['id'],
                    ) => {
                        let lastIndex = -1;
                        for (let i = 0; i < rows.length; i++) {
                            if (rows[i].parentId === parentId) {
                                const childLastIndex = findLastChildIndex(
                                    rows,
                                    rows[i].id,
                                );
                                lastIndex =
                                    childLastIndex > lastIndex
                                        ? childLastIndex
                                        : lastIndex;
                            }
                        }
                        return lastIndex === -1
                            ? rows.findIndex((row) => row.id === parentId)
                            : lastIndex;
                    };

                    const insertIndex =
                        findLastChildIndex(
                            optimisticTreeRows,
                            newRow.parentId,
                        ) + 1;
                    console.log({ insertIndex });

                    const newElement = { ...newRow };
                    optimisticTreeRows.splice(insertIndex, 0, newElement);

                    dispatch(
                        apiSlice.util.updateQueryData(
                            'getTreeRows',
                            undefined,
                            () => optimisticTreeRows,
                        ),
                    );

                    const {
                        data: { current, changed },
                    }: { data: RecalculatedRows } = await queryFulfilled;
                    const recalculatedRows = [current, ...changed];

                    const updatedTreeRows = optimisticTreeRows.map((row) => {
                        const recalculatedRow = recalculatedRows.find(
                            (recalcRow) => recalcRow.id === row.id,
                        );
                        if (!row.id) {
                            return { ...row, ...current };
                        }
                        return recalculatedRow
                            ? { ...row, ...recalculatedRow }
                            : row;
                    });

                    dispatch(
                        apiSlice.util.updateQueryData(
                            'getTreeRows',
                            undefined,
                            () => updatedTreeRows,
                        ),
                    );
                } catch (error) {
                    console.error('Error creating tree row:', error);
                }
            },
        }),

        updateRow: builder.mutation({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            query: ({ id: rID, level, index, ...body }) => ({
                url: `/v1/outlay-rows/entity/${eID}/row/${rID}/update`,
                method: 'POST',
                body: { ...body },
            }),
            async onQueryStarted(
                changedRow,
                { dispatch, getState, queryFulfilled },
            ) {
                try {
                    const selectGetTreeRowsResult =
                        apiSlice.endpoints.getTreeRows.select();
                    const { data: currentTreeRows } =
                        selectGetTreeRowsResult(getState());

                    if (!currentTreeRows) {
                        throw new Error(
                            'No current tree rows found in the state',
                        );
                    }

                    const optimisticTreeRows = [...currentTreeRows];

                    const updateIndex = optimisticTreeRows.findIndex(
                        (row) => row.id === changedRow.id,
                    );
                    const changedElement = { ...changedRow };
                    optimisticTreeRows.splice(updateIndex, 1, changedElement);

                    dispatch(
                        apiSlice.util.updateQueryData(
                            'getTreeRows',
                            undefined,
                            () => optimisticTreeRows,
                        ),
                    );

                    const {
                        data: { current, changed },
                    }: { data: RecalculatedRows } = await queryFulfilled;
                    const recalculatedRows = [current, ...changed];

                    const updatedItemsMap = new Map(
                        recalculatedRows.map((item) => [item.id, item]),
                    );

                    const updatedTreeRows = currentTreeRows.map((item) => {
                        if (updatedItemsMap.has(item.id!)) {
                            const updatedItem = updatedItemsMap.get(item.id!);
                            return {
                                ...item,
                                ...updatedItem,
                            };
                        }
                        return item;
                    });

                    dispatch(
                        apiSlice.util.updateQueryData(
                            'getTreeRows',
                            undefined,
                            () => updatedTreeRows,
                        ),
                    );
                } catch (error) {
                    console.error('Error updating tree rows:', error);
                }
            },
        }),

        deleteRow: builder.mutation({
            query: (rID) => ({
                url: `/v1/outlay-rows/entity/${eID}/row/${rID}/delete`,
                method: 'DELETE',
            }),
            async onQueryStarted(
                deletedId,
                { dispatch, getState, queryFulfilled },
            ) {
                const selectGetTreeRowsResult =
                    apiSlice.endpoints.getTreeRows.select();
                const { data: currentTreeRows } =
                    selectGetTreeRowsResult(getState());

                if (!currentTreeRows) {
                    throw new Error('No current tree rows found in the state');
                }

                function findDescendantIds(
                    parentId: number,
                    items: FlattenedRow[],
                ) {
                    let descendantIds: number[] = [];
                    items.forEach((item) => {
                        if (item.parentId === parentId) {
                            descendantIds.push(item.id!);
                            descendantIds = descendantIds.concat(
                                findDescendantIds(item.id!, items),
                            );
                        }
                    });
                    return descendantIds;
                }

                const idsToDelete = findDescendantIds(
                    deletedId,
                    currentTreeRows,
                );
                idsToDelete.push(deletedId);

                const optimisticallyUpdatedTreeRows = currentTreeRows.filter(
                    (item) => !idsToDelete.includes(item.id!),
                );

                const patchResult = dispatch(
                    apiSlice.util.updateQueryData(
                        'getTreeRows',
                        undefined,
                        () => optimisticallyUpdatedTreeRows,
                    ),
                );

                try {
                    const {
                        data: recalculatedRows,
                    }: { data: RecalculatedRows } = await queryFulfilled;
                    const { changed }: { changed: RowResponse[] } =
                        recalculatedRows;

                    const updatedItemsMap = new Map(
                        changed.map((item) => [item.id, item]),
                    );

                    const updatedTreeRows = optimisticallyUpdatedTreeRows.map(
                        (item) => {
                            if (updatedItemsMap.has(item.id!)) {
                                const updatedItem = updatedItemsMap.get(
                                    item.id!,
                                );
                                return {
                                    ...item,
                                    ...updatedItem,
                                };
                            }
                            return item;
                        },
                    );

                    dispatch(
                        apiSlice.util.updateQueryData(
                            'getTreeRows',
                            undefined,
                            () => updatedTreeRows,
                        ),
                    );
                } catch (error) {
                    console.error('Error deleting tree row:', error);

                    patchResult.undo();
                }
            },
        }),
    }),
});

export const {
    useGetTreeRowsQuery,
    useCreateRowMutation,
    useUpdateRowMutation,
    useDeleteRowMutation,
} = apiSlice;
