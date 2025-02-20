// render.js
import { getRemainingColor } from "./utils.js";

export function renderCards(products, borrowList, inventoryList, filter = "") {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";
  
  const borrowOnly = document.getElementById("borrowToggle").checked;
  const searchFieldsSelect = document.getElementById("searchFieldsSelect");
  const selectedFields = Array.from(searchFieldsSelect.selectedOptions).map(opt => opt.value);
  const sortOption = document.getElementById("sortSelect").value;
  const query = filter.trim().toLowerCase();
  
  let filteredInventory = inventoryList.filter(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    if (!product) return false;
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    if (borrowOnly && !(borrow && borrow["borrow_id"])) return false;
    if (query) {
      let found = false;
      selectedFields.forEach(field => {
        let value = "";
        if (["name", "military_id", "unit", "rank"].includes(field)) {
          if (borrow && borrow[field]) value = borrow[field].toString().toLowerCase();
        } else {
          if (product[field]) value = product[field].toString().toLowerCase();
        }
        if (value.includes(query)) found = true;
      });
      if (!found) return false;
    }
    return true;
  });
  
  // 정렬 적용
  filteredInventory.sort((a, b) => {
    const prodA = products.find(p => p["product_id"] === a["product_id"]);
    const prodB = products.find(p => p["product_id"] === b["product_id"]);
    const borrowA = borrowList.find(b => b["borrow_id"] === a["borrow_id"]);
    const borrowB = borrowList.find(b => b["borrow_id"] === b["borrow_id"]);
    let valA, valB;
    switch (sortOption) {
      case "titleAsc":
        valA = prodA["title"].toLowerCase();
        valB = prodB["title"].toLowerCase();
        return valA.localeCompare(valB);
      case "titleDesc":
        valA = prodA["title"].toLowerCase();
        valB = prodB["title"].toLowerCase();
        return valB.localeCompare(valA);
      case "authorAsc":
        valA = prodA["author"].toLowerCase();
        valB = prodB["author"].toLowerCase();
        return valA.localeCompare(valB);
      case "authorDesc":
        valA = prodA["author"].toLowerCase();
        valB = prodB["author"].toLowerCase();
        return valB.localeCompare(valA);
      case "categoryAsc":
        valA = prodA["category"].toLowerCase();
        valB = prodB["category"].toLowerCase();
        return valA.localeCompare(valB);
      case "categoryDesc":
        valA = prodA["category"].toLowerCase();
        valB = prodB["category"].toLowerCase();
        return valB.localeCompare(valA);
      case "remainingAsc":
        valA = (borrowA && borrowA["remaining_days"]) ? parseFloat(borrowA["remaining_days"]) : Infinity;
        valB = (borrowB && borrowB["remaining_days"]) ? parseFloat(borrowB["remaining_days"]) : Infinity;
        return valA - valB;
      case "remainingDesc":
        valA = (borrowA && borrowA["remaining_days"]) ? parseFloat(borrowA["remaining_days"]) : -Infinity;
        valB = (borrowB && borrowB["remaining_days"]) ? parseFloat(borrowB["remaining_days"]) : -Infinity;
        return valB - valA;
      case "unitAsc":
        valA = (borrowA && borrowA["unit"]) ? borrowA["unit"].toLowerCase() : "";
        valB = (borrowB && borrowB["unit"]) ? borrowB["unit"].toLowerCase() : "";
        return valA.localeCompare(valB);
      case "unitDesc":
        valA = (borrowA && borrowA["unit"]) ? borrowA["unit"].toLowerCase() : "";
        valB = (borrowB && borrowB["unit"]) ? borrowB["unit"].toLowerCase() : "";
        return valB.localeCompare(valA);
      default:
        return 0;
    }
  });
  
  // 결과 갯수 표시
  document.getElementById("resultCount").innerText = "검색 결과: " + filteredInventory.length + "건";
  
  // 카드 생성
  filteredInventory.forEach(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    
    const titleHTML = `<h2 class="card-title">${product["title"]}</h2>`;
    let mainHTML = `<div class="main-info">`;
    mainHTML += `<span><strong>ISBN:</strong> ${product["ea_isbn"]}</span>`;
    mainHTML += `<span><strong>저자:</strong> ${product["author"]}</span>`;
    mainHTML += `<span><strong>카테고리:</strong> ${product["category"]}</span>`;
    if (product["tag"]) {
      const tags = product["tag"].split(",").map(tag => tag.trim()).filter(tag => tag !== "");
      let tagHTML = `<span><strong>태그:</strong> `;
      tags.forEach(t => {
        tagHTML += `<span class="tag">${t}</span>`;
      });
      tagHTML += `</span>`;
      mainHTML += tagHTML;
    }
    if (borrow && borrow["borrow_id"]) {
      const days = borrow["remaining_days"];
      const color = getRemainingColor(days);
      mainHTML += `<span><strong>남은 일수:</strong> <span style="color:${color}">${days}</span></span>`;
    }
    mainHTML += `</div>`;
    
    let extraHTML = "";
    if (borrow && borrow["borrow_id"]) {
      extraHTML += `<div class="extra-details">`;
      extraHTML += `<span><strong>군번:</strong> ${borrow["military_id"]}</span>`;
      extraHTML += `<span><strong>부대:</strong> ${borrow["unit"]}</span>`;
      extraHTML += `<span><strong>계급:</strong> ${borrow["rank"]}</span>`;
      extraHTML += `<span><strong>이름:</strong> ${borrow["name"]}</span>`;
      extraHTML += `</div>`;
    }
    
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = titleHTML + mainHTML + extraHTML;
    
    if (borrow && borrow["borrow_id"]) {
      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    }
    
    container.appendChild(card);
  });
}
  
export { renderCards };
