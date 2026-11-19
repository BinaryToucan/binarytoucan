const demoRows = [
  {id:"BUG-014",title:"Checkout button is inactive",severity:"High"},
  {id:"BUG-021",title:"Profile page returns 500",severity:"High"},
  {id:"BUG-009",title:"Avatar is not updated",severity:"Medium"},
  {id:"BUG-032",title:"Tooltip overlaps the menu",severity:"Low"}
];

const runButton = document.querySelector("#run-query");
runButton?.addEventListener("click", () => {
  const rows = document.querySelector("#query-rows");
  const count = document.querySelector("#result-count");
  const showAll = runButton.dataset.mode !== "all";
  const selected = showAll ? demoRows.slice(0, 2) : demoRows;
  rows.innerHTML = selected.map(row => `
    <tr><td>${row.id}</td><td>${row.title}</td>
    <td><em class="severity ${row.severity.toLowerCase()}">${row.severity}</em></td></tr>
  `).join("");
  count.textContent = `${selected.length} rows returned`;
  runButton.dataset.mode = showAll ? "all" : "high";
  runButton.innerHTML = showAll ? "▶ Show High only" : "▶ Run query";
});
