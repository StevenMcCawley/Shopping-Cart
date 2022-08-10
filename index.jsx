// sumulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, inStock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, inStock: 3 },
  { name: "Beans", country: "USA", cost: 2, inStock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, inStock: 8 },
];
const photos = [
  "./resources/apple.png",
  "./resources/orange.png",
  "./resources/beans.png",
  "./resources/cabbage.png",
];
const Cart = () => {
  const { Accordion } = ReactBootstrap;
  // let data = props.location.data ? props.location.data : products;
  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel)
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        if (!didCancel) dispatch({ type: "FETCH_FAILURE" });
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = () => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const { Card, Accordion, Button } = ReactBootstrap;
  const { useState } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data }, doFetch] = useDataApi("http://localhost:1337/api/products", {
    data: [],
  });
  const addToCart = (e) => {
    let item = items.filter((item) => item.name == e.target.name);
    if (item && item[0].inStock == 0) return;
    item[0].inStock -= 1;
    setCart([...cart, ...item]);
  };
  const deleteCartItem = (delIndex) => {
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index);
    let newItems = items.map((item, index) => {
      if (item.name == target[0].name) item.inStock += 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };

  let list = items.map((item, index) => {
    return (
      <li key={index} className="container-fluid py-3">
        <div className="row">
          <div className="col-6">
            <img
              className="img-fluid rounded-circle"
              src={photos[index]}
              alt={item.name}
              roundedcircle="true"
            ></img>
          </div>
          <div className="col-6">
            <h4>{item.name}</h4>
            <h6>${item.cost}</h6>
            <h6>In stock: {item.inStock}</h6>
            <input
              className="btn btn-primary"
              name={item.name}
              type="submit"
              onClick={addToCart}
              value="Add to cart"
            ></input>
          </div>
        </div>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index} className="border-0">
        <Card.Header className="bg-dark">
          <Accordion.Toggle
            as={Button}
            variant="link"
            eventKey={1 + index}
            className="d-flex container-fluid justify-content-between bg-dark"
          >
            <div>{item.name}</div>
            <div>${item.cost}</div>
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body className="text-dark">
            ${item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div
          className="d-flex justify-content-between py-3"
          key={index}
          index={index}
        >
          <div>{item.name}</div>
          <div>${item.cost}</div>
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    return costs.reduce(reducer, 0);
  };
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = JSON.parse(JSON.stringify(data)).data.map((item) => {
      let { name, country, cost, inStock } = item.attributes;
      return { name, country, cost, inStock };
    });
    let finalItems = [];
    for (let i = 0; i < newItems.length; i++)
      finalItems.push({
        name: newItems[i].name,
        country: newItems[i].country,
        cost: newItems[i].cost,
        inStock: newItems[i].inStock + items[i].inStock,
      });
    setItems(finalItems);
  };

  return (
    <>
      <div className="container py-3">
        <div className="row">
          <div className="col-4">
            <h3>Products</h3>
            <ul
              style={{ listStyleType: "none" }}
              className="list-group py-3"
              id="productList"
            >
              {list}
            </ul>
          </div>
          <div className="col-8 border-left border-primary">
            <h3>Your Cart</h3>
            <Accordion>{cartList}</Accordion>
            <div className="text-right py-3">
              <h4>Total: ${finalList().total}</h4>
              <div
                className="btn btn-primary align-self-end"
                onClick={checkOut}
              >
                Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <form
          className="my-3"
          onSubmit={(event) => {
            restockProducts(`${query}`);
            event.preventDefault();
          }}
        >
          <div className="form-group">
            <label htmlFor="restockQ">Restock supplies from:</label>
            <div className="input-group">
              <input
                className="form-control input-group-prepend"
                id="restockQ"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                ReStock
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
ReactDOM.render(<Products />, document.getElementById("root"));
