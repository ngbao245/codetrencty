import axios from "./Customize-Axios";

const fetchAllProdItem = () => {
  return axios.get("ProductItem/get-all-product-items");
};

const getProdItemById = (id) => {
  return axios.get(`ProductItem/get-product-item/${id}`);
};

const getProdItemByProdId = (prodId) => {
  return axios.get(`ProductItem/get-product-item-by-product/${prodId}`);
};

const createProdItem = (data) => {
  return axios.post("ProductItem/create-product-item" , data);
};

const updateProdItem = (id) => {
  return axios.put(`ProductItem/update-product-item/${id}`);
};

const deleteProdItem = (id) => {
  return axios.delete(`ProductItem/delete-product-item/${id}`);
};

export {
  fetchAllProdItem,
  getProdItemById,
  getProdItemByProdId,
  createProdItem,
  updateProdItem,
  deleteProdItem,
};
