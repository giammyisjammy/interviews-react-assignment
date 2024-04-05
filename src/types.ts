export type Product = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  itemInCart: number;
  loading: boolean;
};

export type ProductPage = {
  hasMore: boolean;
  products: Product[];
  total: number;
};

export type Cart = {
  items: { product: Product; quantity: number }[];
  totalPrice: number;
  totalItems: number;
};

// I know I want to model something along this lines for consistently
// handle request states but I'm finding difficulties in implementing
// a good abstractions that interfaces well with useSWR interface. In
// the interest of time, I keep it and follow the guidelines on useSWR
// official docs.

// export type LoadingState<T> =
//   | { status: 'idle' }
//   | { status: 'loading' }
//   | { status: 'success'; data: T }
//   | { status: 'error'; error: Error };

// export type LoadingStatus = LoadingState<unknown>['status'];
