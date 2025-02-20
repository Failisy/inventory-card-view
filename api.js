export const spreadsheetId = "1cdECKnvPoVWmvw36BDEp5JeIRHKXRaGHeaqqWWRB9Ow";
export const productGid = "0";
export const borrowListGid = "164497694";
export const inventoryGid = "1418885749";

export function parseGvizData(text, overrideKeys) {
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf(')'));
  const json = JSON.parse(jsonStr);
  const cols = overrideKeys ? overrideKeys : json.table.cols.map(col => col.label);
  const rows = json.table.rows;
  const dataArray = [];
  rows.forEach(row => {
    const obj = {};
    row.c.forEach((cell, index) => {
      const key = cols[index];
      obj[key] = cell ? cell.v : "";
    });
    dataArray.push(obj);
  });
  return dataArray;
}

export async function getProducts() {
  const productUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${productGid}`;
  const res = await fetch(productUrl);
  const text = await res.text();
  return parseGvizData(text);
}

export async function getBorrowList() {
  const borrowUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${borrowListGid}`;
  const res = await fetch(borrowUrl);
  const text = await res.text();
  return parseGvizData(text, [
    "borrow_id", "product_id", "borrower_id", "unit", "rank", "name",
    "military_id", "password", "borrow_date", "return_date", "due_date", "remaining_days"
  ]);
}

export async function getInventoryList() {
  const inventoryUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${inventoryGid}`;
  const res = await fetch(inventoryUrl);
  const text = await res.text();
  return parseGvizData(text, ["inventory_id", "product_id", "borrow_id"]);
}
