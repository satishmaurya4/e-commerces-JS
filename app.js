// variables

const CART_BTN = document.querySelector(".cart-btn");
const CLOSE_CART_BTN = document.querySelector(".close-cart");
const CLEAR_CART_BTN = document.querySelector(".clear-cart");
const CART_DOM = document.querySelector(".cart");
const CART_OVERLAY = document.querySelector(".cart-overlay");
const CART_ITEMS = document.querySelector(".cart-items");
const CART_TOTAL = document.querySelector(".cart-total");
const CART_CONTENT = document.querySelector(".cart-content");
const PRODUCTS_DOM = document.querySelector(".products-center");

// cart
let CART = [];

// buttons dom

let BUTTONS_DOM = [];

let allProducts = []; // it's without local storage

// getting products

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class Ui {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <article class="product">
        <div class="img-container">
          <img
            src=${product.image}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"> </i>
            add to bag
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      `;
    });
    PRODUCTS_DOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    BUTTONS_DOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = CART.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products(localstorage)
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // console.log(cartItem);
        // console.log("all products", allProducts);

        // add product to the cart
        CART = [...CART, cartItem]
        // save cart in local storage
        Storage.saveCart(CART);
        // set cart values
        this.setCartValues(CART);
        // display cart items
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();

      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })

    // can we done like this as well
    // cart.forEach((item) => {
    //   tempTotal += item.price * item.amount;
    //   itemsTotal += item.amount;
    // })
    CART_TOTAL.innerText = parseFloat(tempTotal.toFixed(2));
    CART_ITEMS.innerText = itemsTotal;
    // can we done like this as well
    // CART_ITEMS.innerText = cart.length; 
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src=${item.image} />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id = ${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id = ${item.id}></i>
            </div>
    `
    CART_CONTENT.appendChild(div);

  }
  showCart() {
    CART_OVERLAY.classList.add('transparentBcg');
    CART_DOM.classList.add('showCart');
  }
  setupAPP() {
    CART = Storage.getCart();
    this.setCartValues(CART);
    this.populateCart(CART);
    CART_BTN.addEventListener('click', this.showCart);
    CLOSE_CART_BTN.addEventListener('click', this.hideCart)
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    CART_OVERLAY.classList.remove('transparentBcg');
    CART_DOM.classList.remove('showCart');
  }
  cartLogic() {
    CLEAR_CART_BTN.addEventListener('click', () => { this.clearCart() });
    CART_CONTENT.addEventListener('click', (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        CART_CONTENT.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = CART.find((item) => item.id === id);
        console.log(tempItem)
        tempItem.amount = tempItem.amount + 1;
        console.log("Cart", CART);
        Storage.saveCart(CART);
        this.setCartValues(CART);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = CART.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(CART);
          this.setCartValues(CART);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          CART_CONTENT.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
       }
    })
  }
  clearCart() {
    let cartItems = CART.map((item) => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log("Cart content children",CART_CONTENT.children);
    while (CART_CONTENT.children.length > 0) {
      CART_CONTENT.removeChild(CART_CONTENT.children[0])
    }
    this.hideCart();
  }
  removeItem(id) {
    CART = CART.filter((item) => item.id !== id);  
    this.setCartValues(CART);
    Storage.saveCart(CART);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
  }
  getSingleButton(id) {
    return BUTTONS_DOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    // let products = JSON.parse(localStorage.getItem('products'));
    let products = allProducts; // it's without local storage
    
    return products.find((product) => product.id === id);
  }
  static saveCart(cart){
localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem('cart') ?JSON.parse(localStorage.getItem('cart')): [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const UI = new Ui();
  const PRODUCTS = new Products();
// setup app
UI.cartLogic();
  UI.setupAPP();
  

  // get all products
  PRODUCTS.getProducts()
    .then((products) => {
      console.log(products);
      UI.displayProducts(products);
      Storage.saveProducts(products);
      allProducts = products; // without local storage
    })
    .then(() => {
      UI.getBagButtons();
    });
  console.log("dom loaded")
});
