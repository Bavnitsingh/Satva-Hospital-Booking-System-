document.addEventListener("DOMContentLoaded", () => {
  // --- Application State ---
  const state = {
    hospitals: { page: 1, limit: 10, total: 0, search: "", loaded: false },
    admins: { page: 1, limit: 10, total: 0, search: "", loaded: false },
  };

  const loadGlobalStats = async () => {
    try {
      // Fetch Hospitals Count (asking for limit=1 makes it lightweight)
      const hospRes = await fetch("/api/v1/hospital/list?page=1&limit=1", {
        cache: "no-store",
      });
      if (hospRes.ok) {
        const hospData = await hospRes.json();
        document.getElementById("stat-hospitals").textContent =
          hospData.data.total;
      }

      // Fetch Admins Count
      const adminRes = await fetch("/api/v1/super-admin/list?page=1&limit=1", {
        cache: "no-store",
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        document.getElementById("stat-admins").textContent =
          adminData.data.total;
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };
  loadGlobalStats();
  // --- Initialize Dashboard Stats ---
  document.getElementById("stat-appointments").textContent = "1,204";
  document.getElementById("stat-doctors").textContent = "342";
  document.getElementById("stat-hospitals").textContent = state.hospitals.total;
  document.getElementById("stat-admins").textContent = state.admins.total;

  // --- Fetch Logic (Real API for Hospitals and Admins) ---
  const fetchData = async (type, page, limit, search) => {
    try {
      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.append("search", search);

      let url = `/api/v1/hospital/list?${queryParams.toString()}`;

      if (type === "admins") {
        url = `/api/v1/super-admin/list?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        cache: "no-store", // Forces the browser to fetch fresh data every time
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);

      const result = await response.json();
      if (result.statusCode >= 400)
        throw new Error(result.message || "Error fetching data");

      return {
        data: result.data.data,
        total: result.data.total,
        page: result.data.page,
        limit: result.data.limit,
      };
    } catch (err) {
      throw err;
    }
  };

  // --- Render Tables ---
  const renderTable = async (type) => {
    const tbody = document.getElementById(`${type}-tbody`);
    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading data...</td></tr>`;

    try {
      const res = await fetchData(
        type,
        state[type].page,
        state[type].limit,
        state[type].search,
      );

      tbody.innerHTML = "";
      res.data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 transition-colors";

        if (type === "hospitals") {
          const statusClass =
            item.status === "Active"
              ? "bg-green-100 text-green-800"
              : item.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";
          tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.location}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${item.status}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a href="/hospital/view-hospital/${item.id}" class="text-blue-600 hover:text-blue-900 transition-colors mr-3"><i class="fa-solid fa-eye"></i> View</a>
                            <a href="/hospital/edit-hospital/${item.id}" class="text-primary hover:text-primary-dark transition-colors mr-3"><i class="fa-solid fa-pen"></i> Edit</a>
                        </td>
                    `;
        } else if (type === "admins") {
          const statusClass =
            item.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";
          tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.role}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${item.status}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a href="/super-admin/view-admin/${item.id}" class="text-blue-600 hover:text-blue-900 transition-colors mr-3"><i class="fa-solid fa-eye"></i> View</a>
                            <a href="/super-admin/edit-admin/${item.id}" class="text-primary hover:text-primary-dark transition-colors mr-3"><i class="fa-solid fa-pen"></i> Edit</a>
                        </td>
                    `;
        }
        tbody.appendChild(tr);
      });

      updatePagination(type, res.total);

      // Update top stats if needed
      //   if (type === "hospitals") {
      //     document.getElementById("stat-hospitals").textContent = res.total;
      //     state.hospitals.total = res.total;
      //   } else if (type === "admins") {
      //     document.getElementById("stat-admins").textContent = res.total;
      //     state.admins.total = res.total;
      //   }

      // Mark as loaded without showing a flash notification
      if (!state[type].loaded) {
        state[type].loaded = true;
      }
    } catch (error) {
      console.error(error);
      // window.showFlash(`Failed to fetch ${type} data. Please try again.`, "error");
      tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-red-500"><i class="fa-solid fa-triangle-exclamation mr-2"></i> Error loading data.</td></tr>`;
    }
  };

  // Global action handler for mock buttons
  window.handleAction = (actionName) => {
    window.showFlash(`${actionName} action executed successfully.`, "success");
  };

  // --- Render Pagination ---
  const updatePagination = (type, total) => {
    const page = state[type].page;
    const limit = state[type].limit;
    const totalPages = Math.ceil(total / limit);

    let prefix = type === "hospitals" ? "hosp" : "adm";
    document.getElementById(`${prefix}-start`).textContent =
      total === 0 ? 0 : (page - 1) * limit + 1;
    document.getElementById(`${prefix}-end`).textContent = Math.min(
      page * limit,
      total,
    );
    document.getElementById(`${prefix}-total`).textContent = total;

    const nav = document.getElementById(`${type}-pagination`);
    nav.innerHTML = "";

    if (totalPages <= 1) return; // No need for pagination if 1 or 0 pages

    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.className = `relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`;
    prevBtn.innerHTML = `<span class="sr-only">Previous</span><i class="fa-solid fa-chevron-left w-4 h-4"></i>`;
    prevBtn.disabled = page === 1;
    prevBtn.onclick = () => {
      if (state[type].page > 1) {
        state[type].page--;
        renderTable(type);
      }
    };
    nav.appendChild(prevBtn);

    // Page Numbers Logic
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        const btn = document.createElement("button");
        if (i === page) {
          btn.className =
            "relative z-10 inline-flex items-center bg-primary px-3 py-1.5 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
        } else {
          btn.className =
            "relative inline-flex items-center px-3 py-1.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0";
        }
        btn.textContent = i;
        btn.onclick = () => {
          if (state[type].page !== i) {
            state[type].page = i;
            renderTable(type);
          }
        };
        nav.appendChild(btn);
      } else if (i === page - 2 || i === page + 2) {
        const span = document.createElement("span");
        span.className =
          "relative inline-flex items-center px-3 py-1.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0";
        span.textContent = "...";
        nav.appendChild(span);
      }
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = `relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`;
    nextBtn.innerHTML = `<span class="sr-only">Next</span><i class="fa-solid fa-chevron-right w-4 h-4"></i>`;
    nextBtn.disabled = page === totalPages;
    nextBtn.onclick = () => {
      if (state[type].page < totalPages) {
        state[type].page++;
        renderTable(type);
      }
    };
    nav.appendChild(nextBtn);
  };

  //! --- Tab Switching Logic ---
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      //* Update active styling
      tabs.forEach((t) => {
        t.classList.remove("border-primary", "text-primary");
        t.classList.add("border-transparent", "text-gray-500");
      });
      tab.classList.remove("border-transparent", "text-gray-500");
      tab.classList.add("border-primary", "text-primary");

      //* Show target content
      contents.forEach((c) => {
        c.classList.add("hidden");
        c.classList.remove("block");
      });
      document.getElementById(`${target}-tab`).classList.remove("hidden");
      document.getElementById(`${target}-tab`).classList.add("block");

      //* Fetch data if not already loaded
      if (!state[target].loaded) {
        renderTable(target);
      }
    });
  });

  //! --- Logout Handler ---
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    window.showFlash("Logging out of Super Admin Portal...", "success");
    
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Logout API failed, clearing local session anyway.", error);
    } finally {
      localStorage.removeItem("accessToken");
      setTimeout(() => {
        window.location.href = "/super-admin/login";
      }, 1500);
    }
  });

  // --- Setup Search Event Listeners ---
  const setupSearch = (type) => {
    const input = document.getElementById(`${type}-search`);
    if (input) {
      let debounceTimeout;
      input.addEventListener("input", (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          state[type].search = e.target.value;
          state[type].page = 1; // Reset to page 1 on new search
          renderTable(type);
        }, 500); // 500ms debounce
      });
    }
  };

  setupSearch("hospitals");
  setupSearch("admins");

  // --- Initialize Default Tab ---
  renderTable("hospitals");
});
