import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Product } from './types';
import React, { useState } from 'react';

export type ProductCardProps = {
  product: Product;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<void>;
};

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onAdd, onRemove }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleAdd = async () => {
      console.log('handleAdd');
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
      console.log('handleRemove');
      setIsLoading(true);
      try {
        await onRemove();
      } catch (error) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };

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
              {product.itemInCart || 0}
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
