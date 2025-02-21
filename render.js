import { getRemainingBadgeColor } from "./utils.js";

export function renderCards(products, borrowList, inventoryList, filter = "", selectedFields = []) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";
  
  const borrowOnly = document.getElementById("borrowToggle").checked;
  const sortOption = document.getElementById("sortSelect").value;
  const query = filter.trim().toLowerCase();

  // 빠른 접근을 위해 lookup map 생성
  const productMap = products.reduce((map, prod) => {
    map[prod.product_id] = prod;
    return map;
  }, {});
  const borrowMap = borrowList.reduce((map, bor) => {
    map[bor.borrow_id] = bor;
    return map;
  }, {});

  // 1) 필터링
  const filteredInventory = inventoryList.filter(inv => {
    const product = productMap[inv.product_id];
    if (!product) return false;
    
    const borrow = borrowMap[inv.borrow_id];
    if (borrowOnly && !(borrow && borrow.borrow_id)) return false;
    
    if (query) {
      return selectedFields.some(field => {
        let value = "";
        if (["name", "military_id", "unit", "rank"].includes(field)) {
          value = borrow ? borrow[field] : "";
        } else {
          value = product[field];
        }
        return value && value.toString().toLowerCase().includes(query);
      });
    }
    return true;
  });

  // 2) 정렬
  filteredInventory.sort((a, b) => {
    const prodA = productMap[a.product_id] || {};
    const prodB = productMap[b.product_id] || {};
    const borrowA = borrowMap[a.borrow_id] || {};
    const borrowB = borrowMap[b.borrow_id] || {};
    
    switch (sortOption) {
      case "titleAsc":
        return (prodA.title || "").localeCompare(prodB.title || "");
      case "titleDesc":
        return (prodB.title || "").localeCompare(prodA.title || "");
      case "authorAsc":
        return (prodA.author || "").localeCompare(prodB.author || "");
      case "authorDesc":
        return (prodB.author || "").localeCompare(prodA.author || "");
      case "categoryAsc":
        return (prodA.category || "").localeCompare(prodB.category || "");
      case "categoryDesc":
        return (prodB.category || "").localeCompare(prodA.category || "");
      case "remainingAsc":
        return parseFloat(borrowA.remaining_days || Infinity) - parseFloat(borrowB.remaining_days || Infinity);
      case "remainingDesc":
        return parseFloat(borrowB.remaining_days || -Infinity) - parseFloat(borrowA.remaining_days || -Infinity);
      case "unitAsc":
        return (borrowA.unit || "").localeCompare(borrowB.unit || "");
      case "unitDesc":
        return (borrowB.unit || "").localeCompare(borrowA.unit || "");
      default:
        return 0;
    }
  });

  // 3) 결과 갯수 표시
  document.getElementById("resultCount").innerText = `검색 결과: ${filteredInventory.length}건`;
  
  // 4) 카드 생성
  filteredInventory.forEach(inv => {
    const product = productMap[inv.product_id];
    const borrow = borrowMap[inv.borrow_id];

    let cardHTML = `<h2 class="card-title">${product.title || ""}</h2>`;
    
    cardHTML += `<div class="main-info">
      <span><strong>ISBN:</strong> ${product.ea_isbn || ""}</span>
      <span><strong>저자:</strong> ${product.author || ""}</span>
      <span><strong>카테고리:</strong> ${product.category || ""}</span>`;
    
    if (product.tag) {
      const tags = product.tag.split(",").map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        cardHTML += `<span><strong>태그:</strong> `;
        tags.forEach(tg => {
          cardHTML += `<span class="tag">${tg}</span>`;
        });
        cardHTML += `</span>`;
      }
    }
    
    if (borrow && borrow.borrow_id) {
      const days = parseFloat(borrow.remaining_days || "0");
      const badgeColor = getRemainingBadgeColor(days);
      const displayText = days <= 0 ? "0일 남음" : `${days}일 남음`;
      cardHTML += `<span class="badge" style="background-color:${badgeColor}; color:#000;">${displayText}</span>`;
    }
    
    cardHTML += `</div>`;
    
    if (borrow && borrow.borrow_id) {
      cardHTML += `<div class="extra-details">
        <span><strong>군번:</strong> ${borrow.military_id || ""}</span>
        <span><strong>부대:</strong> ${borrow.unit || ""}</span>
        <span><strong>계급:</strong> ${borrow.rank || ""}</span>
        <span><strong>이름:</strong> ${borrow.name || ""}</span>
      </div>`;
    }
    
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = cardHTML;
    
    if (borrow && borrow.borrow_id) {
      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    }
    
    container.appendChild(card);
  });
}
