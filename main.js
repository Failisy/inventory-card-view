import { getProducts, getBorrowList, getInventoryList } from "./api.js";
import { renderCards } from "./render.js";

let products = [];
let borrowList = [];
let inventoryList = [];

let fieldSelectInstance;

async function init() {
  try {
    const [p, b, i] = await Promise.all([
      getProducts(),
      getBorrowList(),
      getInventoryList()
    ]);
    products = p;
    borrowList = b;
    inventoryList = i;
    console.log("products:", products);
    console.log("borrowList:", borrowList);
    console.log("inventoryList:", inventoryList);

    // Tom Select 초기화 (기본 선택 없음)
    fieldSelectInstance = new TomSelect('#searchFieldsSelect', {
      plugins: ['remove_button'],
      onChange: () => {
        doRender();
      }
    });
    
    doRender();
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
  }
}

function doRender() {
  const query = document.getElementById("searchInput").value.trim();
  // 선택된 필드가 없으면 전체 필드로 간주
  const selectedFieldsFromSelect = fieldSelectInstance.getValue();
  const selectedFields = selectedFieldsFromSelect.length === 0
    ? ["name", "military_id", "category", "tag", "title", "author", "publisher", "ea_isbn"]
    : selectedFieldsFromSelect;
  renderCards(products, borrowList, inventoryList, query, selectedFields);
}

init();

document.getElementById("searchBtn").addEventListener("click", () => {
  doRender();
});
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") doRender();
});
document.getElementById("borrowToggle").addEventListener("change", () => {
  doRender();
});
document.getElementById("sortSelect").addEventListener("change", () => {
  doRender();
});
