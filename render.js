import { getRemainingColor } from "./utils.js";

export function renderCards(products, borrowList, inventoryList, filter = "", selectedFields = []) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";
  
  const borrowOnly = document.getElementById("borrowToggle").checked;
  const sortOption = document.getElementById("sortSelect").value;
  const query = filter.trim().toLowerCase();
  
  // 1. 필터링
  let filteredInventory = inventoryList.filter(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    if (!product) return false;
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    if (borrowOnly && !(borrow && borrow["borrow_id"])) return false;
    
    // 검색어가 있을 경우, 선택된 필드(selectedFields)에서 검색
    if (query) {
      let found = false;
      selectedFields.forEach(field => {
        let value = "";
        // borrow 관련 필드
        if (["name", "military_id", "unit", "rank"].includes(field)) {
          if (borrow && borrow[field]) value = borrow[field].toString().toLowerCase();
        } else { // product 관련 필드
          if (product[field]) value = product[field].toString().toLowerCase();
        }
        if (value.includes(query)) {
          found = true;
        }
      });
      if (!found) return false;
    }
    return true;
  });
  
  // 2. 정렬
  filteredInventory.sort((a, b) => {
    const prodA = products.find(p => p["product_id"] === a["product_id"]);
    const prodB = products.find(p => p["product_id"] === b["product_id"]);
    const borrowA = borrowList.find(item => item["borrow_id"] === a["borrow_id"]);
    const borrowB = borrowList.find(item => item["borrow_id"] === b["borrow_id"]);
    let valA, valB;
    switch (sortOption) {
      case "titleAsc":
        valA = (prodA["title"] || "").toLowerCase();
        valB = (prodB["title"] || "").toLowerCase();
        return valA.localeCompare(valB);
      case "titleDesc":
        valA = (prodA["title"] || "").toLowerCase();
        valB = (prodB["title"] || "").toLowerCase();
        return valB.localeCompare(valA);
      case "authorAsc":
        valA = (prodA["author"] || "").toLowerCase();
        valB = (prodB["author"] || "").toLowerCase();
        return valA.localeCompare(valB);
      case "authorDesc":
        valA = (prodA["author"] || "").toLowerCase();
        valB = (prodB["author"] || "").toLowerCase();
        return valB.localeCompare(valA);
      case "categoryAsc":
        valA = (prodA["category"] || "").toLowerCase();
        valB = (prodB["category"] || "").toLowerCase();
        return valA.localeCompare(valB);
      case "categoryDesc":
        valA = (prodA["category"] || "").toLowerCase();
        valB = (prodB["category"] || "").toLowerCase();
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
  
  // 3. 결과 갯수 표시
  document.getElementById("resultCount").innerText = "검색 결과: " + filteredInventory.length + "건";
  
  // 4. 카드 생성
  filteredInventory.forEach(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    
    // 카드 상단에 제목 표시
    let cardHTML = `<h2 class="card-title">${product["title"] || ""}</h2>`;
    
    // 인라인 메인 정보
    cardHTML += `<div class="main-info">`;
    cardHTML += `<span><strong>ISBN:</strong> ${product["ea_isbn"] || ""}</span>`;
    cardHTML += `<span><strong>저자:</strong> ${product["author"] || ""}</span>`;
    cardHTML += `<span><strong>카테고리:</strong> ${product["category"] || ""}</span>`;
    if (product["tag"]) {
      const tags = product["tag"].split(",").map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        cardHTML += `<span><strong>태그:</strong> `;
        tags.forEach(t => {
          cardHTML += `<span class="tag">${t}</span>`;
        });
        cardHTML += `</span>`;
      }
    }
    if (borrow && borrow["borrow_id"]) {
      const days = parseFloat(borrow["remaining_days"] || "0");
      const color = getRemainingColor(days);
      cardHTML += `<span><strong>남은 일수:</strong> <span style="color:${color}">${days}</span></span>`;
    }
    cardHTML += `</div>`;
    
    // 확장 시 추가 정보 (대출 기록이 있을 경우)
    if (borrow && borrow["borrow_id"]) {
      cardHTML += `<div class="extra-details">`;
      cardHTML += `<span><strong>군번:</strong> ${borrow["military_id"] || ""}</span>`;
      cardHTML += `<span><strong>부대:</strong> ${borrow["unit"] || ""}</span>`;
      cardHTML += `<span><strong>계급:</strong> ${borrow["rank"] || ""}</span>`;
      cardHTML += `<span><strong>이름:</strong> ${borrow["name"] || ""}</span>`;
      cardHTML += `</div>`;
    }
    
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = cardHTML;
    
    // 카드 클릭 시 추가 정보 토글 (대출 기록이 있는 경우)
    if (borrow && borrow["borrow_id"]) {
      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    }
    
    container.appendChild(card);
  });
}
