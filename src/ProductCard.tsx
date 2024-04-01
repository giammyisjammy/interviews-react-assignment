import { useState, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

import type { Product } from './types';
import { useCart } from './common/queries';

export type ProductCardProps = {
  product: Product;
  // quantity: number;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<void>;
};

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onAdd, onRemove }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleAdd = async () => {
      setIsLoading(true);
      try {
        await onAdd();
      } catch (error) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };
    const handleRemove = async () => {
      setIsLoading(true);
      try {
        await onRemove();
      } catch (error) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };

    const { data: cart } = useCart();
    const quantity =
      cart?.items.find((x) => x.product.id === product.id)?.quantity || 0;

    return (
      <Card style={{ width: '100%' }} ref={ref}>
        <CardMedia component="img" height="150" image={product.imageUrl} />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          </Typography>
        </CardContent>
        <CardActions>
          <Typography variant="h6" component="div">
            ${product.price}
          </Typography>
          <Box flexGrow={1} />
          <Box
            position="relative"
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Box
              position="absolute"
              left={0}
              right={0}
              top={0}
              bottom={0}
              textAlign="center"
            >
              {isLoading && <CircularProgress size={20} />}
            </Box>
            <IconButton
              disabled={isLoading}
              aria-label="delete"
              size="small"
              onClick={handleRemove}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Typography variant="body1" component="div" mx={1}>
              {quantity}
            </Typography>

            <IconButton
              disabled={isLoading}
              aria-label="add"
              size="small"
              onClick={handleAdd}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  }
);
