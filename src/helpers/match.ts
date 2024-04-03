import useSWRInfinite, {
  SWRInfiniteKeyLoader,
  SWRInfiniteResponse,
} from 'swr/infinite';
import { emptyTypedList } from '../common/utils';

export type UseSWRInfiniteWithLoadingStateReturns<Data, Error> = Omit<
  SWRInfiniteResponse<Data, Error>,
  'data' | 'isLoading' | 'isValidating' | 'error'
> & {
  isLoadingMore: boolean;
  isEmpty: boolean;
} & LoadingState<Data, Error>;

// #region States modelling

// #region Fetch and Revalidate

// This pattern is to fetch data and revalidate it later.

// type Event<Data, Error> =
//   | { type: 'fetch' } // moves to FetchState
//   | { type: 'error'; error: Error } // moves from FetchState | FetchState<Data> | RevalidateState<Data> to SettledState<Data>
//   | { type: 'success'; data: Data } // moves from FetchState | FetchState<Data> | RevalidateState<Data> to SettledState<Data>
//   | { type: 'key-change'; keepPreviousData: false } // moves SettledState<Data> to FetchState<undefined>
//   | { type: 'key-change'; keepPreviousData: true }; // moves SettledState<Data> to FetchState<Data>

/**
 * Represents the UI state while fetching data.
 * It is possible to have `data` defined if `keepPreviousData` was passed as an option to SWR.
 */
type FetchState<Data> = {
  isLoading: true;
  isValidating: true;
  data?: Data;
};
/**
 * Represents the UI state while revalidating data.
 * It is possible to have `data` defined if `keepPreviousData` was passed as an option to SWR.
 */
type RevalidateState<Data> = {
  isLoading: false;
  isValidating: true;
  data?: Data;
};
type SuccessState<Data> = { isLoading: false; isValidating: false; data: Data };
type ErrorState<Error> = {
  isLoading: false;
  isValidating: false;
  error: Error;
};
// type SettledState<Data, Error> = SuccessState<Data> | ErrorState<Error>;

type LOLZ<L, X> = Exclude<
  Exclude<Exclude<L, X>, { isLoading: true }>,
  { isValidating: true }
>;

const mySuccessGuard =
  <D, E = unknown>() =>
  <L extends LoadingState<D, E>>(state: L): state is LOLZ<L, { error: E }> =>
    !state.isLoading && !state.isValidating && !('error' in state);
const myErrorGuard =
  <E, D = unknown>() =>
  <L extends LoadingState<D, E>>(state: L): state is LOLZ<L, { data: D }> =>
    !state.isLoading && !state.isValidating && !('data' in state);

// export const isSuccessState = <Data, Error>(
//   e: LoadingState<Data, Error>
// ): e is SuccessState<Data> => !e.isLoading && !e.isValidating && 'data' in e;
// export const isErrorState = <Data, Error>(
//   e: LoadingState<Data, Error>
// ): e is ErrorState<Error> => !e.isLoading && !e.isValidating && 'error' in e;

// type TypedIsErrorState = <D, E>() => (
//   state: SettledState<D, E>
// ) => state is ErrorState<E>;
// type TypedIsSuccessState = <D, E>() => (
//   state: SettledState<D, E>
// ) => state is SuccessState<D>;
// export const typedIsErrorState: TypedIsErrorState = () => isErrorState;
// export const typedIsSuccessState: TypedIsSuccessState = () => isSuccessState;

export type LoadingState<Data, Error> =
  | FetchState<Data>
  | RevalidateState<Data>
  | SuccessState<Data>
  | ErrorState<Error>;

export const P = {
  // fetch:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is FetchState<D> =>
  //     state.isLoading === true && state.isValidating === true,
  fetch: { isLoading: true, isValidating: true } as const,
  // revalidate:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is RevalidateState<D> =>
  //     state.isLoading === false && state.isValidating === true,
  revalidate: { isLoading: false, isValidating: true } as const,
  // error:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is ErrorState<E> =>
  //     !P.fetch()(state) && !P.revalidate()(state) && 'error' in state,

  // error:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is ErrorState<E> =>
  //     !state.isLoading && !state.isValidating && 'error' in state,

  error: myErrorGuard,
  // success:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is SuccessState<D> =>
  //     !P.fetch()(state) && !P.revalidate()(state) && 'data' in state,
  // success:
  //   <D, E>() =>
  //   (state: LoadingState<D, E>): state is SuccessState<D> =>
  //     !state.isLoading && !state.isValidating && 'data' in state,

  success: mySuccessGuard,
};

// https://github.com/gvergnaud/ts-pattern/issues/222#issuecomment-1933342045
// function matchLoadingState<Data, Error>(state: LoadingState<Data, Error>);
// function matchLoadingState(state: LoadingState<unknown, unknown>) {
// export function matchLoadingState<Data, Error>(
//   state: LoadingState<Data, Error>
// ) {
//   return {
//     with: ({
//       fetch,
//       revalidate,
//       success,
//       error,
//     }: {
//       fetch: <R1>(state: FetchState<Data>) => R1;
//       revalidate: <R2>(state: RevalidateState<Data>) => R2;
//       success: <R3>(state: SuccessState<Data>) => R3;
//       error: <R4>(state: ErrorState<Error>) => R4;
//     }) =>
//       match(state)
//         .when(P.fetch, /* (asdf) =>  */ fetch)
//         .when(P.revalidate, /* (asdf) =>  */ revalidate)
//         .when(P.error<Data, Error>(), /* (asdf) =>  */ error)
//         .when(P.success<Data, Error>(), /* (asdf) =>  */ success)
//         .exhaustive(),
//   };
// }
// #endregion

// #region Key Change

// This pattern is to fetch data and change the key and revalidate it later.

// #endregion

// #region Key Change + Previous Data
// #endregion

// #region Fallback
// #endregion

// #region Key Change + Fallback
// #endregion

// #region Key Change + Previous Data + Fallback
// #endregion

// #endregion

// TODO find shorter name
// TODO interface overloads
export const useSWRInfiniteWithLoadingState = <Data, Error>(
  getKey: SWRInfiniteKeyLoader<Data>
): UseSWRInfiniteWithLoadingStateReturns<Data, Error> => {
  // This hook accepts a function that returns the request key, a fetcher
  // function, and option s. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const { data, isLoading, isValidating, size, error, ...rest } =
    useSWRInfinite<Data, Error>(getKey);
  const pages = data ? emptyTypedList<Data>().concat(...data) : [];
  const isLoadingMore = Boolean(
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );
  const firstPage = data?.[0];
  const isEmpty = firstPage === undefined; // || (firstPage && firstPage.total === 0);

  return {
    ...rest,
    data: pages,
    isLoadingMore,
    isEmpty,
    isLoading,
    isValidating,
    size,
    error,
  } as UseSWRInfiniteWithLoadingStateReturns<Data, Error>;
};
