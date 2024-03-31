import { Box, CssBaseline } from '@mui/material';
import SearchAppBar from './SearchAppBar.tsx';
import { Categories } from './Categories.tsx';
import { Products } from './Products.tsx';

import { useCart } from './common/queries.ts';
import { Providers } from './common/Providers.tsx';

function App() {
  const { data: cart } = useCart();

  return (
    <Providers>
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
    </Providers>
  );
}

export default App;
