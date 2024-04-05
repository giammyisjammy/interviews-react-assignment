import useSWRInfinite, {
  SWRInfiniteKeyLoader,
  SWRInfiniteResponse,
} from 'swr/infinite';
// import { ZodType, z } from 'zod';

import { emptyTypedList } from '../common/utils';
import { match } from 'ts-pattern';

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
 * Represents the UI state while fetch request is not started.
 * It *should* not be possible with normal useSWR, it's intended to model
 * a fallback state.
 */
export type IdleState = {
  _tag: 'idle';
  // isLoading: boolean;
  // isValidating: boolean;
};

/**
 * Represents the UI state while fetching data.
 * It is possible to have `data` defined if `keepPreviousData` was passed as an option to SWR.
 */
export type FetchState<Data> = {
  _tag: 'loading';
  // isLoading: true;
  // isValidating: true;
  data?: Data;
};

/**
 * Represents the UI state while revalidating data.
 * It is possible to have `data` defined if `keepPreviousData` was passed as an option to SWR.
 */
export type RevalidateState<Data> = {
  _tag: 'revalidate';
  // isLoading: false;
  // isValidating: true;
  data?: Data;
};

/**
 * Represents the UI state after a successful long running task.
 */
export type SuccessState<Data> = {
  _tag: 'success';
  // isLoading: false;
  // isValidating: false;
  data: Data;
};

/**
 * Represents the UI state after a failed long running task.
 */
export type ErrorState<Error> = {
  _tag: 'error';
  // isLoading: false;
  // isValidating: false;
  error: Error;
};

// type SettledState<Data, Error> = SuccessState<Data> | ErrorState<Error>;

export type LoadingState<Data, Error> =
  | IdleState
  | FetchState<Data>
  | RevalidateState<Data>
  | SuccessState<Data>
  | ErrorState<Error>;

type LoadingStatus = LoadingState<never, never>['_tag'];

/**
 * See https://swr.vercel.app/docs/advanced/understanding#state-machine
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const swrStateToStatus = <L extends SWRInfiniteResponse<any, any>>(
  state: L
): LoadingStatus => {
  if (state.isLoading && state.isValidating) {
    return 'loading' as const;
  } else if (!state.isLoading && state.isValidating) {
    return 'revalidate' as const;
  } else if (
    !state.isLoading &&
    !state.isValidating &&
    'error' in state &&
    state.error !== undefined
  ) {
    return 'error' as const;
  } else if (!state.isLoading && !state.isValidating && 'data' in state) {
    return 'success' as const;
  } else {
    return 'idle' as const;
  }
};

type SwrStateToLoadingState<Data, Error> = Omit<
  SWRInfiniteResponse<Data, Error>,
  'data' | 'error'
> &
  LoadingState<Data[], Error>;
export const swrStateToLoadingState = <Data, Error>({
  data,
  error,
  ...rest
}: SWRInfiniteResponse<Data, Error>): SwrStateToLoadingState<Data, Error> => {
  console.log('FICK', swrStateToStatus({ data, error, ...rest }), {
    data,
    error,
    ...rest,
  });
  return (
    match(swrStateToStatus({ data, error, ...rest }))
      .with('loading', (_tag) => ({ ...rest, _tag, data: data }))
      .with('revalidate', (_tag) => ({ ...rest, _tag, data: data }))
      // safe to make null assertion for the following two lines
      // because we're following documented behaviour of useSWR
      .with('error', (_tag) => ({ ...rest, _tag, error: error! }))
      .with('success', (_tag) => ({ ...rest, _tag, data: data! }))
      .otherwise((_tag) => ({ ...rest, _tag }))
  );
};

// #endregion

export const P = {
  idle: { _tag: 'idle' },
  loading: { _tag: 'loading' },
  revalidate: { _tag: 'revalidate' },
  success: { _tag: 'success' },
  error: { _tag: 'error' },
} as const; // satisfies Record<LoadingStatus, { _tag: LoadingStatus }>;

// TODO interface overloads
export type SWRInfiniteResponseWithLoadingState<Data, Error> =
  SwrStateToLoadingState<Data, Error> & {
    isLoadingMore: boolean;
    isEmpty: boolean;
  };
// TODO find shorter name
export const useSWRInfiniteWithLoadingState = <Data, Error>(
  getKey: SWRInfiniteKeyLoader<Data>
): SWRInfiniteResponseWithLoadingState<Data, Error> => {
  // This hook accepts a function that returns the request key, a fetcher
  // function, and option s. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const state = useSWRInfinite<Data, Error>(getKey);
  const { data, isLoading, isValidating, size, ...rest } = state;

  const pages = data ? emptyTypedList<Data>().concat(...data) : [];
  const isLoadingMore = Boolean(
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );
  const firstPage = data?.[0];
  const isEmpty = firstPage === undefined; // || (firstPage && firstPage.total === 0);

  return {
    ...swrStateToLoadingState({
      ...rest,
      isLoading,
      isValidating,
      size,
      data: pages,
    }),
    isLoadingMore,
    isEmpty,
  };
};

// export const Envelope = <TMessageType extends ZodType>(
//   messageType: TMessageType
// ) =>
//   z.object({
//     from: z.string(),
//     to: z.string(),
//     message: messageType,
//   });

// type EnvelopeType<TMessageType extends ZodType> = ReturnType<
//   typeof Envelope<TMessageType>
// >;

// type Envelope<TMessage> = z.infer<EnvelopeType<ZodType<TMessage>>>;
