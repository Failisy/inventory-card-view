import { getRemainingBadgeColor } from "./utils.js";

/**
 * renderCards
 * @param {Array} products
 * @param {Array} borrowList
 * @param {Array} inventoryList
 * @param {String} filter (검색어)
 * @param {Array} selectedFields (선택된 검색 필드)
 */
export function renderCards(products, borrowList, inventoryList, filter = "", selectedFields = []) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  // "대출 중" 체크박스, 정렬 드롭다운 값 가져오기
  const borrowOnly = document.getElementById("borrowToggle").checked;
  const sortOption = document.getElementById("sortSelect").value;
  const query = filter.trim().toLowerCase();

  // 1) 필터링
  const filteredInventory = inventoryList.filter(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    if (!product) return false;

    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);
    // "대출 중" 체크 시, 대출 기록 없으면 제외
    if (borrowOnly && !(borrow && borrow["borrow_id"])) return false;

    // 검색어가 있으면, selectedFields를 순회하며 매칭 검사
    if (query) {
      let found = false;
      selectedFields.forEach(field => {
        let value = "";
        // borrow 관련 필드
        if (["name", "military_id", "unit", "rank"].includes(field)) {
          if (borrow && borrow[field]) value = borrow[field].toString().toLowerCase();
        } else {
          // product 관련 필드
          if (product[field]) value = product[field].toString().toLowerCase();
        }
        // 검색어가 포함되면 found = true
        if (value.includes(query)) {
          found = true;
        }
      });
      if (!found) return false;
    }
    return true;
  });

  // 2) 정렬
  filteredInventory.sort((a, b) => {
    const prodA = products.find(p => p["product_id"] === a["product_id"]);
    const prodB = products.find(p => p["product_id"] === b["product_id"]);
    const borrowA = borrowList.find(item => item["borrow_id"] === a["borrow_id"]);
    const borrowB = borrowList.find(item => item["borrow_id"] === b["borrow_id"]);

    switch (sortOption) {
      case "titleAsc":
        return (prodA["title"] || "").localeCompare(prodB["title"] || "");
      case "titleDesc":
        return (prodB["title"] || "").localeCompare(prodA["title"] || "");
      case "authorAsc":
        return (prodA["author"] || "").localeCompare(prodB["author"] || "");
      case "authorDesc":
        return (prodB["author"] || "").localeCompare(prodA["author"] || "");
      case "categoryAsc":
        return (prodA["category"] || "").localeCompare(prodB["category"] || "");
      case "categoryDesc":
        return (prodB["category"] || "").localeCompare(prodA["category"] || "");
      case "remainingAsc":
      {
        const valA = borrowA ? parseFloat(borrowA["remaining_days"] || "Infinity") : Infinity;
        const valB = borrowB ? parseFloat(borrowB["remaining_days"] || "Infinity") : Infinity;
        return valA - valB;
      }
      case "remainingDesc":
      {
        const valA = borrowA ? parseFloat(borrowA["remaining_days"] || "-Infinity") : -Infinity;
        const valB = borrowB ? parseFloat(borrowB["remaining_days"] || "-Infinity") : -Infinity;
        return valB - valA;
      }
      case "unitAsc":
      {
        const valA = (borrowA && borrowA["unit"]) ? borrowA["unit"].toLowerCase() : "";
        const valB = (borrowB && borrowB["unit"]) ? borrowB["unit"].toLowerCase() : "";
        return valA.localeCompare(valB);
      }
      case "unitDesc":
      {
        const valA = (borrowA && borrowA["unit"]) ? borrowA["unit"].toLowerCase() : "";
        const valB = (borrowB && borrowB["unit"]) ? borrowB["unit"].toLowerCase() : "";
        return valB.localeCompare(valA);
      }
      default:
        return 0;
    }
  });

  // 3) 결과 갯수 표시
  document.getElementById("resultCount").innerText = "검색 결과: " + filteredInventory.length + "건";

  // 4) 카드 생성
  filteredInventory.forEach(inv => {
    const product = products.find(p => p["product_id"] === inv["product_id"]);
    const borrow = borrowList.find(b => b["borrow_id"] === inv["borrow_id"]);

    // 카드 제목
    let cardHTML = `<h2 class="card-title">${product["title"] || ""}</h2>`;

    // 메인 정보
    cardHTML += `<div class="main-info">`;
    cardHTML += `<span><strong>ISBN:</strong> ${product["ea_isbn"] || ""}</span>`;
    cardHTML += `<span><strong>저자:</strong> ${product["author"] || ""}</span>`;
    cardHTML += `<span><strong>카테고리:</strong> ${product["category"] || ""}</span>`;

    // 태그 (쉼표 구분)
    if (product["tag"]) {
      const tags = product["tag"].split(",").map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        cardHTML += `<span><strong>태그:</strong> `;
        tags.forEach(tg => {
          cardHTML += `<span class="tag">${tg}</span>`;
        });
        cardHTML += `</span>`;
      }
    }

    // 남은 일수: 원형 배지
    if (borrow && borrow["borrow_id"]) {
      const days = parseFloat(borrow["remaining_days"] || "0");
      const badgeColor = getRemainingBadgeColor(days);  // utils.js 함수
      // 0 이하 => "0 일 남음", 그 외 => "{days} 일 남음"
      const displayText = (days <= 0) ? "0 일 남음" : `${days} 일 남음`;
      cardHTML += `
        <span>
          <strong>남은 일수:</strong>
          <span class="badge" style="background-color:${badgeColor}">${displayText}</span>
        </span>`;
    }
    cardHTML += `</div>`; // .main-info 종료

    // 추가 정보 (대출 기록이 있는 경우)
    if (borrow && borrow["borrow_id"]) {
      cardHTML += `<div class="extra-details">`;
      cardHTML += `<span><strong>군번:</strong> ${borrow["military_id"] || ""}</span>`;
      cardHTML += `<span><strong>부대:</strong> ${borrow["unit"] || ""}</span>`;
      cardHTML += `<span><strong>계급:</strong> ${borrow["rank"] || ""}</span>`;
      cardHTML += `<span><strong>이름:</strong> ${borrow["name"] || ""}</span>`;
      cardHTML += `</div>`;
    }

    // 최종 카드 생성
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
