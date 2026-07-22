(function () {
  if (window.__partyItemSearchBound) return;
  window.__partyItemSearchBound = true;

  var MSG_EMPTY = "\uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
  var MSG_LOADING = "\uAC80\uC0C9 \uC911\u2026";
  var MSG_ERROR = "\uAC80\uC0C9\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getButtons(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('button[type="submit"][data-search-option="1"]'),
    );
  }

  function setActiveIndex(container, nextIndex) {
    var buttons = getButtons(container);
    if (!buttons.length) {
      container.setAttribute("data-active-index", "-1");
      return;
    }

    var index = nextIndex;
    if (index < 0) index = buttons.length - 1;
    if (index >= buttons.length) index = 0;

    for (var i = 0; i < buttons.length; i++) {
      var isActive = i === index;
      buttons[i].setAttribute("aria-selected", isActive ? "true" : "false");
      buttons[i].style.backgroundColor = isActive ? "#fafafc" : "";
      buttons[i].style.outline = isActive
        ? "2px solid rgba(41, 151, 255, 0.5)"
        : "";
      buttons[i].style.outlineOffset = isActive ? "-2px" : "";
    }

    container.setAttribute("data-active-index", String(index));
    buttons[index].scrollIntoView({ block: "nearest" });
  }

  function renderResults(container, partyId, slot, items) {
    if (!items.length) {
      container.innerHTML =
        '<p style="padding:12px 16px;font-size:14px;color:#1d1d1f;">' +
        MSG_EMPTY +
        "</p>";
      container.hidden = false;
      container.setAttribute("data-active-index", "-1");
      return;
    }

    var html = '<ul style="list-style:none;margin:0;padding:0;">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var title = item.nameKo || item.nameEn || "#" + item.id;
      var en = item.nameEn ? " \u00b7 " + escapeHtml(item.nameEn) : "";
      var idLabel = "#" + String(item.id).padStart(4, "0");
      var imageHtml = item.image
        ? '<img src="' +
          escapeHtml(item.image) +
          '" alt="' +
          escapeHtml(title) +
          '" width="32" height="32" style="height:32px;width:32px;object-fit:contain;" />'
        : "";
      html +=
        "<li>" +
        '<form action="/api/parties/' +
        partyId +
        "/slots/" +
        slot +
        '/items" method="post" style="margin:0;">' +
        '<input type="hidden" name="itemId" value="' +
        item.id +
        '" />' +
        '<button type="submit" data-search-option="1" aria-selected="false" style="display:flex;width:100%;align-items:center;gap:12px;padding:10px 12px;text-align:left;border:0;background:transparent;cursor:pointer;">' +
        '<span style="display:flex;height:40px;width:40px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:#fafafc;">' +
        imageHtml +
        "</span>" +
        '<span style="min-width:0;flex:1;">' +
        '<span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:600;color:#1d1d1f;">' +
        escapeHtml(title) +
        "</span>" +
        '<span style="display:block;font-size:12px;color:#7a7a7a;">' +
        idLabel +
        en +
        "</span>" +
        "</span>" +
        "</button>" +
        "</form>" +
        "</li>";
    }
    html += "</ul>";
    container.innerHTML = html;
    container.hidden = false;
    setActiveIndex(container, 0);
  }

  document.addEventListener(
    "input",
    function (event) {
      var target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.getAttribute("data-party-item-search") !== "1") return;

      var slot = target.getAttribute("data-slot");
      var partyId = target.getAttribute("data-party-id");
      var container = document.getElementById(
        "party-item-search-results-" + slot,
      );
      if (!slot || !partyId || !container) return;

      window.clearTimeout(window.__partyItemSearchTimer);
      window.__partyItemSearchTimer = window.setTimeout(function () {
        var query = String(target.value || "").trim();
        if (!query) {
          container.innerHTML = "";
          container.hidden = true;
          container.setAttribute("data-active-index", "-1");
          return;
        }

        container.hidden = false;
        container.innerHTML =
          '<p style="padding:12px 16px;font-size:14px;color:#7a7a7a;">' +
          MSG_LOADING +
          "</p>";
        container.setAttribute("data-active-index", "-1");

        fetch("/api/items/search?q=" + encodeURIComponent(query) + "&limit=12")
          .then(function (response) {
            if (!response.ok) {
              throw new Error("request failed: " + response.status);
            }
            return response.json();
          })
          .then(function (data) {
            renderResults(
              container,
              partyId,
              slot,
              Array.isArray(data.items) ? data.items : [],
            );
          })
          .catch(function (error) {
            console.error("API error:", error);
            container.innerHTML =
              '<p style="padding:12px 16px;font-size:14px;color:#dc2626;">' +
              MSG_ERROR +
              "</p>";
            container.hidden = false;
            container.setAttribute("data-active-index", "-1");
          });
      }, 150);
    },
    true,
  );

  document.addEventListener("keydown", function (event) {
    var target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.getAttribute("data-party-item-search") !== "1") return;

    var slot = target.getAttribute("data-slot");
    var container = document.getElementById(
      "party-item-search-results-" + slot,
    );
    if (!container || container.hidden) return;

    var buttons = getButtons(container);
    if (!buttons.length) return;

    var current = Number(container.getAttribute("data-active-index") || "-1");
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(container, current < 0 ? 0 : current + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        container,
        current < 0 ? buttons.length - 1 : current - 1,
      );
      return;
    }
    if (event.key === "Enter") {
      if (current < 0 || current >= buttons.length) return;
      event.preventDefault();
      buttons[current].click();
    }
  });
})();
