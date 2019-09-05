import { IMergeable, IMergeOptions, IMergeValue } from '../extensions/merge/contracts';
import { IMergeMapWrapper } from '../extensions/merge/merge-maps';
import { ISerializable, ISerializedObject, ISerializeValue } from '../extensions/serialization/contracts';
import { ListChangedObject } from './base/ListChangedObject';
import { ICompare } from './contracts/ICompare';
import { IListChangedObject } from './contracts/IListChanged';
export declare function getDefaultValue(value: any): any;
export declare class SortedList<T> extends ListChangedObject<T> implements IListChangedObject<T>, IMergeable<SortedList<T>, T[] | Iterable<T>>, ISerializable {
    private readonly _array;
    constructor({ array, minAllocatedSize, compare, autoSort, notAddIfExists, countSorted, }?: {
        array?: T[];
        minAllocatedSize?: number;
        compare?: ICompare<T>;
        autoSort?: boolean;
        notAddIfExists?: boolean;
        countSorted?: number;
    });
    private _minAllocatedSize;
    minAllocatedSize: number;
    readonly allocatedSize: number;
    private _updateAllocatedSize;
    private _size;
    readonly size: number;
    private _setSize;
    private _compare;
    compare: ICompare<T>;
    private _countSorted;
    readonly countSorted: number;
    private _autoSort;
    autoSort: boolean;
    private _notAddIfExists;
    notAddIfExists: boolean;
    private static _prepareIndex;
    private static _prepareStart;
    private static _prepareEnd;
    removeDuplicates(withoutShift?: boolean): number;
    get(index: number): T;
    set(index: number, item: T): boolean;
    add(item: T): boolean;
    addArray(sourceItems: T[], sourceStart?: number, sourceEnd?: number): boolean;
    addIterable(items: Iterable<T>, itemsSize: number): boolean;
    private _insert;
    insert(index: number, item: T): boolean;
    insertArray(index: number, sourceItems: T[], sourceStart?: number, sourceEnd?: number): boolean;
    insertIterable(index: number, items: Iterable<T>, itemsSize: number): boolean;
    removeAt(index: number, withoutShift?: boolean): boolean;
    removeRange(start: number, end?: number, withoutShift?: boolean): boolean;
    remove(item: T, withoutShift?: boolean): boolean;
    removeArray(sourceItems: T[], sourceStart?: number, sourceEnd?: number): boolean;
    removeIterable(items: Iterable<T>, itemsSize: number): boolean;
    private _move;
    move(oldIndex: number, newIndex: number): boolean;
    moveRange(start: number, end: number, moveIndex: number): boolean;
    indexOf(item: T, start?: number, end?: number, bound?: number): number;
    contains(item: T): boolean;
    clear(): boolean;
    reSort(): boolean;
    sort(): boolean;
    toArray(start?: number, end?: number): T[];
    copyTo(destArray: T[], destIndex?: number, start?: number, end?: number): boolean;
    [Symbol.iterator](): Iterator<T>;
    static readonly compareDefault: ICompare<any>;
    readonly [Symbol.toStringTag]: string;
    _canMerge(source: SortedList<T>): boolean;
    _merge(merge: IMergeValue, older: SortedList<T> | T[] | Iterable<T>, newer: SortedList<T> | T[] | Iterable<T>, preferCloneOlder?: boolean, preferCloneNewer?: boolean, options?: IMergeOptions): boolean;
    static uuid: string;
    serialize(serialize: ISerializeValue): ISerializedObject;
    deSerialize(): void;
}
export declare class MergeSortedListWrapper<V> implements IMergeMapWrapper<V, V> {
    private readonly _list;
    constructor(list: SortedList<V>);
    delete(key: V): void;
    forEachKeys(callbackfn: (key: V) => void): void;
    get(key: V): V;
    has(key: V): boolean;
    set(key: V, value: V): void;
}
export declare function createMergeSortedListWrapper<V>(target: object | Set<V> | SortedList<V> | V[] | Iterable<V>, source: object | Set<V> | SortedList<V> | V[] | Iterable<V>, arrayOrIterableToSortedList: (array: any) => object | SortedList<V>): any;
