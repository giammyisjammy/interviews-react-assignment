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

type LoadingState<Data, Error> =
  | { status: 'idle' }
  | { status: 'revalidate' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

export type LoadingStatus = LoadingState<never, never>['status'];
