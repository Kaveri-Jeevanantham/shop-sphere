import { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Filter } from 'react-feather';

import ProductList from '../components/ProductList';
import PrimaryButton from '../components/shared/PrimaryButton';
import useInView from '../hooks/useInView';
import SideDrawer from '../components/SideDrawer';
import Filters from '../components/Filters';
import PageNotFound from './PageNotFound';
import Spinner from '../components/shared/SpinnerRect';

import usePageTitle from '../hooks/usePageTitle';

import { fetchProducts, clearProducts } from '../store/productsSlice';
import { fetchAllCategories } from '../store/categoriesSlice';
import { setSort, resetFilters } from '../store/filtersSlice';

import device from '../utils/device';

const sortOptions = [
  {
    sortBy: 'price',
    orderBy: 'asc',
    name: 'Price: Low - High',
  },
  {
    sortBy: 'price',
    orderBy: 'desc',
    name: 'Price: High - Low',
  },
  {
    sortBy: 'date',
    orderBy: 'desc',
    name: `What's new`,
  },
];

const initialSortingOption = {
  sortBy: '',
  orderBy: '',
  name: '',
};

const ProductsComponent = () => {
  const dispatch = useDispatch();
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { products, totalProducts, status } = useSelector(
    (state) => state.products
  );
  const { categories } = useSelector((state) => state.categories);
  const { selectedSizes, priceRange } = useSelector((state) => state.filters);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState(initialSortingOption);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isURLInvalid, setIsURLInvalid] = useState(false);

  const { inView: showMoreButtonInView, ref } = useInView();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    return () => {
      dispatch(resetFilters());
    };
  }, [dispatch]);

  useEffect(() => {
    if (categorySlug) {
      if (categories.length === 0) {
        dispatch(fetchAllCategories());
      } else {
        const productCategoryExist = categories.find(
          (cat) => cat.slug === categorySlug
        );
        if (productCategoryExist) {
          setIsPageLoading(false);
          dispatch(
            fetchProducts({
              category: productCategoryExist.category,
              sortBy: selectedSort.sortBy,
              orderBy: selectedSort.orderBy,
              priceRange,
              sizes: selectedSizes,
            })
          );
          setSelectedCategory(productCategoryExist.category);
          setPageTitle(`${productCategoryExist.category} | ShopSphere`);
        } else {
          setIsPageLoading(false);
          setIsURLInvalid(true);
        }
      }
    } else {
      setIsPageLoading(false);
      dispatch(
        fetchProducts({
          category: '',
          sortBy: selectedSort.sortBy,
          orderBy: selectedSort.orderBy,
          priceRange,
          sizes: selectedSizes,
        })
      );
    }
    return () => {
      dispatch(clearProducts());
    };
  }, [
    categorySlug,
    dispatch,
    categories,
    navigate,
    setPageTitle,
    selectedSort,
    priceRange,
    selectedSizes,
  ]);

  useEffect(() => {
    if (showMoreButtonInView) {
      dispatch(
        fetchProducts({
          category: selectedCategory,
          sortBy: selectedSort.sortBy,
          orderBy: selectedSort.orderBy,
          sizes: selectedSizes,
          priceRange,
        })
      );
    }
  }, [
    showMoreButtonInView,
    selectedCategory,
    selectedSort,
    dispatch,
    selectedSizes,
    priceRange,
  ]);

  const showMoreProducts = () => {
    dispatch(
      fetchProducts({
        category: selectedCategory,
        sortBy: selectedSort.sortBy,
        orderBy: selectedSort.orderBy,
        sizes: selectedSizes,
        priceRange,
      })
    );
  };

  const onSortOptionChanged = (e) => {
    const newSortOption =
      sortOptions.find((sort) => sort.name === e.target.value) ||
      initialSortingOption;
    setSelectedSort(newSortOption);
    dispatch(
      setSort({
        sortBy: newSortOption.sortBy,
        orderBy: newSortOption.orderBy,
      })
    );
  };

  if (isPageLoading || (status === 'loading' && products.length === 0))
    return <Spinner />;

  if (isURLInvalid) return <PageNotFound />;

  return (
    <Container>
      <SideDrawer
        direction="right"
        showSideDrawer={showSideDrawer}
        onSideDrawerClose={() => setShowSideDrawer(false)}
      >
        <Filters closeSideDrawer={() => setShowSideDrawer(false)} />
      </SideDrawer>
      <Wrapper>
        <Title>{selectedCategory || 'All Categories'}</Title>
        <FiltersContainer>
          <FilterButton
            onClick={() => {
              setShowSideDrawer(true);
            }}
          >
            <span>
              <Filter />
            </span>
            Filters
          </FilterButton>
          <SortBySelect
            value={selectedSort.name}
            onChange={onSortOptionChanged}
          >
            <SortByOption value="">Sort By</SortByOption>
            {sortOptions.map((sort) => (
              <SortByOption value={sort.name} key={sort.name}>
                {sort.name}
              </SortByOption>
            ))}
          </SortBySelect>
        </FiltersContainer>
      </Wrapper>
      <ProductsContainer>
        {status !== 'loading' && totalProducts === 0 && (
          <Paragraph>No Products Found!</Paragraph>
        )}
        <ProductList products={products} />
        {totalProducts > 0 && (
          <Paragraph>
            Showing {products.length} of {totalProducts} results
          </Paragraph>
        )}
        {products.length < totalProducts && (
          <ShowMoreButton onClick={showMoreProducts} ref={ref}>
            Load More
          </ShowMoreButton>
        )}
      </ProductsContainer>
    </Container>
  );
};

const Products = () => {
  const { categorySlug } = useParams();
  return (
    <Fragment key={categorySlug}>
      <ProductsComponent />
    </Fragment>
  );
};

const Container = styled.div`
  padding: 50px 20px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 25px;
  font-weight: 500;
  @media ${device.tablet} {
    font-size: 18px;
    margin-right: 10px;
  }
  @media ${device.mobileM} {
    font-size: 18px;
    margin-right: 10px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  background: teal;
  color: white;
  border: none;
  padding: 12px 15px;
  text-transform: uppercase;
  margin-right: 10px;
  box-shadow: 2px 2px 5px 1px rgb(0 0 0 / 20%);
  border: 1px solid transparent;
  cursor: pointer;
  & span {
    margin-right: 5px;
    display: flex;
  }
  & svg {
    width: 16px;
    height: 16px;
    stroke: white;
  }
  @media ${device.tablet} {
    font-size: 14px;
  }
  @media ${device.mobileM} {
    font-size: 14px;
  }
`;

const SortBySelect = styled.select`
  font-size: 18px;
  cursor: pointer;
  @media ${device.tablet} {
    font-size: 14px;
  }
  @media ${device.mobileM} {
    font-size: 14px;
  }
`;

const SortByOption = styled.option``;

const ProductsContainer = styled.div`
  margin-top: 40px;
`;

const Paragraph = styled.p`
  text-align: center;
  margin-top: 20px;
`;

const ShowMoreButton = styled(PrimaryButton)`
  display: block;
  margin: 20px auto;
  @media ${device.tablet} {
    font-size: 14px;
  }
  @media ${device.mobileM} {
    font-size: 14px;
  }
`;

export default Products;
