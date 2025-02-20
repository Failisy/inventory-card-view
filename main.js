import { getProducts, getBorrowList, getInventoryList } from "./api.js";
import { renderCards } from "./render.js";

// 전역 데이터
let products = [];
let borrowList = [];
let inventoryList = [];

// Tom Select 인스턴스 (필드 선택용)
let fieldSelectInstance;

// init
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

    // Tom Select 초기화
    fieldSelectInstance = new TomSelect('#searchFieldsSelect', {
      plugins: ['remove_button'], // 선택 항목 제거 버튼
      onChange: () => {
        // 선택된 필드가 바뀔 때마다 다시 렌더링
        doRender();
      },
    });

    // 초기 렌더링
    doRender();
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
  }
}

// 실제 렌더링 호출
function doRender() {
  const query = document.getElementById("searchInput").value.trim();
  const selectedFields = fieldSelectInstance.getValue(); // ex) ["name", "title", ...]
  renderCards(products, borrowList, inventoryList, query, selectedFields);
}

init();

/* 이벤트 핸들러들 */
const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener("click", () => {
  doRender();
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", (e) => {
  if(e.key === "Enter") {
    doRender();
  }
});

const borrowToggle = document.getElementById("borrowToggle");
borrowToggle.addEventListener("change", () => {
  doRender();
});

const sortSelect = document.getElementById("sortSelect");
sortSelect.addEventListener("change", () => {
  doRender();
});
