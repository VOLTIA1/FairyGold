const animatedItems = document.querySelectorAll(".animate-fade-in");
animatedItems.forEach((el, i) => {
  el.style.animationDelay = `${i * 0.2}s`;
});

fetch(
  "https://opensheet.elk.sh/11ELp-eBwvd14yK6UkboyYgWpsq0Gbb92SLao8iewcWY/Database"
)
  .then((res) => res.json())
  .then((data) => {
    let allData = data.filter(
      (row) => row.Price && !isNaN(Number(row.Price.replace(/,/g, "")))
    );
    let categories = [
      ...new Set(allData.map((row) => row.Category).filter(Boolean)),
    ];
    const sheetTable = document.getElementById("sheet-table");
    const categoryFilter = document.getElementById("category-filter");
    const searchInput = document.getElementById("item-search");
    const pagination = document.getElementById("pagination");
    let currentPage = 1;
    const itemsPerPage = 18;
    let filtered = allData;

    // Fill category dropdown
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });

    function render(items, page = 1) {
      let start = (page - 1) * itemsPerPage;
      let end = start + itemsPerPage;
      let paged = items.slice(start, end);
      let html = '<div class="row justify-content-center g-2">';
      paged.forEach((row) => {
        let priceNum = Number(row.Price.replace(/,/g, ""));
        let displayPrice = priceNum;
        if (priceNum >= 1000 && priceNum < 1000000) {
          displayPrice =
            (priceNum / 1000).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + "K";
        } else if (priceNum >= 1000000 && priceNum < 1000000000) {
          displayPrice =
            (priceNum / 1000000).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + "M";
        } else if (priceNum >= 1000000000) {
          displayPrice =
            (priceNum / 1000000000).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + "B";
        }
        html += `
<div class="col-6 col-md-4 col-lg-3 col-xl-2 mb-4">
  <div class="item-card text-center border-0">
    ${row.Link ? `<img src="${row.Link}" alt="${row["Item Name"] || ""}">` : ""}
    <h6>${row["Item Name"] || ""}</h6>
    <div class="text-gold">${displayPrice}</div>
    <div class="mb-2 controls">
      <input type="number" min="1" value="1" class="form-control form-control-sm d-inline-block" style="width:60px;" id="qty-${
        row["Item Name"]
      }">
      <button class="btn btn-sm btn-gold add-to-cart" data-item='${JSON.stringify(
        row
      ).replace(/'/g, "&#39;")}' data-name="${row["Item Name"]}">Add</button>
    </div>
    
  </div>
</div>
`;
      });
      html += "</div>";
      sheetTable.innerHTML = html;
      // Animate items one by one
      const cards = sheetTable.querySelectorAll(".item-card");
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add("visible");
        }, i * 80); // 80ms delay between each
      });
      renderPagination(items.length, page);
    }

    let windowSize = window.innerWidth < 460 ? 1 : 3;

    window.addEventListener("resize", () => {
      const newWindowSize = window.innerWidth < 460 ? 1 : 3;
      if (newWindowSize !== windowSize) {
        windowSize = newWindowSize;
        renderPagination(filtered.length, currentPage);
      }
    });

    function renderPagination(totalItems, page) {
      let totalPages = Math.ceil(totalItems / itemsPerPage);
      let html = "";
      if (totalPages > 1) {
        html += `<nav><ul class="pagination pagination-sm mb-0">`;

        // Prev button
        if (page > 1) {
          html += `<li class="page-item"><button class="page-prev btn btn-outline-secondary btn-sm" data-page="${
            page - 1
          }">&lt; Prev</button></li>`;
        } else {
          html += `<li class="page-item disabled"><span class="page-prev btn btn-outline-secondary btn-sm">&lt; Prev</span></li>`;
        }
        // Use the global windowSize variable
        let start = Math.max(2, page - Math.floor(windowSize / 2));
        let end = Math.min(totalPages - 1, start + windowSize - 1);

        // Adjust start if we're near the end
        if (end > totalPages - 1) {
          end = totalPages - 1;
          start = Math.max(2, end - windowSize + 1);
        }

        // Always show first page
        html += `<li class="page-item${
          page === 1 ? " active" : ""
        }"><button class="page-link" data-page="1">1</button></li>`;

        // Ellipsis before window
        if (start > 2) {
          html += `<li class="page-ellipsis">…</li>`;
        }

        // Page numbers window
        for (let i = start; i <= end; i++) {
          html += `<li class="page-item${
            i === page ? " active" : ""
          }"><button class="page-link" data-page="${i}">${i}</button></li>`;
        }

        // Ellipsis after window
        if (end < totalPages - 1) {
          html += `<li class="page-ellipsis">…</li>`;
        }

        // Always show last page if more than 1
        if (totalPages > 1) {
          html += `<li class="page-item${
            page === totalPages ? " active" : ""
          }"><button class="page-link" data-page="${totalPages}">${totalPages}</button></li>`;
        }

        // Next button
        if (page < totalPages) {
          html += `<li class="page-item"><button class="page-next btn btn-outline-secondary btn-sm" data-page="${
            page + 1
          }">Next &gt;</button></li>`;
        } else {
          html += `<li class="page-item disabled"><span class="page-next btn btn-outline-secondary btn-sm">Next &gt;</span></li>`;
        }

        html += `</ul></nav>`;
      }
      pagination.innerHTML = html;
      // Add event listeners only to enabled buttons
      pagination.querySelectorAll("button[data-page]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          currentPage = Number(btn.dataset.page);
          render(filtered, currentPage);
        });
      });
    }
    // Filter logic
    function filterAndRender() {
      let search = searchInput.value.toLowerCase();
      let cat = categoryFilter.value;
      filtered = allData.filter(
        (row) =>
          (!cat || row.Category === cat) &&
          (!search ||
            (row["Item Name"] &&
              row["Item Name"].toLowerCase().includes(search)))
      );
      currentPage = 1;
      render(filtered, currentPage);
    }

    // Initial render
    render(allData, currentPage);

    searchInput.addEventListener("input", filterAndRender);
    categoryFilter.addEventListener("change", filterAndRender);
  })
  .catch(() => {
    document.getElementById("sheet-table").innerHTML =
      '<p class="text-danger">Failed to load data.</p>';
  });
let cart = {};

function updateCartDisplay() {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  let total = 0;
  let count = 0;
  let html = "";
  Object.values(cart).forEach((item) => {
    let priceNum = Number(item.Price.replace(/,/g, ""));
    let itemTotal = priceNum * item.qty;
    total += itemTotal;
    count += item.qty;
    html += `
  <div class="cart-item">
    ${item.Link ? `<img src="${item.Link}" alt="" class="cart-img">` : ""}
    <div class="cart-info">
      <div class="cart-row">
        <span class="cart-title">${item["Item Name"]}</span>
        <button class="btn remove-cart-item" data-name="${
          item["Item Name"]
        }" title="Remove">&times;</button>
      </div>
      <div class="cart-row mt-1">
        <div class="cart-qty-wrap">
          <input type="number" min="1" value="${
            item.qty
          }" class="form-control form-control-sm cart-qty-input" data-name="${
      item["Item Name"]
    }">
        </div>
        <span class="cart-price">${formatGoldPrice(itemTotal)} gp</span>
      </div>
    </div>
  </div>
`;
  });
  function formatGoldPrice(num) {
    if (num >= 1_000_000_000)
      return (
        (num / 1_000_000_000).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }) + "B"
      );
    if (num >= 1_000_000)
      return (
        (num / 1_000_000).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }) + "M"
      );
    if (num >= 1_000)
      return (
        (num / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) +
        "K"
      );
    return num.toLocaleString();
  }
  cartItemsDiv.innerHTML =
    html || '<div class="text-muted">Cart is empty.</div>';
  cartCount.textContent = count;
  cartTotal.textContent = formatGoldPrice(total);
  // Remove item
  cartSidebar.querySelectorAll(".remove-cart-item").forEach((btn) => {
    btn.onclick = () => {
      delete cart[btn.dataset.name];
      updateCartDisplay();
    };
  });
  // Change qty
  cartSidebar.querySelectorAll(".cart-qty-input").forEach((input) => {
    input.onchange = () => {
      let val = Math.max(1, parseInt(input.value) || 1);
      cart[input.dataset.name].qty = val;
      updateCartDisplay();
    };
  });
}
// Cart sidebar toggle
document.getElementById("cart-toggle").onclick = () => {
  document.getElementById("cart-sidebar").style.right = "0";
};
document.getElementById("cart-close").onclick = () => {
  document.getElementById("cart-sidebar").style.right = "-400px";
};

// Add to cart logic (delegate after render)
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const row = JSON.parse(e.target.dataset.item.replace(/&#39;/g, "'"));
    const qtyInput = document.getElementById("qty-" + row["Item Name"]);
    const qty = Math.max(1, parseInt(qtyInput.value) || 1);
    if (cart[row["Item Name"]]) {
      cart[row["Item Name"]].qty += qty;
    } else {
      cart[row["Item Name"]] = { ...row, qty };
    }
    updateCartDisplay();

    // Add shake effect to cart button
    const cartBtn = document.getElementById("cart-toggle");
    cartBtn.classList.add("cart-shake");
    setTimeout(() => cartBtn.classList.remove("cart-shake"), 600);
  }
});
