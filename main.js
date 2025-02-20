import { getProducts, getBorrowList, getInventoryList } from "./api.js";
import { renderCards } from "./render.js";

async function init() {
  try {
    const [products, borrowList, inventoryList] = await Promise.all([
      getProducts(),
      getBorrowList(),
      getInventoryList()
    ]);
    // 전역 변수에 저장 (나중 이벤트에서도 활용)
    window.products = products;
    window.borrowList = borrowList;
    window.inventoryList = inventoryList;
    console.log("products:", products);
    console.log("borrowList:", borrowList);
    console.log("inventoryList:", inventoryList);
    // 초기 렌더링: 인자 전달
    renderCards(products, borrowList, inventoryList, "");
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
  }
}

init();

// 이벤트 처리: 각 이벤트에서 renderCards에 필요한 인자들을 전달합니다.
document.getElementById("searchBtn").addEventListener("click", () => {
  renderCards(window.products, window.borrowList, window.inventoryList, document.getElementById("searchInput").value);
});
document.getElementById("searchInput").addEventListener("keyup", function(e) {
  if (e.key === "Enter") renderCards(window.products, window.borrowList, window.inventoryList, this.value);
});
document.getElementById("borrowToggle").addEventListener("change", () => {
  renderCards(window.products, window.borrowList, window.inventoryList, document.getElementById("searchInput").value);
});
document.getElementById("sortSelect").addEventListener("change", () => {
  renderCards(window.products, window.borrowList, window.inventoryList, document.getElementById("searchInput").value);
});
document.getElementById("searchFieldsSelect").addEventListener("change", () => {
  renderCards(window.products, window.borrowList, window.inventoryList, document.getElementById("searchInput").value);
});
