document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortOrder = document.getElementById("sortOrder");
  const productContainer = document.getElementById("productContainer");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  let allProducts = [];
  let filteredProducts = [];

  function showLoading() {
    loadingMessage.textContent = "Loading products...";
    errorMessage.textContent = "";
  }

  function hideLoading() {
    loadingMessage.textContent = "";
  }

  function showError(message) {
    errorMessage.textContent = message;
  }

  async function fetchProducts() {
    try {
      showLoading();

      const response = await fetch("https://fakestoreapi.com/products");

      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      const data = await response.json();
      allProducts = data;
      filteredProducts = [...allProducts];

      populateCategories();
      populateSortOptions();
      renderProducts(filteredProducts);

      hideLoading();

    } catch (error) {
      hideLoading();
      showError("Error loading products. Please try again.");
    }
  }

  function populateCategories() {
    const categories = ["all", ...new Set(allProducts.map(p => p.category))];

    categoryFilter.innerHTML = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join("");
  }

  function populateSortOptions() {
    sortOrder.innerHTML = `
      <option value="default">Default</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A-Z</option>
      <option value="name-desc">Name: Z-A</option>
    `;
  }

  function renderProducts(products) {
    productContainer.innerHTML = "";

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No products found</p>";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p><strong>$${product.price}</strong></p>
        <p>${product.category}</p>
        <p>${product.description.substring(0, 80)}...</p>
      `;

      productContainer.appendChild(card);
    });
  }

  function updateProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortOrder.value;

    filteredProducts = allProducts.filter(product => {
      const matchSearch = product.title.toLowerCase().includes(searchTerm);
      const matchCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;

      return matchSearch && matchCategory;
    });

    switch (selectedSort) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    renderProducts(filteredProducts);
  }

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedUpdate = debounce(updateProducts, 300);

  searchInput.addEventListener("input", debouncedUpdate);
  categoryFilter.addEventListener("change", updateProducts);
  sortOrder.addEventListener("change", updateProducts);

  fetchProducts();
});