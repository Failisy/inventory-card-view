import { getRemainingBadgeColor } from "./utils.js";

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
    // "대출 중" 체크
    if (borrowOnly && !(borrow && borrow["borrow_id"])) return false;

    // 검색어가 있을 경우, selectedFields 기반 필터
    if (query) {
      let found = false;
      selectedFields.forEach(field => {
        let value = "";
        if (["name", "military_id", "unit", "rank"].includes(field)) {
          if (borrow && borrow[field]) value = borrow[field].toString().toLowerCase();
        } else {
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
  
  // 2. 정렬 (기존 로직 그대로)
  filteredInventory.sort((a, b) => {
    // ... 기존 정렬 로직 ...
  });
  
  // 3. 결과 갯수 표시
  document.getElementById("resultCount").innerText = "검색 결과: " + filteredInventory.length + "건";
  
  // 4. 카드 생성
  filteredInventory.forEach(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    
    // 제목
    let cardHTML = `<h2 class="card-title">${product["title"] || ""}</h2>`;
    
    // 메인 정보
    cardHTML += `<div class="main-info">`;
    cardHTML += `<span><strong>ISBN:</strong> ${product["ea_isbn"] || ""}</span>`;
    cardHTML += `<span><strong>저자:</strong> ${product["author"] || ""}</span>`;
    cardHTML += `<span><strong>카테고리:</strong> ${product["category"] || ""}</span>`;
    // 태그
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
    // 남은 일수
    if (borrow && borrow["borrow_id"]) {
      const d = parseFloat(borrow["remaining_days"] || "0");
      const badgeColor = getRemainingBadgeColor(d);
      // 0 이하 => "0 일 남음", 그 외 => "d 일 남음"
      const displayText = d <= 0 ? "0 일 남음" : `${d} 일 남음`;
      cardHTML += `
        <span>
          <strong>남은 일수:</strong>
          <span class="badge" style="background-color:${badgeColor}">${displayText}</span>
        </span>`;
    }
    cardHTML += `</div>`; // .main-info 끝
    
    // 추가 정보 (대출 기록이 있을 경우)
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
    
    // 카드 클릭 시 추가 정보 토글
    if (borrow && borrow["borrow_id"]) {
      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    }
    
    container.appendChild(card);
  });
}
