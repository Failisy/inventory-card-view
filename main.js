import { getProducts, getBorrowList, getInventoryList } from "./api.js";
import { renderCards } from "./render.js";

// 선택된 옵션(필드) 배열
let selectedFields = [];

// 초기 데이터
let products = [];
let borrowList = [];
let inventoryList = [];

/* ---------- 초기화 로직 ---------- */
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
    // 초기 렌더링 (검색어: "")
    renderCards(products, borrowList, inventoryList, "", selectedFields);
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
  }
}
init();

/* ---------- 멀티 셀렉트 UI ---------- */
const multiSelectContainer = document.getElementById("multiSelectContainer");
const selectedTagsEl = document.getElementById("selectedTags");
const optionsDropdown = document.getElementById("optionsDropdown");

// multiSelectContainer 클릭 시 드롭다운 열고 닫기
multiSelectContainer.addEventListener("click", (e) => {
  // 클릭이 태그의 "x" 버튼이라면, 로직은 아래 removeChip에서 처리
  // 그렇지 않다면 open/close 토글
  if (e.target.classList.contains("tag-chip") || e.target.tagName === "SPAN") {
    // pass
  } else {
    multiSelectContainer.classList.toggle("open");
  }
});

// 드롭다운 체크박스 변경
optionsDropdown.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      // 추가
      if (!selectedFields.includes(checkbox.value)) {
        selectedFields.push(checkbox.value);
      }
    } else {
      // 제거
      selectedFields = selectedFields.filter((opt) => opt !== checkbox.value);
    }
    updateSelectedTags();
  });
});

// 선택된 필드를 태그 형태로 표시
function updateSelectedTags() {
  selectedTagsEl.innerHTML = "";
  selectedFields.forEach((opt) => {
    const chip = document.createElement("div");
    chip.className = "tag-chip";
    chip.textContent = opt;
    // 'x' 제거 버튼
    const removeSpan = document.createElement("span");
    removeSpan.textContent = "×";
    removeSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      removeOption(opt);
    });
    chip.appendChild(removeSpan);
    selectedTagsEl.appendChild(chip);
  });
  // 멀티 셀렉트가 업데이트될 때마다 렌더링 갱신 (원한다면)
  renderCards(products, borrowList, inventoryList, searchInput.value, selectedFields);
}

// 태그의 'x' 버튼으로 제거
function removeOption(opt) {
  selectedFields = selectedFields.filter((o) => o !== opt);
  // 체크박스도 해제
  const cb = optionsDropdown.querySelector(`input[value='${opt}']`);
  if (cb) cb.checked = false;
  updateSelectedTags();
}

/* ---------- 검색, 체크박스, 정렬 등 ---------- */
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const borrowToggle = document.getElementById("borrowToggle");
const sortSelect = document.getElementById("sortSelect");

// 검색 버튼
searchBtn.addEventListener("click", () => {
  const query = searchInput.value;
  renderCards(products, borrowList, inventoryList, query, selectedFields);
});

// 검색어 Enter
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    renderCards(products, borrowList, inventoryList, searchInput.value, selectedFields);
  }
});

// "대출 중" 체크
borrowToggle.addEventListener("change", () => {
  renderCards(products, borrowList, inventoryList, searchInput.value, selectedFields);
});

// 정렬 드롭다운
sortSelect.addEventListener("change", () => {
  renderCards(products, borrowList, inventoryList, searchInput.value, selectedFields);
});
