import { getRemainingBadgeColor } from "./utils.js";

/**
 * renderCards
 * @param {Array} products
 * @param {Array} borrowList
 * @param {Array} inventoryList
 * @param {String} filter - 검색어
 * @param {Array} selectedFields - 선택된 검색 필드
 */
export function renderCards(products, borrowList, inventoryList, filter = "", selectedFields = []) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";
  
  const borrowOnly = document.getElementById("borrowToggle").checked;
  const sortOption = document.getElementById("sortSelect").value;
  const query = filter.trim().toLowerCase();

  // Create lookup maps for faster access
  const productMap = products.reduce((map, product) => {
    map[product.product_id] = product;
    return map;
  }, {});
  const borrowMap = borrowList.reduce((map, borrow) => {
    map[borrow.borrow_id] = borrow;
    return map;
  }, {});

  // 1) Filtering
  const filteredInventory = inventoryList.filter(inv => {
    const product = productMap[inv.product_id];
    if (!product) return false;
    const borrow = borrowMap[inv.borrow_id];

    // "대출 중" 체크 시
    if (borrowOnly && !(borrow && borrow.borrow_id)) return false;
    
    // 검색어 필터링: 검색어가 입력된 경우, 선택한 필드 중 하나라도 일치해야 함.
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

  // 2) Sorting
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

  // 3) Display result count
  document.getElementById("resultCount").innerText = `검색 결과: ${filteredInventory.length}건`;
  
  // 4) Create and append cards
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
      const color = getRemainingBadgeColor(days);
      cardHTML += `<span><strong>남은 일수:</strong> <span style="color:${color}">${days}</span></span>`;
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
    
    // Toggle extra details on card click if there's a borrow record.
    if (borrow && borrow.borrow_id) {
      card.addEventListener("click", () => card.classList.toggle("expanded"));
    }
    
    container.appendChild(card);
  });
}
