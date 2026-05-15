// ==UserScript==
// @name         derStandard Forum Popularity Sorter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Totally not vibe-coded user script to bring back (ad-free) Plus/Minus sorting on derStandard Forums
// @author       David Suppan
// @match        *://*.derstandard.at/story/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // --- 1. Ad Removal Logic ---
  function sweepAds() {
    document.querySelectorAll("ad-container").forEach((ad) => ad.remove());

    const forum = document.querySelector("dst-forum");
    if (forum && forum.shadowRoot) {
      forum.shadowRoot
        .querySelectorAll("ad-container")
        .forEach((ad) => ad.remove());
    }
  }

  sweepAds();
  // Run this in an 1.5s interval, in case ads get lazy loaded
  setInterval(sweepAds, 1500);

  // --- 2. Forum Sorter Logic ---
  const initInterval = setInterval(() => {
    const forum = document.querySelector("dst-forum");
    if (forum && forum.shadowRoot) {
      const shadow = forum.shadowRoot;
      const main = shadow.querySelector("main.forum--main");

      if (main) {
        clearInterval(initInterval);
        injectSorterUI(shadow, main);
      }
    }
  }, 1000);

  function injectSorterUI(shadow, main) {
    if (shadow.querySelector(".custom-sorter-ui")) return;

    const container = document.createElement("div");
    container.className = "custom-sorter-ui";
    container.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            align-items: center;
        `;

    const btnPlus = document.createElement("button");
    btnPlus.textContent = "↑ Meiste Plus (Laden & Sortieren)";
    btnPlus.className = "form--button";
    btnPlus.style.cssText =
      "cursor: pointer; background-color: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px;";

    const btnMinus = document.createElement("button");
    btnMinus.textContent = "↓ Meiste Minus (Laden & Sortieren)";
    btnMinus.className = "form--button";
    btnMinus.style.cssText =
      "cursor: pointer; background-color: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px;";

    const statusText = document.createElement("span");
    statusText.style.cssText =
      "font-size: 14px; color: #555; font-weight: bold;";

    container.appendChild(btnPlus);
    container.appendChild(btnMinus);
    container.appendChild(statusText);

    main.parentNode.insertBefore(container, main);

    async function loadAndSort(sortType) {
      btnPlus.disabled = true;
      btnMinus.disabled = true;
      btnPlus.style.opacity = "0.5";
      btnMinus.style.opacity = "0.5";

      // Phase A: Fetch main posts, EXCLUDING sub-thread 'load more' buttons
      let moreBtn = shadow.querySelector(
        ".thread--more:not(.form--button-weak)",
      );
      let loadCount = 0;

      while (moreBtn && moreBtn.offsetParent !== null) {
        loadCount++;
        statusText.textContent = `Lade weitere Postings... (Seite ${loadCount})`;
        moreBtn.click();

        await new Promise((resolve) => setTimeout(resolve, 1500));

        moreBtn = shadow.querySelector(".thread--more:not(.form--button-weak)");
        sweepAds();
      }

      statusText.textContent = "Sortiere DOM Elemente...";

      // Phase B: Scrape ratings, pair with sub-threads, and sort
      const rootPosts = Array.from(
        main.querySelectorAll('dst-posting[data-level="0"]'),
      );

      // Map each post to an object holding the post AND its following reply section
      const postGroups = rootPosts.map((post) => {
        let childSection = null;
        const nextEl = post.nextElementSibling;

        // Check if the immediately following element is the replies section
        if (
          nextEl &&
          nextEl.tagName.toLowerCase() === "section" &&
          nextEl.classList.contains("thread")
        ) {
          childSection = nextEl;
        }

        return { post, childSection };
      });

      // Sort the groups based on the main post's rating
      postGroups.sort((a, b) => {
        const ratingLogA = a.post.querySelector("dst-posting--ratinglog");
        const ratingLogB = b.post.querySelector("dst-posting--ratinglog");

        const valA = parseInt(
          ratingLogA
            ? ratingLogA.getAttribute(
                sortType === "plus" ? "positiveratings" : "negativeratings",
              )
            : "0",
          10,
        );
        const valB = parseInt(
          ratingLogB
            ? ratingLogB.getAttribute(
                sortType === "plus" ? "positiveratings" : "negativeratings",
              )
            : "0",
          10,
        );

        return valB - valA;
      });

      // Phase C: Re-attach to the DOM as a pair
      if (postGroups.length > 0) {
        const parent = postGroups[0].post.parentNode;
        postGroups.forEach((group) => {
          parent.appendChild(group.post);
          if (group.childSection) {
            parent.appendChild(group.childSection); // Keep replies physically right behind the root post
          }
        });
      }

      statusText.textContent = `Fertig! ${postGroups.length} Haupt-Postings sortiert.`;
      btnPlus.disabled = false;
      btnMinus.disabled = false;
      btnPlus.style.opacity = "1";
      btnMinus.style.opacity = "1";
    }

    btnPlus.addEventListener("click", () => loadAndSort("plus"));
    btnMinus.addEventListener("click", () => loadAndSort("minus"));
  }
})();
