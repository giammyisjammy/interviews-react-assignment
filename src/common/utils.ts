// Little trick to give a type to an empty array
type TypedEmptyList = <T>() => Array<T>;
export const emptyTypedList: TypedEmptyList = () => [];
