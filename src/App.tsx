import useSWR from 'swr';

import { Box, CssBaseline } from '@mui/material';
import SearchAppBar from './SearchAppBar.tsx';
import { Categories } from './Categories.tsx';
import { Products } from './Products.tsx';

import type { Cart } from './types.ts';

function App() {
  const { data: cart } = useSWR<Cart, Error>('/cart');

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />
      <SearchAppBar
        quantity={cart?.totalItems || 0}
        price={cart?.totalPrice || 0}
      />
      <Box flex={1} display="flex" flexDirection="row">
        <Categories />
        <Box flex={1}>
          <Products />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
