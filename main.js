import { getProducts, getBorrowList, getInventoryList } from "./api.js";
import { renderCards } from "./render.js";

async function init() {
  try {
    const [products, borrowList, inventoryList] = await Promise.all([
      getProducts(),
      getBorrowList(),
      getInventoryList()
    ]);
    window.products = products;
    window.borrowList = borrowList;
    window.inventoryList = inventoryList;
    console.log("products:", products);
    console.log("borrowList:", borrowList);
    console.log("inventoryList:", inventoryList);
    renderCards();
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
  }
}

init();

// 이벤트 처리
document.getElementById("searchBtn").addEventListener("click", () => {
  renderCards(document.getElementById("searchInput").value);
});
document.getElementById("searchInput").addEventListener("keyup", function(e) {
  if (e.key === "Enter") renderCards(this.value);
});
document.getElementById("borrowToggle").addEventListener("change", () => {
  renderCards(document.getElementById("searchInput").value);
});
document.getElementById("sortSelect").addEventListener("change", () => {
  renderCards(document.getElementById("searchInput").value);
});
document.getElementById("searchFieldsSelect").addEventListener("change", () => {
  renderCards(document.getElementById("searchInput").value);
});
