
/* =========================================
   TỔNG QUAN DƯỢC SĨ - MEDCARE
========================================= */

(() => {
    const waitingCount = document.getElementById("pharmacistWaitingCount");

    // Chỉ chạy trên trang tổng quan dược sĩ.
    if (!waitingCount) return;

    const statisticIds = [
        "pharmacistWaitingCount",
        "pharmacistDispensedCount",
        "pharmacistMedicineCount",
        "pharmacistLowStockCount"
    ];

    statisticIds.forEach((id) => {
        const element = document.getElementById(id);

        if (!element) return;

        const target = Number(element.textContent.trim());

        if (!Number.isFinite(target)) return;

        element.textContent = "0";

        const duration = 650;
        const startTime = performance.now();

        const animateNumber = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            element.textContent = Math.round(
                target * easedProgress
            ).toLocaleString("vi-VN");

            if (progress < 1) {
                requestAnimationFrame(animateNumber);
            }
        };

        requestAnimationFrame(animateNumber);
    });
})();
/* ========================================
   ĐƠN THUỐC CHỜ CẤP
======================================== */
(() => {
    const tableBody = document.getElementById("waitingPrescriptionTableBody");

    if (!tableBody) return;

    const searchInput = document.getElementById("prescriptionSearchInput");
    const statusFilter = document.getElementById("prescriptionStatusFilter");
    const dateFilter = document.getElementById("prescriptionDateFilter");
    const resultCount = document.getElementById("prescriptionResultCount");

    const detailModalElement = document.getElementById("prescriptionDetailModal");
    const confirmModalElement = document.getElementById("confirmPrescriptionModal");

    if (typeof bootstrap === "undefined" || !detailModalElement || !confirmModalElement) {
        return;
    }

    const detailModal = new bootstrap.Modal(detailModalElement);
    const confirmModal = new bootstrap.Modal(confirmModalElement);

    let selectedPrescriptionId = null;
    let pendingPrescriptionId = null;

    const prescriptions = [
        {
            id: "DT26102201",
            patientId: "BN000125",
            patient: "Nguyễn Minh Anh",
            doctor: "BS. Lê Hoàng Nam",
            date: "2026-10-22",
            medicineCount: 3,
            priority: "high",
            status: "waiting",
            medicines: [
                { name: "Paracetamol 500mg", dosage: "Theo chỉ định bác sĩ", quantity: "10 viên" },
                { name: "Vitamin C 500mg", dosage: "Theo chỉ định bác sĩ", quantity: "5 viên" },
                { name: "Loratadine 10mg", dosage: "Theo chỉ định bác sĩ", quantity: "5 viên" }
            ]
        },
        {
            id: "DT26102202",
            patientId: "BN000118",
            patient: "Trần Quốc Bảo",
            doctor: "BS. Nguyễn Thu Hà",
            date: "2026-10-22",
            medicineCount: 4,
            priority: "normal",
            status: "checked",
            medicines: [
                { name: "Amoxicillin 500mg", dosage: "Theo đơn thuốc", quantity: "15 viên" },
                { name: "Paracetamol 500mg", dosage: "Theo đơn thuốc", quantity: "10 viên" },
                { name: "Vitamin C 500mg", dosage: "Theo đơn thuốc", quantity: "5 viên" },
                { name: "Men vi sinh", dosage: "Theo đơn thuốc", quantity: "6 gói" }
            ]
        },
        {
            id: "DT26102101",
            patientId: "BN000106",
            patient: "Lê Ngọc Mai",
            doctor: "BS. Phạm Minh Tuấn",
            date: "2026-10-21",
            medicineCount: 2,
            priority: "high",
            status: "waiting",
            medicines: [
                { name: "Loratadine 10mg", dosage: "Cần đối chiếu chỉ định", quantity: "5 viên" },
                { name: "Vitamin C 500mg", dosage: "Theo đơn thuốc", quantity: "5 viên" }
            ]
        },
        {
            id: "DT26102001",
            patientId: "BN000098",
            patient: "Phạm Gia Huy",
            doctor: "BS. Lê Hoàng Nam",
            date: "2026-10-20",
            medicineCount: 5,
            priority: "normal",
            status: "waiting",
            medicines: [
                { name: "Paracetamol 500mg", dosage: "Theo đơn thuốc", quantity: "10 viên" },
                { name: "Vitamin C 500mg", dosage: "Theo đơn thuốc", quantity: "5 viên" },
                { name: "Oresol", dosage: "Theo đơn thuốc", quantity: "5 gói" },
                { name: "Loratadine 10mg", dosage: "Theo đơn thuốc", quantity: "5 viên" },
                { name: "Men vi sinh", dosage: "Theo đơn thuốc", quantity: "6 gói" }
            ]
        },
        {
            id: "DT26101901",
            patientId: "BN000087",
            patient: "Võ Thanh Trúc",
            doctor: "BS. Nguyễn Thu Hà",
            date: "2026-10-19",
            medicineCount: 3,
            priority: "normal",
            status: "checked",
            medicines: [
                { name: "Paracetamol 500mg", dosage: "Theo đơn thuốc", quantity: "10 viên" },
                { name: "Vitamin C 500mg", dosage: "Theo đơn thuốc", quantity: "5 viên" },
                { name: "Oresol", dosage: "Theo đơn thuốc", quantity: "5 gói" }
            ]
        }
    ];

    const statusLabels = {
        waiting: "Chờ kiểm tra",
        checked: "Đã kiểm tra"
    };

    const today = "2026-10-22";

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(date) {
        const parts = date.split("-");
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function getStatusHTML(status) {
        const label = statusLabels[status] || "Chờ kiểm tra";
        const className = status === "checked"
            ? "prescription-status-checked"
            : "prescription-status-waiting";

        return `<span class="pharmacist-prescription-status ${className}">${label}</span>`;
    }

    function getPriorityHTML(priority) {
        if (priority === "high") {
            return `
                <span class="pharmacist-priority pharmacist-priority-high">
                    <i class="bi bi-exclamation-circle-fill"></i> Ưu tiên
                </span>
            `;
        }

        return `
            <span class="pharmacist-priority pharmacist-priority-normal">
                <i class="bi bi-dash-circle"></i> Bình thường
            </span>
        `;
    }

    function showToast(message, isError = false) {
        const container = document.getElementById("pharmacistToastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "pharmacist-toast" + (isError ? " toast-error" : "");

        const icon = document.createElement("i");
        icon.className = isError
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill";

        const text = document.createElement("span");
        text.textContent = message;

        toast.append(icon, text);
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    }

    function updateStatistics() {
        const waiting = prescriptions.filter(item => item.status === "waiting");
        const priority = waiting.filter(item => item.priority === "high");
        const todayCount = prescriptions.filter(item => item.date === today);
        const checked = prescriptions.filter(item => item.status === "checked");

        document.getElementById("waitingPrescriptionCount").textContent = waiting.length;
        document.getElementById("priorityPrescriptionCount").textContent = priority.length;
        document.getElementById("todayPrescriptionCount").textContent = todayCount.length;

        const checkedElement = document.getElementById("checkedPrescriptionCount");
        if (checkedElement) checkedElement.textContent = checked.length;
    }

    function renderTable() {
        const keyword = (searchInput.value || "").trim().toLocaleLowerCase("vi");
        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;

        const filtered = prescriptions.filter(item => {
            const searchText = `${item.id} ${item.patient} ${item.patientId} ${item.doctor}`
                .toLocaleLowerCase("vi");

            const matchesSearch = !keyword || searchText.includes(keyword);

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "waiting" && item.status === "waiting") ||
                (selectedStatus === "checked" && item.status === "checked") ||
                (selectedStatus === "priority" && item.priority === "high");

            const matchesDate =
                selectedDate === "all" ||
                (selectedDate === "today" && item.date === today);

            return matchesSearch && matchesStatus && matchesDate;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="pharmacist-empty-state">
                        <i class="bi bi-search"></i>
                        Không tìm thấy đơn thuốc phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filtered.map(item => `
                <tr>
                    <td>
                        <span class="pharmacist-prescription-code">
                            ${escapeHTML(item.id)}
                        </span>
                    </td>
                    <td>
                        <div class="pharmacist-patient-info">
                            <div class="pharmacist-patient-avatar">
                                ${escapeHTML(getInitials(item.patient))}
                            </div>
                            <div>
                                <span class="pharmacist-patient-name">
                                    ${escapeHTML(item.patient)}
                                </span>
                                <span class="pharmacist-patient-id">
                                    ${escapeHTML(item.patientId)}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td>${escapeHTML(item.doctor)}</td>
                    <td>${formatDate(item.date)}</td>
                    <td>${item.medicineCount} loại</td>
                    <td>${getPriorityHTML(item.priority)}</td>
                    <td>${getStatusHTML(item.status)}</td>
                    <td>
                        <div class="pharmacist-row-actions">
                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-action="view"
                                data-id="${escapeHTML(item.id)}"
                                title="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-action="check"
                                data-id="${escapeHTML(item.id)}"
                                title="Xác nhận đã kiểm tra"
                                ${item.status === "checked" ? "disabled" : ""}>
                                <i class="bi bi-check-lg"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        resultCount.textContent = `Hiển thị ${filtered.length} / ${prescriptions.length} đơn thuốc`;
        updateStatistics();
    }

    function openDetail(id) {
        const item = prescriptions.find(prescription => prescription.id === id);
        if (!item) return;

        selectedPrescriptionId = id;

        document.getElementById("detailPrescriptionCode").textContent = item.id;
        document.getElementById("detailPrescriptionDate").textContent = formatDate(item.date);
        document.getElementById("detailPrescriptionPatient").textContent = item.patient;
        document.getElementById("detailPrescriptionDoctor").textContent = item.doctor;
        document.getElementById("detailPrescriptionPriority").textContent =
            item.priority === "high" ? "Ưu tiên" : "Bình thường";
        document.getElementById("detailPrescriptionStatus").textContent =
            statusLabels[item.status];

        const medicineBody = document.getElementById("detailPrescriptionMedicineBody");

        medicineBody.innerHTML = item.medicines.map(medicine => `
            <tr>
                <td>${escapeHTML(medicine.name)}</td>
                <td>${escapeHTML(medicine.dosage)}</td>
                <td>${escapeHTML(medicine.quantity)}</td>
            </tr>
        `).join("");

        const checkButton = document.getElementById("checkPrescriptionBtn");
        checkButton.disabled = item.status === "checked";
        checkButton.innerHTML = item.status === "checked"
            ? '<i class="bi bi-check-circle"></i> Đã kiểm tra'
            : '<i class="bi bi-check-lg"></i> Xác nhận đã kiểm tra';

        detailModal.show();
    }

    function openConfirm(id) {
        const item = prescriptions.find(prescription => prescription.id === id);
        if (!item) return;

        if (item.status === "checked") {
            showToast("Đơn thuốc này đã được kiểm tra.", true);
            return;
        }

        pendingPrescriptionId = id;
        document.getElementById("confirmPrescriptionCode").textContent = id;
        confirmModal.show();
    }

    function confirmPrescription() {
        const item = prescriptions.find(
            prescription => prescription.id === pendingPrescriptionId
        );

        if (!item) return;

        item.status = "checked";

        confirmModal.hide();
        detailModal.hide();

        renderTable();
        showToast(`Đã xác nhận kiểm tra đơn thuốc ${item.id}.`);

        pendingPrescriptionId = null;
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button || button.disabled) return;

        const id = button.dataset.id;

        if (button.dataset.action === "view") {
            openDetail(id);
        }

        if (button.dataset.action === "check") {
            openConfirm(id);
        }
    });

    searchInput.addEventListener("input", renderTable);
    statusFilter.addEventListener("change", renderTable);
    dateFilter.addEventListener("change", renderTable);

    document.getElementById("clearPrescriptionFilters").addEventListener("click", () => {
        searchInput.value = "";
        statusFilter.value = "all";
        dateFilter.value = "all";
        renderTable();
        showToast("Đã xóa bộ lọc.");
    });

    document.getElementById("refreshPrescriptionBtn").addEventListener("click", () => {
        renderTable();
        showToast("Danh sách đơn thuốc đã được làm mới.");
    });

    document.getElementById("checkPrescriptionBtn").addEventListener("click", () => {
        if (selectedPrescriptionId) {
            openConfirm(selectedPrescriptionId);
        }
    });

    document.getElementById("confirmPrescriptionSubmit").addEventListener("click", confirmPrescription);

    renderTable();
})();
/* ========================================
   TRANG CẤP PHÁT THUỐC
======================================== */
(() => {
    const tableBody = document.getElementById("dispensingTableBody");

    // Chỉ chạy trên trang cấp phát thuốc
    if (!tableBody) return;

    const searchInput = document.getElementById("dispensingSearchInput");
    const statusFilter = document.getElementById("dispensingStatusFilter");
    const dateFilter = document.getElementById("dispensingDateFilter");
    const resultCount = document.getElementById("dispensingResultCount");

    const detailModalElement = document.getElementById("dispensingDetailModal");
    const confirmModalElement = document.getElementById("dispensingConfirmModal");

    if (typeof bootstrap === "undefined" || !detailModalElement || !confirmModalElement) {
        return;
    }

    const detailModal = new bootstrap.Modal(detailModalElement);
    const confirmModal = new bootstrap.Modal(confirmModalElement);

    const today = "2026-10-22";

    let selectedDispensingId = null;
    let pendingDispensingId = null;

    const dispensingOrders = [
        {
            id: "DT26102201",
            patientId: "BN000125",
            patient: "Nguyễn Minh Anh",
            doctor: "BS. Lê Hoàng Nam",
            date: "2026-10-22",
            status: "pending",
            medicines: [
                {
                    name: "Paracetamol 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "10 viên",
                    checked: false
                },
                {
                    name: "Vitamin C 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 viên",
                    checked: false
                },
                {
                    name: "Loratadine 10mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 viên",
                    checked: false
                }
            ]
        },
        {
            id: "DT26102202",
            patientId: "BN000118",
            patient: "Trần Quốc Bảo",
            doctor: "BS. Nguyễn Thu Hà",
            date: "2026-10-22",
            status: "pending",
            medicines: [
                {
                    name: "Amoxicillin 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "15 viên",
                    checked: false
                },
                {
                    name: "Paracetamol 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "10 viên",
                    checked: false
                }
            ]
        },
        {
            id: "DT26102101",
            patientId: "BN000106",
            patient: "Lê Ngọc Mai",
            doctor: "BS. Phạm Minh Tuấn",
            date: "2026-10-21",
            status: "completed",
            medicines: [
                {
                    name: "Loratadine 10mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 viên",
                    checked: true
                },
                {
                    name: "Vitamin C 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 viên",
                    checked: true
                }
            ]
        },
        {
            id: "DT26102001",
            patientId: "BN000098",
            patient: "Phạm Gia Huy",
            doctor: "BS. Lê Hoàng Nam",
            date: "2026-10-20",
            status: "pending",
            medicines: [
                {
                    name: "Paracetamol 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "10 viên",
                    checked: false
                },
                {
                    name: "Oresol",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 gói",
                    checked: false
                },
                {
                    name: "Vitamin C 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 viên",
                    checked: false
                }
            ]
        },
        {
            id: "DT26101901",
            patientId: "BN000087",
            patient: "Võ Thanh Trúc",
            doctor: "BS. Nguyễn Thu Hà",
            date: "2026-10-19",
            status: "completed",
            medicines: [
                {
                    name: "Paracetamol 500mg",
                    instruction: "Theo đơn thuốc",
                    quantity: "10 viên",
                    checked: true
                },
                {
                    name: "Oresol",
                    instruction: "Theo đơn thuốc",
                    quantity: "5 gói",
                    checked: true
                }
            ]
        }
    ];

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(date) {
        const parts = date.split("-");
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function getStatusHTML(status) {
        if (status === "completed") {
            return `
                <span class="dispensing-status-completed">
                    Đã cấp phát
                </span>
            `;
        }

        return `
            <span class="dispensing-status-pending">
                Chờ cấp phát
            </span>
        `;
    }

    function showToast(message, isError = false) {
        const container = document.getElementById("dispensingToastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "pharmacist-toast" + (isError ? " toast-error" : "");

        const icon = document.createElement("i");
        icon.className = isError
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill";

        const text = document.createElement("span");
        text.textContent = message;

        toast.append(icon, text);
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    }

    function updateStatistics() {
        const pending = dispensingOrders.filter(item => item.status === "pending");
        const completedToday = dispensingOrders.filter(
            item => item.status === "completed" && item.date === today
        );

        const totalElement = document.getElementById("totalDispensingCount");
        const pendingElement = document.getElementById("pendingDispensingCount");
        const completedElement = document.getElementById("completedDispensingCount");
        const patientElement = document.getElementById("patientWaitingCount");

        if (pendingElement) pendingElement.textContent = pending.length;
        if (completedElement) completedElement.textContent = completedToday.length;
        if (totalElement) totalElement.textContent = dispensingOrders.length;
        if (patientElement) patientElement.textContent = pending.length;
    }

    function renderTable() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;

        const filteredOrders = dispensingOrders.filter(item => {
            const searchableText = [
                item.id,
                item.patientId,
                item.patient,
                item.doctor
            ].join(" ").toLocaleLowerCase("vi");

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            const matchesStatus =
                selectedStatus === "all" ||
                item.status === selectedStatus;

            const matchesDate =
                selectedDate === "all" ||
                item.date === today;

            return matchesSearch && matchesStatus && matchesDate;
        });

        if (filteredOrders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="pharmacist-empty-state">
                        <i class="bi bi-search"></i>
                        Không tìm thấy đơn cấp phát phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredOrders.map(item => `
                <tr>
                    <td>
                        <span class="pharmacist-prescription-code">
                            ${escapeHTML(item.id)}
                        </span>
                    </td>

                    <td>
                        <div class="pharmacist-patient-info">
                            <div class="pharmacist-patient-avatar">
                                ${escapeHTML(getInitials(item.patient))}
                            </div>

                            <div>
                                <span class="pharmacist-patient-name">
                                    ${escapeHTML(item.patient)}
                                </span>
                                <span class="pharmacist-patient-id">
                                    ${escapeHTML(item.patientId)}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td>${formatDate(item.date)}</td>

                    <td>${item.medicines.length} loại</td>

                    <td>${escapeHTML("Trần Minh Đức")}</td>

                    <td>${getStatusHTML(item.status)}</td>

                    <td>
                        <div class="pharmacist-row-actions">
                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-dispensing-action="view"
                                data-id="${escapeHTML(item.id)}"
                                title="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-dispensing-action="dispense"
                                data-id="${escapeHTML(item.id)}"
                                title="Cấp phát thuốc"
                                ${item.status === "completed" ? "disabled" : ""}>
                                <i class="bi bi-capsule"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        resultCount.textContent =
            `Hiển thị ${filteredOrders.length} / ${dispensingOrders.length} đơn thuốc`;

        updateStatistics();
    }

    function renderMedicineList(order) {
        const medicineBody = document.getElementById("dispensingMedicineTableBody");

        medicineBody.innerHTML = order.medicines.map((medicine, index) => `
            <tr>
                <td>${escapeHTML(medicine.name)}</td>
                <td>${escapeHTML(medicine.instruction)}</td>
                <td>${escapeHTML(medicine.quantity)}</td>
                <td>
                    <label class="dispensing-check-label ${medicine.checked ? "is-checked" : ""}">
                        <input
                            type="checkbox"
                            class="dispensing-medicine-check"
                            data-medicine-index="${index}"
                            ${medicine.checked ? "checked" : ""}
                            ${order.status === "completed" ? "disabled" : ""}>
                        ${medicine.checked ? "Đã kiểm tra" : "Chưa kiểm tra"}
                    </label>
                </td>
            </tr>
        `).join("");

        const allChecked = order.medicines.every(medicine => medicine.checked);
        const checkedCount = order.medicines.filter(medicine => medicine.checked).length;

        medicineBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td colspan="4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-secondary">Tiến độ kiểm tra thuốc</span>
                        <strong class="small">${checkedCount}/${order.medicines.length}</strong>
                    </div>
                    <div class="dispensing-progress">
                        <div
                            class="dispensing-progress-bar"
                            style="width: ${order.medicines.length ? checkedCount / order.medicines.length * 100 : 0}%">
                        </div>
                    </div>
                    <div class="small mt-2 ${allChecked ? "text-success" : "text-secondary"}">
                        ${allChecked
                            ? "Đã kiểm tra tất cả thuốc trong đơn."
                            : "Vui lòng kiểm tra từng loại thuốc trước khi cấp phát."}
                    </div>
                </td>
            </tr>
        `);

        const confirmButton = document.getElementById("openDispensingConfirmBtn");
        confirmButton.disabled = order.status === "completed";
        confirmButton.innerHTML = order.status === "completed"
            ? '<i class="bi bi-check-circle"></i> Đã cấp phát'
            : '<i class="bi bi-capsule"></i> Xác nhận cấp phát';
    }

    function openDetail(id) {
        const order = dispensingOrders.find(item => item.id === id);
        if (!order) return;

        selectedDispensingId = id;

        document.getElementById("dispensingDetailCode").textContent = order.id;
        document.getElementById("dispensingDetailPatient").textContent = order.patient;
        document.getElementById("dispensingDetailPatientId").textContent = order.patientId;
        document.getElementById("dispensingDetailDoctor").textContent = order.doctor;
        document.getElementById("dispensingDetailDate").textContent = formatDate(order.date);
        document.getElementById("dispensingDetailStatus").textContent =
            order.status === "completed" ? "Đã cấp phát" : "Chờ cấp phát";

        renderMedicineList(order);
        detailModal.show();
    }

    function openConfirm(id) {
        const order = dispensingOrders.find(item => item.id === id);
        if (!order) return;

        if (order.status === "completed") {
            showToast("Đơn thuốc này đã được cấp phát.", true);
            return;
        }

        const allChecked = order.medicines.every(medicine => medicine.checked);

        if (!allChecked) {
            showToast("Vui lòng kiểm tra tất cả thuốc trước khi cấp phát.", true);

            if (selectedDispensingId !== id) {
                openDetail(id);
            }

            return;
        }

        pendingDispensingId = id;
        document.getElementById("dispensingConfirmCode").textContent = id;

        if (detailModalElement.classList.contains("show")) {
            detailModalElement.addEventListener("hidden.bs.modal", function showConfirm() {
                detailModalElement.removeEventListener("hidden.bs.modal", showConfirm);
                confirmModal.show();
            }, { once: true });

            detailModal.hide();
        } else {
            confirmModal.show();
        }
    }

    function confirmDispensing() {
        const order = dispensingOrders.find(
            item => item.id === pendingDispensingId
        );

        if (!order) return;

        if (!order.medicines.every(medicine => medicine.checked)) {
            confirmModal.hide();
            showToast("Chưa hoàn tất kiểm tra các loại thuốc.", true);
            return;
        }

        order.status = "completed";

        confirmModal.hide();
        detailModal.hide();

        renderTable();

        showToast(`Đã hoàn tất cấp phát đơn thuốc ${order.id}.`);

        pendingDispensingId = null;
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-dispensing-action]");

        if (!button || button.disabled) return;

        const id = button.dataset.id;

        if (button.dataset.dispensingAction === "view") {
            openDetail(id);
        }

        if (button.dataset.dispensingAction === "dispense") {
            openDetail(id);
        }
    });

    document.getElementById("dispensingMedicineTableBody").addEventListener("change", event => {
        const checkbox = event.target.closest(".dispensing-medicine-check");
        if (!checkbox || !selectedDispensingId) return;

        const order = dispensingOrders.find(
            item => item.id === selectedDispensingId
        );

        if (!order || order.status === "completed") return;

        const index = Number(checkbox.dataset.medicineIndex);

        if (!Number.isInteger(index) || !order.medicines[index]) return;

        order.medicines[index].checked = checkbox.checked;

        renderMedicineList(order);
    });

    searchInput.addEventListener("input", renderTable);
    statusFilter.addEventListener("change", renderTable);
    dateFilter.addEventListener("change", renderTable);

    document.getElementById("clearDispensingFilters").addEventListener("click", () => {
        searchInput.value = "";
        statusFilter.value = "all";
        dateFilter.value = "all";

        renderTable();
        showToast("Đã xóa bộ lọc.");
    });

    document.getElementById("refreshDispensingBtn").addEventListener("click", () => {
        renderTable();
        showToast("Danh sách cấp phát đã được làm mới.");
    });

    document.getElementById("openDispensingConfirmBtn").addEventListener("click", () => {
        if (selectedDispensingId) {
            openConfirm(selectedDispensingId);
        }
    });

    document.getElementById("confirmDispensingBtn").addEventListener("click", confirmDispensing);

    renderTable();
})();
/* ========================================
   TRANG DANH SÁCH THUỐC
======================================== */
(() => {
    const tableBody = document.getElementById("medicineTableBody");

    // Chỉ thực thi trên trang danh sách thuốc
    if (!tableBody) return;

    if (typeof bootstrap === "undefined") return;

    const form = document.getElementById("medicineForm");
    const formModalElement = document.getElementById("medicineFormModal");
    const detailModalElement = document.getElementById("medicineDetailModal");

    if (!form || !formModalElement || !detailModalElement) return;

    const formModal = new bootstrap.Modal(formModalElement);
    const detailModal = new bootstrap.Modal(detailModalElement);

    const searchInput = document.getElementById("medicineSearchInput");
    const categoryFilter = document.getElementById("medicineCategoryFilter");
    const statusFilter = document.getElementById("medicineStatusFilter");
    const resultCount = document.getElementById("medicineResultCount");

    let selectedMedicineId = null;
    let nextMedicineId = 100;

    const medicines = [
        {
            id: "MED001",
            code: "MED001",
            name: "Paracetamol",
            category: "Giảm đau, hạ sốt",
            ingredient: "Paracetamol",
            strength: "500mg",
            unit: "Viên",
            price: 1500,
            status: "active",
            description: "Thuốc giảm đau, hạ sốt. Sử dụng theo chỉ định và hướng dẫn chuyên môn."
        },
        {
            id: "MED002",
            code: "MED002",
            name: "Amoxicillin",
            category: "Kháng sinh",
            ingredient: "Amoxicillin",
            strength: "500mg",
            unit: "Viên",
            price: 3000,
            status: "active",
            description: "Thuốc kháng sinh. Chỉ sử dụng theo đơn và hướng dẫn của nhân viên y tế."
        },
        {
            id: "MED003",
            code: "MED003",
            name: "Vitamin C",
            category: "Vitamin và khoáng chất",
            ingredient: "Acid ascorbic",
            strength: "500mg",
            unit: "Viên",
            price: 1200,
            status: "active",
            description: "Chế phẩm bổ sung vitamin C. Sử dụng theo hướng dẫn phù hợp."
        },
        {
            id: "MED004",
            code: "MED004",
            name: "Loratadine",
            category: "Chống dị ứng",
            ingredient: "Loratadine",
            strength: "10mg",
            unit: "Viên",
            price: 2000,
            status: "active",
            description: "Thuốc kháng histamin dùng trong một số trường hợp dị ứng theo chỉ định."
        },
        {
            id: "MED005",
            code: "MED005",
            name: "Oresol",
            category: "Tiêu hóa",
            ingredient: "Điện giải và glucose",
            strength: "Theo quy cách sản phẩm",
            unit: "Gói",
            price: 5000,
            status: "active",
            description: "Dung dịch bù nước và điện giải sau khi pha đúng hướng dẫn trên bao bì."
        },
        {
            id: "MED006",
            code: "MED006",
            name: "Omeprazole",
            category: "Tiêu hóa",
            ingredient: "Omeprazole",
            strength: "20mg",
            unit: "Viên",
            price: 2500,
            status: "inactive",
            description: "Mục danh mục đang ngừng sử dụng. Cần kiểm tra trạng thái trước khi đưa vào sử dụng."
        },
        {
            id: "MED007",
            code: "MED007",
            name: "Cetirizine",
            category: "Chống dị ứng",
            ingredient: "Cetirizine",
            strength: "10mg",
            unit: "Viên",
            price: 1800,
            status: "active",
            description: "Thuốc kháng histamin. Sử dụng theo chỉ định và hướng dẫn chuyên môn."
        },
        {
            id: "MED008",
            code: "MED008",
            name: "Ibuprofen",
            category: "Giảm đau, hạ sốt",
            ingredient: "Ibuprofen",
            strength: "200mg",
            unit: "Viên",
            price: 2200,
            status: "inactive",
            description: "Mục danh mục đang ngừng sử dụng. Cần kiểm tra thông tin chuyên môn trước khi sử dụng."
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }).format(value);
    }

    function showToast(message, isError = false) {
        const container = document.getElementById("medicineToastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "pharmacist-toast" + (isError ? " toast-error" : "");

        const icon = document.createElement("i");
        icon.className = isError
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill";

        const text = document.createElement("span");
        text.textContent = message;

        toast.append(icon, text);
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    }

    function getStatusHTML(status) {
        if (status === "active") {
            return '<span class="medicine-status-active">Đang sử dụng</span>';
        }

        return '<span class="medicine-status-inactive">Ngừng sử dụng</span>';
    }

    function updateStatistics() {
        const activeCount = medicines.filter(item => item.status === "active").length;
        const inactiveCount = medicines.filter(item => item.status === "inactive").length;
        const categories = new Set(medicines.map(item => item.category));

        document.getElementById("medicineTotalCount").textContent = medicines.length;
        document.getElementById("medicineActiveCount").textContent = activeCount;
        document.getElementById("medicineInactiveCount").textContent = inactiveCount;
        document.getElementById("medicineCategoryCount").textContent = categories.size;
    }

    function renderTable() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const selectedCategory = categoryFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredMedicines = medicines.filter(item => {
            const searchContent = [
                item.code,
                item.name,
                item.category,
                item.ingredient,
                item.strength
            ].join(" ").toLocaleLowerCase("vi");

            const matchesKeyword = !keyword || searchContent.includes(keyword);
            const matchesCategory =
                selectedCategory === "all" || item.category === selectedCategory;
            const matchesStatus =
                selectedStatus === "all" || item.status === selectedStatus;

            return matchesKeyword && matchesCategory && matchesStatus;
        });

        if (filteredMedicines.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="pharmacist-empty-state">
                        <i class="bi bi-search"></i>
                        Không tìm thấy thuốc phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredMedicines.map(item => `
                <tr>
                    <td>
                        <span class="medicine-code">${escapeHTML(item.code)}</span>
                    </td>

                    <td>
                        <div class="medicine-name-cell">
                            <div class="medicine-name-icon">
                                <i class="bi bi-capsule-pill"></i>
                            </div>
                            <div class="medicine-name-info">
                                <strong>${escapeHTML(item.name)}</strong>
                                <span>${escapeHTML(item.ingredient || "Chưa cập nhật hoạt chất")}</span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="medicine-category-badge">
                            ${escapeHTML(item.category)}
                        </span>
                    </td>

                    <td>${escapeHTML(item.strength)}</td>
                    <td>${escapeHTML(item.unit)}</td>

                    <td>
                        <span class="medicine-price">
                            ${formatCurrency(item.price)}
                        </span>
                    </td>

                    <td>${getStatusHTML(item.status)}</td>

                    <td>
                        <div class="pharmacist-row-actions">
                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-medicine-action="view"
                                data-id="${escapeHTML(item.id)}"
                                title="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button
                                type="button"
                                class="pharmacist-action-btn"
                                data-medicine-action="edit"
                                data-id="${escapeHTML(item.id)}"
                                title="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        resultCount.textContent =
            `Hiển thị ${filteredMedicines.length} / ${medicines.length} loại thuốc`;

        updateStatistics();
    }

    function resetForm() {
        form.reset();
        document.getElementById("medicineEditingId").value = "";
        document.getElementById("medicineCodeInput").readOnly = false;
        document.getElementById("medicineFormTitle").textContent = "Thêm thuốc mới";
        document.getElementById("saveMedicineBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu thông tin';
    }

    function openAddForm() {
        resetForm();
        formModal.show();
    }

    function openEditForm(id) {
        const medicine = medicines.find(item => item.id === id);
        if (!medicine) return;

        resetForm();

        document.getElementById("medicineEditingId").value = medicine.id;
        document.getElementById("medicineCodeInput").value = medicine.code;
        document.getElementById("medicineCodeInput").readOnly = true;
        document.getElementById("medicineNameInput").value = medicine.name;
        document.getElementById("medicineCategoryInput").value = medicine.category;
        document.getElementById("medicineIngredientInput").value = medicine.ingredient;
        document.getElementById("medicineStrengthInput").value = medicine.strength;
        document.getElementById("medicineUnitInput").value = medicine.unit;
        document.getElementById("medicinePriceInput").value = medicine.price;
        document.getElementById("medicineStatusInput").value = medicine.status;
        document.getElementById("medicineDescriptionInput").value = medicine.description;

        document.getElementById("medicineFormTitle").textContent = "Chỉnh sửa thông tin thuốc";
        document.getElementById("saveMedicineBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật thông tin';

        formModal.show();
    }

    function openDetail(id) {
        const medicine = medicines.find(item => item.id === id);
        if (!medicine) return;

        selectedMedicineId = id;

        document.getElementById("medicineDetailName").textContent = medicine.name;
        document.getElementById("medicineDetailCode").textContent = medicine.code;
        document.getElementById("medicineDetailCategory").textContent = medicine.category;
        document.getElementById("medicineDetailIngredient").textContent =
            medicine.ingredient || "Chưa cập nhật";
        document.getElementById("medicineDetailStrength").textContent = medicine.strength;
        document.getElementById("medicineDetailUnit").textContent = medicine.unit;
        document.getElementById("medicineDetailPrice").textContent =
            formatCurrency(medicine.price);
        document.getElementById("medicineDetailStatus").textContent =
            medicine.status === "active" ? "Đang sử dụng" : "Ngừng sử dụng";
        document.getElementById("medicineDetailDescription").textContent =
            medicine.description || "Chưa có ghi chú.";

        detailModal.show();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-medicine-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.medicineAction === "view") {
            openDetail(id);
        } else if (button.dataset.medicineAction === "edit") {
            openEditForm(id);
        }
    });

    document.getElementById("addMedicineBtn").addEventListener("click", openAddForm);

    document.getElementById("editMedicineFromDetailBtn").addEventListener("click", () => {
        if (!selectedMedicineId) return;

        const id = selectedMedicineId;

        detailModalElement.addEventListener("hidden.bs.modal", function openEditAfterDetail() {
            detailModalElement.removeEventListener("hidden.bs.modal", openEditAfterDetail);
            openEditForm(id);
        }, { once: true });

        detailModal.hide();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const editingId = document.getElementById("medicineEditingId").value;
        const code = document.getElementById("medicineCodeInput").value.trim();
        const name = document.getElementById("medicineNameInput").value.trim();
        const category = document.getElementById("medicineCategoryInput").value;
        const ingredient = document.getElementById("medicineIngredientInput").value.trim();
        const strength = document.getElementById("medicineStrengthInput").value.trim();
        const unit = document.getElementById("medicineUnitInput").value;
        const price = Number(document.getElementById("medicinePriceInput").value);
        const status = document.getElementById("medicineStatusInput").value;
        const description = document.getElementById("medicineDescriptionInput").value.trim();

        if (!code || !name || !category || !strength || !unit) {
            showToast("Vui lòng nhập đầy đủ các trường bắt buộc.", true);
            return;
        }

        if (!Number.isFinite(price) || price < 0) {
            showToast("Giá tham khảo không hợp lệ.", true);
            return;
        }

        const duplicateCode = medicines.some(item =>
            item.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi") &&
            item.id !== editingId
        );

        if (duplicateCode) {
            showToast("Mã thuốc đã tồn tại. Vui lòng nhập mã khác.", true);
            document.getElementById("medicineCodeInput").focus();
            return;
        }

        if (editingId) {
            const medicine = medicines.find(item => item.id === editingId);

            if (!medicine) {
                showToast("Không tìm thấy thuốc cần cập nhật.", true);
                return;
            }

            Object.assign(medicine, {
                name,
                category,
                ingredient,
                strength,
                unit,
                price,
                status,
                description
            });

            showToast("Đã cập nhật thông tin thuốc.");
        } else {
            const newMedicine = {
                id: `MED${String(nextMedicineId++).padStart(3, "0")}`,
                code,
                name,
                category,
                ingredient,
                strength,
                unit,
                price,
                status,
                description
            };

            medicines.unshift(newMedicine);
            showToast("Đã thêm thuốc vào danh mục.");
        }

        formModal.hide();
        renderTable();
    });

    searchInput.addEventListener("input", renderTable);
    categoryFilter.addEventListener("change", renderTable);
    statusFilter.addEventListener("change", renderTable);

    document.getElementById("clearMedicineFilters").addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "all";
        statusFilter.value = "all";

        renderTable();
        showToast("Đã xóa bộ lọc.");
    });

    document.getElementById("refreshMedicineBtn")?.addEventListener("click", () => {
        renderTable();
        showToast("Danh sách thuốc đã được làm mới.");
    });

    formModalElement.addEventListener("hidden.bs.modal", resetForm);

    renderTable();
})();
/* ========================================
   TRANG KHO THUỐC
======================================== */
(() => {
    const tableBody = document.getElementById("stockTableBody");

    // Chỉ chạy trên trang kho thuốc
    if (!tableBody) return;

    if (typeof bootstrap === "undefined") return;

    const form = document.getElementById("stockForm");
    const formModalElement = document.getElementById("stockFormModal");
    const detailModalElement = document.getElementById("stockDetailModal");

    if (!form || !formModalElement || !detailModalElement) return;

    const formModal = new bootstrap.Modal(formModalElement);
    const detailModal = new bootstrap.Modal(detailModalElement);

    const searchInput = document.getElementById("stockSearchInput");
    const statusFilter = document.getElementById("stockStatusFilter");
    const locationFilter = document.getElementById("stockLocationFilter");
    const resultCount = document.getElementById("stockResultCount");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    function toDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const currentDate = toDateString(today);

    let selectedStockId = null;
    let nextStockId = 9;

    const stockItems = [
        {
            id: "ST001",
            medicineCode: "MED001",
            medicineName: "Paracetamol",
            batch: "PAR-260801",
            quantity: 180,
            unit: "Viên",
            location: "Kệ A1",
            receivedDate: "2026-08-01",
            expiryDate: "2027-08-01",
            note: "Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp."
        },
        {
            id: "ST002",
            medicineCode: "MED002",
            medicineName: "Amoxicillin",
            batch: "AMX-260615",
            quantity: 12,
            unit: "Viên",
            location: "Kệ A2",
            receivedDate: "2026-06-15",
            expiryDate: "2027-06-15",
            note: "Kiểm tra bao bì trước khi cấp phát."
        },
        {
            id: "ST003",
            medicineCode: "MED003",
            medicineName: "Vitamin C",
            batch: "VTC-260701",
            quantity: 250,
            unit: "Viên",
            location: "Kệ B1",
            receivedDate: "2026-07-01",
            expiryDate: "2026-12-15",
            note: "Theo dõi hạn sử dụng khi xuất kho."
        },
        {
            id: "ST004",
            medicineCode: "MED004",
            medicineName: "Loratadine",
            batch: "LOR-260510",
            quantity: 75,
            unit: "Viên",
            location: "Kệ A1",
            receivedDate: "2026-05-10",
            expiryDate: "2027-05-10",
            note: ""
        },
        {
            id: "ST005",
            medicineCode: "MED005",
            medicineName: "Oresol",
            batch: "ORS-260501",
            quantity: 8,
            unit: "Gói",
            location: "Kệ B2",
            receivedDate: "2026-05-01",
            expiryDate: "2026-11-15",
            note: "Kiểm tra bao bì và tình trạng sản phẩm."
        },
        {
            id: "ST006",
            medicineCode: "MED006",
            medicineName: "Omeprazole",
            batch: "OME-250801",
            quantity: 0,
            unit: "Viên",
            location: "Kệ A2",
            receivedDate: "2025-08-01",
            expiryDate: "2026-09-30",
            note: "Tách riêng lô đã hết hạn để xử lý theo quy trình."
        },
        {
            id: "ST007",
            medicineCode: "MED007",
            medicineName: "Cetirizine",
            batch: "CET-260920",
            quantity: 95,
            unit: "Viên",
            location: "Kệ B1",
            receivedDate: "2026-09-20",
            expiryDate: "2028-03-20",
            note: ""
        },
        {
            id: "ST008",
            medicineCode: "MED008",
            medicineName: "Ibuprofen",
            batch: "IBU-260101",
            quantity: 35,
            unit: "Viên",
            location: "Tủ lạnh",
            receivedDate: "2026-01-01",
            expiryDate: "2026-10-30",
            note: "Kiểm tra điều kiện bảo quản theo hướng dẫn của sản phẩm."
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function daysUntilExpiry(expiryDate) {
        const expiry = new Date(`${expiryDate}T00:00:00`);
        expiry.setHours(0, 0, 0, 0);

        return Math.round((expiry.getTime() - today.getTime()) / 86400000);
    }

    function getStockStatus(item) {
        const remainingDays = daysUntilExpiry(item.expiryDate);

        if (remainingDays < 0) {
            return "expired";
        }

        if (remainingDays <= 90) {
            return "expiring";
        }

        if (item.quantity <= 20) {
            return "low";
        }

        return "normal";
    }

    function getStatusText(status) {
        const statusNames = {
            normal: "Còn hàng",
            low: "Sắp hết hàng",
            expiring: "Sắp hết hạn",
            expired: "Đã hết hạn"
        };

        return statusNames[status] || "Không xác định";
    }

    function getStatusHTML(status) {
        const classes = {
            normal: "stock-status-normal",
            low: "stock-status-low",
            expiring: "stock-status-expiring",
            expired: "stock-status-expired"
        };

        return `
            <span class="${classes[status] || "stock-status-normal"}">
                ${getStatusText(status)}
            </span>
        `;
    }

    function showToast(message, isError = false) {
        const container = document.getElementById("stockToastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "pharmacist-toast" + (isError ? " toast-error" : "");

        const icon = document.createElement("i");
        icon.className = isError
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill";

        const text = document.createElement("span");
        text.textContent = message;

        toast.append(icon, text);
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    }

    function updateStatistics() {
        const productCount = new Set(
            stockItems.map(item => item.medicineCode)
        ).size;

        const lowCount = stockItems.filter(
            item => getStockStatus(item) === "low"
        ).length;

        const expiringCount = stockItems.filter(
            item => getStockStatus(item) === "expiring"
        ).length;

        const expiredCount = stockItems.filter(
            item => getStockStatus(item) === "expired"
        ).length;

        document.getElementById("stockProductCount").textContent = productCount;
        document.getElementById("stockLowCount").textContent = lowCount;
        document.getElementById("stockExpiringCount").textContent = expiringCount;
        document.getElementById("stockExpiredCount").textContent = expiredCount;
    }

    function renderTable() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const selectedStatus = statusFilter.value;
        const selectedLocation = locationFilter.value;

        const filteredItems = stockItems.filter(item => {
            const searchableText = [
                item.medicineCode,
                item.medicineName,
                item.batch,
                item.location
            ].join(" ").toLocaleLowerCase("vi");

            const status = getStockStatus(item);

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            const matchesLocation =
                selectedLocation === "all" || item.location === selectedLocation;

            return matchesSearch && matchesStatus && matchesLocation;
        });

        if (filteredItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="pharmacist-empty-state">
                        <i class="bi bi-search"></i>
                        Không tìm thấy lô thuốc phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredItems.map(item => {
                const status = getStockStatus(item);
                const remainingDays = daysUntilExpiry(item.expiryDate);

                let expiryClass = "";
                let expiryNote = "";

                if (remainingDays < 0) {
                    expiryClass = "is-expired";
                    expiryNote = `Quá hạn ${Math.abs(remainingDays)} ngày`;
                } else if (remainingDays <= 90) {
                    expiryClass = "is-expiring";
                    expiryNote = remainingDays === 0
                        ? "Hết hạn hôm nay"
                        : `Còn ${remainingDays} ngày`;
                } else {
                    expiryNote = "Trong hạn sử dụng";
                }

                const quantityClass = item.quantity <= 20 ? "is-low" : "";

                return `
                    <tr>
                        <td>
                            <span class="stock-code">
                                ${escapeHTML(item.medicineCode)}
                            </span>
                        </td>

                        <td>
                            <div class="stock-medicine-cell">
                                <div class="stock-medicine-icon">
                                    <i class="bi bi-capsule-pill"></i>
                                </div>
                                <div class="stock-medicine-info">
                                    <strong>${escapeHTML(item.medicineName)}</strong>
                                    <span>${escapeHTML(item.unit)}</span>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="pharmacist-prescription-code">
                                ${escapeHTML(item.batch)}
                            </span>
                        </td>

                        <td>
                            <div class="stock-quantity ${quantityClass}">
                                <strong>${Number(item.quantity).toLocaleString("vi-VN")}</strong>
                                <span>${escapeHTML(item.unit)}</span>
                            </div>
                        </td>

                        <td>${escapeHTML(item.location)}</td>

                        <td>
                            <div class="stock-expiry ${expiryClass}">
                                <strong>${formatDate(item.expiryDate)}</strong>
                                <span>${expiryNote}</span>
                            </div>
                        </td>

                        <td>${getStatusHTML(status)}</td>

                        <td>
                            <div class="pharmacist-row-actions">
                                <button
                                    type="button"
                                    class="pharmacist-action-btn"
                                    data-stock-action="view"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="pharmacist-action-btn"
                                    data-stock-action="edit"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Cập nhật lô thuốc">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            `Hiển thị ${filteredItems.length} / ${stockItems.length} lô thuốc`;

        updateStatistics();
    }

    function resetForm() {
        form.reset();

        document.getElementById("stockEditingId").value = "";
        document.getElementById("stockFormTitle").textContent = "Nhập lô thuốc";
        document.getElementById("saveStockBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu thông tin';

        document.getElementById("stockReceivedDate").value = currentDate;
    }

    function openAddForm() {
        resetForm();
        formModal.show();
    }

    function openEditForm(id) {
        const item = stockItems.find(stock => stock.id === id);
        if (!item) return;

        resetForm();

        document.getElementById("stockEditingId").value = item.id;
        document.getElementById("stockMedicineCode").value = item.medicineCode;
        document.getElementById("stockMedicineName").value = item.medicineName;
        document.getElementById("stockBatchNumber").value = item.batch;
        document.getElementById("stockQuantity").value = item.quantity;
        document.getElementById("stockUnit").value = item.unit;
        document.getElementById("stockLocation").value = item.location;
        document.getElementById("stockReceivedDate").value = item.receivedDate;
        document.getElementById("stockExpiryDate").value = item.expiryDate;
        document.getElementById("stockNote").value = item.note || "";

        document.getElementById("stockFormTitle").textContent = "Cập nhật lô thuốc";
        document.getElementById("saveStockBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật thông tin';

        formModal.show();
    }

    function openDetail(id) {
        const item = stockItems.find(stock => stock.id === id);
        if (!item) return;

        selectedStockId = id;

        document.getElementById("stockDetailMedicineName").textContent = item.medicineName;
        document.getElementById("stockDetailMedicineCode").textContent = item.medicineCode;
        document.getElementById("stockDetailBatch").textContent = item.batch;
        document.getElementById("stockDetailQuantity").textContent =
            `${Number(item.quantity).toLocaleString("vi-VN")} ${item.unit}`;
        document.getElementById("stockDetailLocation").textContent = item.location;
        document.getElementById("stockDetailReceivedDate").textContent =
            formatDate(item.receivedDate);
        document.getElementById("stockDetailExpiryDate").textContent =
            formatDate(item.expiryDate);
        document.getElementById("stockDetailStatus").textContent =
            getStatusText(getStockStatus(item));
        document.getElementById("stockDetailNote").textContent =
            item.note || "Chưa có ghi chú.";

        detailModal.show();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-stock-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.stockAction === "view") {
            openDetail(id);
        } else if (button.dataset.stockAction === "edit") {
            openEditForm(id);
        }
    });

    document.getElementById("addStockBtn").addEventListener("click", openAddForm);

    document.getElementById("editStockFromDetailBtn").addEventListener("click", () => {
        if (!selectedStockId) return;

        const id = selectedStockId;

        detailModalElement.addEventListener("hidden.bs.modal", function openEditAfterDetail() {
            detailModalElement.removeEventListener("hidden.bs.modal", openEditAfterDetail);
            openEditForm(id);
        }, { once: true });

        detailModal.hide();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const editingId = document.getElementById("stockEditingId").value;
        const medicineCode = document.getElementById("stockMedicineCode").value.trim();
        const medicineName = document.getElementById("stockMedicineName").value.trim();
        const batch = document.getElementById("stockBatchNumber").value.trim();
        const quantity = Number(document.getElementById("stockQuantity").value);
        const unit = document.getElementById("stockUnit").value;
        const location = document.getElementById("stockLocation").value;
        const receivedDate = document.getElementById("stockReceivedDate").value;
        const expiryDate = document.getElementById("stockExpiryDate").value;
        const note = document.getElementById("stockNote").value.trim();

        if (
            !medicineCode ||
            !medicineName ||
            !batch ||
            !unit ||
            !location ||
            !receivedDate ||
            !expiryDate
        ) {
            showToast("Vui lòng nhập đầy đủ thông tin bắt buộc.", true);
            return;
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            showToast("Số lượng tồn phải là số nguyên không âm.", true);
            return;
        }

        if (expiryDate < receivedDate) {
            showToast("Hạn sử dụng không được trước ngày nhập kho.", true);
            return;
        }

        const duplicateBatch = stockItems.some(item =>
            item.medicineCode.toLocaleLowerCase("vi") === medicineCode.toLocaleLowerCase("vi") &&
            item.batch.toLocaleLowerCase("vi") === batch.toLocaleLowerCase("vi") &&
            item.id !== editingId
        );

        if (duplicateBatch) {
            showToast("Mã thuốc và số lô này đã tồn tại trong kho.", true);
            return;
        }

        const stockData = {
            medicineCode,
            medicineName,
            batch,
            quantity,
            unit,
            location,
            receivedDate,
            expiryDate,
            note
        };

        if (editingId) {
            const item = stockItems.find(stock => stock.id === editingId);

            if (!item) {
                showToast("Không tìm thấy lô thuốc cần cập nhật.", true);
                return;
            }

            Object.assign(item, stockData);
            showToast("Đã cập nhật thông tin lô thuốc.");
        } else {
            stockItems.unshift({
                id: `ST${String(nextStockId++).padStart(3, "0")}`,
                ...stockData
            });

            showToast("Đã thêm lô thuốc vào danh sách kho.");
        }

        formModal.hide();
        renderTable();
    });

    searchInput.addEventListener("input", renderTable);
    statusFilter.addEventListener("change", renderTable);
    locationFilter.addEventListener("change", renderTable);

    document.getElementById("clearStockFilters").addEventListener("click", () => {
        searchInput.value = "";
        statusFilter.value = "all";
        locationFilter.value = "all";

        renderTable();
        showToast("Đã xóa bộ lọc.");
    });

    formModalElement.addEventListener("hidden.bs.modal", resetForm);

    renderTable();
})();

/* ==========================================
   LỊCH UỐNG THUỐC - MEDCARE
   Nối thêm vào cuối js/pharmacist.js
========================================== */
(function () {
    "use strict";

    const tableBody = document.getElementById("scheduleTableBody");

    // Không chạy trên các trang không có lịch uống thuốc.
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);

    const searchInput = $("scheduleSearchInput");
    const dateFilter = $("scheduleDateFilter");
    const statusFilter = $("scheduleStatusFilter");
    const resultCount = $("scheduleResultCount");
    const emptyState = $("scheduleEmptyState");
    const selectedDateLabel = $("scheduleSelectedDateLabel");

    const detailModalElement = $("scheduleDetailModal");
    const completeModalElement = $("completeScheduleModal");

    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);
    const completeModal = bootstrap.Modal.getOrCreateInstance(completeModalElement);

    const pad = (number) => String(number).padStart(2, "0");

    function localDateString(date) {
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join("-");
    }

    function shiftDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return localDateString(date);
    }

    function formatDate(value) {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    const statusInfo = {
        upcoming: {
            label: "Sắp đến giờ",
            className: "schedule-status-upcoming"
        },
        due: {
            label: "Đến giờ dùng thuốc",
            className: "schedule-status-due"
        },
        completed: {
            label: "Đã hoàn thành",
            className: "schedule-status-completed"
        },
        missed: {
            label: "Chưa thực hiện",
            className: "schedule-status-missed"
        }
    };

    const today = shiftDate(0);

    let scheduleItems = [
        {
            id: "LT001",
            patientCode: "BN00128",
            patient: "Nguyễn Minh Anh",
            medicine: "Paracetamol 500mg",
            medicineCode: "TH001",
            dose: "1 viên",
            time: "07:00",
            date: today,
            status: "completed",
            doctor: "BS. Nguyễn Hoàng Nam",
            instruction: "Sử dụng theo đúng hướng dẫn trên đơn thuốc đã kê.",
            note: "Đã xác nhận hoàn thành lịch dùng thuốc buổi sáng."
        },
        {
            id: "LT002",
            patientCode: "BN00135",
            patient: "Trần Quốc Bảo",
            medicine: "Amoxicillin 500mg",
            medicineCode: "TH002",
            dose: "1 viên",
            time: "08:00",
            date: today,
            status: "due",
            doctor: "BS. Trần Minh Khoa",
            instruction: "Tuân thủ liều lượng, khoảng cách giữa các lần dùng và thời gian điều trị theo đơn.",
            note: "Kiểm tra hướng dẫn sử dụng và tiền sử dị ứng trước khi cấp thuốc."
        },
        {
            id: "LT003",
            patientCode: "BN00142",
            patient: "Lê Thu Hà",
            medicine: "Vitamin C 500mg",
            medicineCode: "TH003",
            dose: "1 viên",
            time: "09:00",
            date: today,
            status: "upcoming",
            doctor: "BS. Phạm Ngọc Mai",
            instruction: "Sử dụng đúng liều lượng và thời gian theo hướng dẫn trên đơn thuốc.",
            note: "Theo dõi lịch sử dụng thuốc trong ngày."
        },
        {
            id: "LT004",
            patientCode: "BN00151",
            patient: "Phạm Gia Huy",
            medicine: "Cetirizine 10mg",
            medicineCode: "TH004",
            dose: "1 viên",
            time: "10:00",
            date: today,
            status: "missed",
            doctor: "BS. Nguyễn Hoàng Nam",
            instruction: "Thực hiện theo hướng dẫn sử dụng thuốc được kê.",
            note: "Cần kiểm tra tình trạng thực hiện lịch với nhân viên phụ trách."
        },
        {
            id: "LT005",
            patientCode: "BN00128",
            patient: "Nguyễn Minh Anh",
            medicine: "Vitamin C 500mg",
            medicineCode: "TH003",
            dose: "1 viên",
            time: "12:00",
            date: today,
            status: "upcoming",
            doctor: "BS. Nguyễn Hoàng Nam",
            instruction: "Sử dụng theo đúng đơn thuốc và hướng dẫn của nhân viên y tế.",
            note: "Lịch dùng thuốc buổi trưa."
        },
        {
            id: "LT006",
            patientCode: "BN00167",
            patient: "Võ Thanh Tâm",
            medicine: "Omeprazole 20mg",
            medicineCode: "TH005",
            dose: "1 viên",
            time: "13:00",
            date: today,
            status: "upcoming",
            doctor: "BS. Trần Minh Khoa",
            instruction: "Thời điểm sử dụng cần tuân theo chỉ định cụ thể trên đơn thuốc.",
            note: "Đối chiếu hướng dẫn sử dụng trước khi cấp thuốc."
        },
        {
            id: "LT007",
            patientCode: "BN00135",
            patient: "Trần Quốc Bảo",
            medicine: "Amoxicillin 500mg",
            medicineCode: "TH002",
            dose: "1 viên",
            time: "16:00",
            date: today,
            status: "upcoming",
            doctor: "BS. Trần Minh Khoa",
            instruction: "Dùng theo đúng khoảng cách liều và liệu trình được kê.",
            note: "Lịch dùng thuốc buổi chiều."
        },
        {
            id: "LT008",
            patientCode: "BN00175",
            patient: "Đỗ Ngọc Linh",
            medicine: "Loratadine 10mg",
            medicineCode: "TH006",
            dose: "1 viên",
            time: "20:00",
            date: today,
            status: "upcoming",
            doctor: "BS. Phạm Ngọc Mai",
            instruction: "Thực hiện theo hướng dẫn sử dụng trên đơn thuốc.",
            note: "Lịch dùng thuốc buổi tối."
        },
        {
            id: "LT009",
            patientCode: "BN00142",
            patient: "Lê Thu Hà",
            medicine: "Vitamin C 500mg",
            medicineCode: "TH003",
            dose: "1 viên",
            time: "08:00",
            date: shiftDate(1),
            status: "upcoming",
            doctor: "BS. Phạm Ngọc Mai",
            instruction: "Sử dụng đúng liều lượng và thời gian theo hướng dẫn trên đơn thuốc.",
            note: "Lịch dùng thuốc ngày tiếp theo."
        },
        {
            id: "LT010",
            patientCode: "BN00151",
            patient: "Phạm Gia Huy",
            medicine: "Cetirizine 10mg",
            medicineCode: "TH004",
            dose: "1 viên",
            time: "20:00",
            date: shiftDate(1),
            status: "upcoming",
            doctor: "BS. Nguyễn Hoàng Nam",
            instruction: "Sử dụng theo đúng đơn thuốc đã được kê.",
            note: "Lịch dùng thuốc ngày tiếp theo."
        }
    ];

    let selectedScheduleId = null;

    function getStatusBadge(status) {
        const info = statusInfo[status] || statusInfo.upcoming;

        return `
            <span class="schedule-status ${info.className}">
                ${escapeHTML(info.label)}
            </span>
        `;
    }

    function getFilteredItems() {
        const keyword = (searchInput.value || "").trim().toLocaleLowerCase("vi");
        const selectedDate = dateFilter.value;
        const selectedStatus = statusFilter.value;

        return scheduleItems.filter((item) => {
            const searchableText = [
                item.id,
                item.patient,
                item.patientCode,
                item.medicine,
                item.medicineCode,
                item.doctor
            ].join(" ").toLocaleLowerCase("vi");

            const matchesKeyword = !keyword || searchableText.includes(keyword);
            const matchesDate = !selectedDate || item.date === selectedDate;
            const matchesStatus = !selectedStatus || item.status === selectedStatus;

            return matchesKeyword && matchesDate && matchesStatus;
        }).sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    }

    function renderStats() {
        const todaysItems = scheduleItems.filter((item) => item.date === today);

        $("scheduleTotalCount").textContent = todaysItems.length;
        $("scheduleUpcomingCount").textContent =
            todaysItems.filter((item) => item.status === "upcoming").length;
        $("scheduleCompletedCount").textContent =
            todaysItems.filter((item) => item.status === "completed").length;
        $("scheduleAttentionCount").textContent =
            todaysItems.filter((item) =>
                item.status === "due" || item.status === "missed"
            ).length;
    }

    function renderTable() {
        const items = getFilteredItems();

        tableBody.innerHTML = items.map((item) => {
            const initials = item.patient
                .trim()
                .split(/\s+/)
                .slice(-2)
                .map((word) => word.charAt(0))
                .join("")
                .toLocaleUpperCase("vi");

            const canComplete = item.status !== "completed";

            return `
                <tr>
                    <td>
                        <span class="schedule-code">${escapeHTML(item.id)}</span>
                    </td>
                    <td>
                        <div class="schedule-patient">
                            <div class="schedule-patient-avatar">
                                ${escapeHTML(initials)}
                            </div>
                            <div class="schedule-patient-info">
                                <div class="schedule-patient-name">
                                    ${escapeHTML(item.patient)}
                                </div>
                                <div class="schedule-patient-code">
                                    ${escapeHTML(item.patientCode)}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="schedule-medicine-name">
                            ${escapeHTML(item.medicine)}
                        </div>
                        <div class="schedule-medicine-note">
                            Mã thuốc: ${escapeHTML(item.medicineCode)}
                        </div>
                    </td>
                    <td>
                        <div class="schedule-dose">${escapeHTML(item.dose)}</div>
                    </td>
                    <td>
                        <div class="schedule-time">${escapeHTML(item.time)}</div>
                        <div class="schedule-date-small">${escapeHTML(formatDate(item.date))}</div>
                    </td>
                    <td>${getStatusBadge(item.status)}</td>
                    <td>
                        <div class="schedule-action-group">
                            <button type="button"
                                class="schedule-action-btn"
                                data-schedule-action="detail"
                                data-schedule-id="${escapeHTML(item.id)}"
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết ${escapeHTML(item.id)}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button"
                                class="schedule-action-btn schedule-complete-btn"
                                data-schedule-action="complete"
                                data-schedule-id="${escapeHTML(item.id)}"
                                title="${canComplete ? "Xác nhận hoàn thành" : "Đã hoàn thành"}"
                                aria-label="Xác nhận hoàn thành ${escapeHTML(item.id)}"
                                ${canComplete ? "" : "disabled"}>
                                <i class="bi bi-check2-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        resultCount.textContent = items.length;

        emptyState.classList.toggle("d-none", items.length !== 0);
        tableBody.closest(".table-responsive").classList.toggle("d-none", items.length === 0);

        selectedDateLabel.textContent = dateFilter.value
            ? `Ngày ${formatDate(dateFilter.value)}`
            : "Tất cả ngày";

        renderStats();
    }

    function findSchedule(id) {
        return scheduleItems.find((item) => item.id === id);
    }

    function showToast(message, type = "success") {
        const container = $("scheduleToastContainer");
        const toast = document.createElement("div");

        toast.className = "pharmacist-toast";
        toast.setAttribute("role", "status");

        const icon = type === "error" ? "bi-exclamation-circle" : "bi-check-circle";
        const iconColor = type === "error" ? "#c44743" : "#218653";

        toast.innerHTML = `
            <i class="bi ${icon}" style="color:${iconColor};font-size:20px"></i>
            <span>${escapeHTML(message)}</span>
            <button type="button" aria-label="Đóng thông báo">
                <i class="bi bi-x"></i>
            </button>
        `;

        toast.querySelector("button").addEventListener("click", () => toast.remove());
        container.appendChild(toast);

        window.setTimeout(() => {
            if (toast.isConnected) toast.remove();
        }, 3500);
    }

    function showDetails(id) {
        const item = findSchedule(id);
        if (!item) return;

        selectedScheduleId = id;

        $("scheduleDetailMedicineName").textContent = item.medicine;
        $("scheduleDetailCode").textContent = `${item.id} · ${item.medicineCode}`;
        $("scheduleDetailPatient").textContent = item.patient;
        $("scheduleDetailPatientCode").textContent = item.patientCode;
        $("scheduleDetailDose").textContent = item.dose;
        $("scheduleDetailTime").textContent = item.time;
        $("scheduleDetailDate").textContent = formatDate(item.date);
        $("scheduleDetailDoctor").textContent = item.doctor;
        $("scheduleDetailInstruction").textContent = item.instruction;
        $("scheduleDetailNote").textContent = item.note || "Không có ghi chú.";

        $("scheduleDetailStatus").innerHTML = getStatusBadge(item.status);

        const completeButton = $("completeScheduleFromDetailBtn");
        completeButton.disabled = item.status === "completed";
        completeButton.innerHTML = item.status === "completed"
            ? '<i class="bi bi-check-circle me-2"></i>Đã hoàn thành'
            : '<i class="bi bi-check2-circle me-2"></i>Xác nhận hoàn thành';

        detailModal.show();
    }

    function requestComplete(id) {
        const item = findSchedule(id);
        if (!item) return;

        if (item.status === "completed") {
            showToast("Lịch dùng thuốc này đã được hoàn thành.", "error");
            return;
        }

        selectedScheduleId = id;
        $("completeScheduleMedicine").textContent = item.medicine;
        $("completeSchedulePatient").textContent =
            `${item.patient} · ${item.id} · ${formatDate(item.date)} lúc ${item.time}`;

        completeModal.show();
    }

    function completeSchedule() {
        const item = findSchedule(selectedScheduleId);
        if (!item) {
            completeModal.hide();
            return;
        }

        if (item.status === "completed") {
            completeModal.hide();
            return;
        }

        item.status = "completed";
        item.note = "Đã xác nhận hoàn thành lịch dùng thuốc.";

        completeModal.hide();
        detailModal.hide();

        renderTable();
        showToast(`Đã cập nhật trạng thái lịch ${item.id}.`);
    }

    searchInput.addEventListener("input", renderTable);
    dateFilter.addEventListener("change", renderTable);
    statusFilter.addEventListener("change", renderTable);

    $("clearScheduleFilters").addEventListener("click", () => {
        searchInput.value = "";
        dateFilter.value = today;
        statusFilter.value = "";
        renderTable();
    });

    $("refreshMedicationScheduleBtn").addEventListener("click", () => {
        renderTable();
        showToast("Danh sách lịch dùng thuốc đã được làm mới.");
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-schedule-action]");
        if (!button || button.disabled) return;

        const id = button.dataset.scheduleId;

        if (button.dataset.scheduleAction === "detail") {
            showDetails(id);
        } else if (button.dataset.scheduleAction === "complete") {
            requestComplete(id);
        }
    });

    $("completeScheduleFromDetailBtn").addEventListener("click", () => {
        const item = findSchedule(selectedScheduleId);
        if (!item || item.status === "completed") return;

        detailModal.hide();
        requestComplete(selectedScheduleId);
    });

    $("confirmCompleteScheduleBtn").addEventListener("click", completeSchedule);

    dateFilter.value = today;
    renderTable();
})();

/* ==========================================
   BÁO CÁO TÁC DỤNG PHỤ - MEDCARE
   Nối thêm vào cuối js/pharmacist.js
========================================== */
(function () {
    "use strict";

    const tableBody = document.getElementById("adverseTableBody");

    // Chỉ chạy trên trang báo cáo tác dụng phụ.
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);

    const formElement = $("adverseReportForm");
    const formModalElement = $("adverseFormModal");
    const detailModalElement = $("adverseDetailModal");

    const formModal = bootstrap.Modal.getOrCreateInstance(formModalElement);
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const searchInput = $("adverseSearchInput");
    const severityFilter = $("adverseSeverityFilter");
    const statusFilter = $("adverseStatusFilter");
    const emptyState = $("adverseEmptyState");
    const resultCount = $("adverseResultCount");

    const pad = (number) => String(number).padStart(2, "0");

    function localDateString(date) {
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join("-");
    }

    function shiftDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return localDateString(date);
    }

    function formatDate(value) {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    const severityInfo = {
        mild: {
            label: "Nhẹ",
            className: "adverse-severity-mild"
        },
        moderate: {
            label: "Trung bình",
            className: "adverse-severity-moderate"
        },
        severe: {
            label: "Nghiêm trọng",
            className: "adverse-severity-severe"
        }
    };

    const statusInfo = {
        pending: {
            label: "Chờ xử lý",
            className: "adverse-status-pending"
        },
        processing: {
            label: "Đang xử lý",
            className: "adverse-status-processing"
        },
        resolved: {
            label: "Đã xử lý",
            className: "adverse-status-resolved"
        }
    };

    // Dữ liệu minh họa phục vụ kiểm tra giao diện.
    // Các báo cáo thực tế cần được lấy từ backend/MySQL.
    let adverseReports = [
        {
            id: "ADR001",
            patient: "Nguyễn Minh Anh",
            patientCode: "BN00128",
            medicine: "Amoxicillin 500mg",
            symptom: "Phát ban trên da",
            severity: "moderate",
            date: shiftDate(-2),
            status: "pending",
            reporter: "Trần Minh Đức",
            description: "Bệnh nhân được ghi nhận có biểu hiện phát ban trên da sau khi sử dụng thuốc. Thời điểm xuất hiện và diễn biến cần được nhân viên y tế phụ trách xác minh.",
            handling: "Đã ghi nhận thông tin ban đầu. Chuyển nhân viên y tế phụ trách đánh giá và hướng dẫn xử trí."
        },
        {
            id: "ADR002",
            patient: "Trần Quốc Bảo",
            patientCode: "BN00135",
            medicine: "Paracetamol 500mg",
            symptom: "Buồn nôn",
            severity: "mild",
            date: shiftDate(-1),
            status: "processing",
            reporter: "Trần Minh Đức",
            description: "Bệnh nhân báo cáo cảm giác buồn nôn sau khi dùng thuốc. Cần thu thập thêm thông tin về liều sử dụng, thời điểm xuất hiện và các thuốc dùng đồng thời.",
            handling: "Đang chờ đánh giá của nhân viên y tế. Tiếp tục theo dõi diễn biến được báo cáo."
        },
        {
            id: "ADR003",
            patient: "Lê Thu Hà",
            patientCode: "BN00142",
            medicine: "Cetirizine 10mg",
            symptom: "Buồn ngủ",
            severity: "mild",
            date: shiftDate(-4),
            status: "resolved",
            reporter: "Trần Minh Đức",
            description: "Bệnh nhân phản ánh tình trạng buồn ngủ trong thời gian sử dụng thuốc. Thông tin đã được chuyển để xem xét theo hướng dẫn chuyên môn.",
            handling: "Đã ghi nhận kết quả theo dõi và cập nhật trạng thái báo cáo sau khi nhân viên phụ trách hoàn tất đánh giá."
        },
        {
            id: "ADR004",
            patient: "Phạm Gia Huy",
            patientCode: "BN00151",
            medicine: "Ibuprofen 400mg",
            symptom: "Đau vùng thượng vị",
            severity: "moderate",
            date: shiftDate(-3),
            status: "processing",
            reporter: "Trần Minh Đức",
            description: "Bệnh nhân báo cáo đau vùng thượng vị sau khi sử dụng thuốc. Cần đánh giá thời điểm xuất hiện, mức độ và các yếu tố liên quan.",
            handling: "Đã chuyển thông tin cho nhân viên y tế phụ trách. Chưa tự kết luận nguyên nhân."
        },
        {
            id: "ADR005",
            patient: "Võ Thanh Tâm",
            patientCode: "BN00167",
            medicine: "Loratadine 10mg",
            symptom: "Chóng mặt",
            severity: "mild",
            date: shiftDate(0),
            status: "pending",
            reporter: "Trần Minh Đức",
            description: "Bệnh nhân thông báo có biểu hiện chóng mặt. Cần xác minh thông tin sử dụng thuốc và đánh giá tình trạng hiện tại.",
            handling: "Chờ nhân viên y tế phụ trách tiếp nhận và đánh giá."
        },
        {
            id: "ADR006",
            patient: "Đỗ Ngọc Linh",
            patientCode: "BN00175",
            medicine: "Thuốc chưa xác định",
            symptom: "Biểu hiện bất thường cần đánh giá",
            severity: "severe",
            date: shiftDate(0),
            status: "processing",
            reporter: "Trần Minh Đức",
            description: "Thông tin phản ứng bất lợi được ghi nhận cần đánh giá khẩn theo quy trình chuyên môn. Danh tính thuốc và diễn biến cần được xác minh.",
            handling: "Ưu tiên chuyển nhân viên y tế có thẩm quyền đánh giá ngay. Nếu có dấu hiệu nguy hiểm, cần được xử trí y tế khẩn cấp."
        }
    ];

    let selectedReportId = null;
    let editingReportId = null;

    function getSeverityBadge(severity) {
        const info = severityInfo[severity] || severityInfo.mild;

        return `
            <span class="adverse-severity ${info.className}">
                ${escapeHTML(info.label)}
            </span>
        `;
    }

    function getStatusBadge(status) {
        const info = statusInfo[status] || statusInfo.pending;

        return `
            <span class="adverse-status ${info.className}">
                ${escapeHTML(info.label)}
            </span>
        `;
    }

    function getFilteredReports() {
        const keyword = (searchInput.value || "")
            .trim()
            .toLocaleLowerCase("vi");

        const severity = severityFilter.value;
        const status = statusFilter.value;

        return adverseReports
            .filter((report) => {
                const searchableText = [
                    report.id,
                    report.patient,
                    report.patientCode,
                    report.medicine,
                    report.symptom,
                    report.reporter
                ].join(" ").toLocaleLowerCase("vi");

                return (!keyword || searchableText.includes(keyword))
                    && (!severity || report.severity === severity)
                    && (!status || report.status === status);
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function renderStats() {
        $("adverseTotalCount").textContent = adverseReports.length;

        $("adversePendingCount").textContent =
            adverseReports.filter((report) => report.status === "pending").length;

        $("adverseProcessingCount").textContent =
            adverseReports.filter((report) => report.status === "processing").length;

        $("adverseResolvedCount").textContent =
            adverseReports.filter((report) => report.status === "resolved").length;
    }

    function renderTable() {
        const reports = getFilteredReports();

        tableBody.innerHTML = reports.map((report) => {
            const initials = report.patient
                .trim()
                .split(/\s+/)
                .slice(-2)
                .map((word) => word.charAt(0))
                .join("")
                .toLocaleUpperCase("vi");

            return `
                <tr>
                    <td>
                        <span class="adverse-report-code">
                            ${escapeHTML(report.id)}
                        </span>
                    </td>
                    <td>
                        <div class="adverse-patient-cell">
                            <div class="adverse-patient-avatar">
                                ${escapeHTML(initials)}
                            </div>
                            <div>
                                <div class="adverse-patient-name">
                                    ${escapeHTML(report.patient)}
                                </div>
                                <div class="adverse-patient-code">
                                    ${escapeHTML(report.patientCode || "Chưa cập nhật mã")}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="adverse-medicine-name">
                            ${escapeHTML(report.medicine)}
                        </div>
                    </td>
                    <td>
                        <div class="adverse-symptom-text">
                            ${escapeHTML(report.symptom)}
                        </div>
                    </td>
                    <td>${getSeverityBadge(report.severity)}</td>
                    <td>
                        <span class="adverse-date">
                            ${escapeHTML(formatDate(report.date))}
                        </span>
                    </td>
                    <td>${getStatusBadge(report.status)}</td>
                    <td>
                        <div class="adverse-action-group">
                            <button type="button"
                                class="adverse-action-btn"
                                data-adverse-action="detail"
                                data-adverse-id="${escapeHTML(report.id)}"
                                title="Xem chi tiết"
                                aria-label="Xem báo cáo ${escapeHTML(report.id)}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button"
                                class="adverse-action-btn"
                                data-adverse-action="edit"
                                data-adverse-id="${escapeHTML(report.id)}"
                                title="Cập nhật báo cáo"
                                aria-label="Cập nhật báo cáo ${escapeHTML(report.id)}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        resultCount.textContent = reports.length;

        emptyState.classList.toggle("d-none", reports.length > 0);
        tableBody.closest(".table-responsive")
            .classList.toggle("d-none", reports.length === 0);

        renderStats();
    }

    function findReport(id) {
        return adverseReports.find((report) => report.id === id);
    }

    function showToast(message, type = "success") {
        const container = $("adverseToastContainer");
        const toast = document.createElement("div");

        toast.className = "pharmacist-toast";
        toast.setAttribute("role", "status");

        const icon = type === "error"
            ? "bi-exclamation-circle"
            : "bi-check-circle";

        const iconColor = type === "error" ? "#c44743" : "#218653";

        const iconElement = document.createElement("i");
        iconElement.className = `bi ${icon}`;
        iconElement.style.color = iconColor;
        iconElement.style.fontSize = "20px";

        const messageElement = document.createElement("span");
        messageElement.textContent = message;

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Đóng thông báo");
        closeButton.innerHTML = '<i class="bi bi-x"></i>';
        closeButton.addEventListener("click", () => toast.remove());

        toast.append(iconElement, messageElement, closeButton);
        container.appendChild(toast);

        window.setTimeout(() => {
            if (toast.isConnected) toast.remove();
        }, 3500);
    }

    function showDetails(id) {
        const report = findReport(id);
        if (!report) return;

        selectedReportId = id;

        $("adverseDetailPatient").textContent = report.patient;
        $("adverseDetailCode").textContent = report.id;
        $("adverseDetailPatientCode").textContent = report.patientCode || "Chưa cập nhật";
        $("adverseDetailMedicine").textContent = report.medicine;
        $("adverseDetailSymptom").textContent = report.symptom;
        $("adverseDetailDate").textContent = formatDate(report.date);
        $("adverseDetailSeverity").innerHTML = getSeverityBadge(report.severity);
        $("adverseDetailReporter").textContent = report.reporter || "Chưa cập nhật";
        $("adverseDetailDescription").textContent = report.description || "Chưa có mô tả.";
        $("adverseDetailHandling").textContent = report.handling || "Chưa cập nhật hướng xử lý.";
        $("adverseDetailStatus").innerHTML = getStatusBadge(report.status);

        detailModal.show();
    }

    function resetForm() {
        formElement.reset();

        $("adverseEditingId").value = "";
        $("adverseReportDate").value = shiftDate(0);
        $("adverseStatus").value = "pending";

        editingReportId = null;
        $("adverseFormTitle").textContent = "Tạo báo cáo tác dụng phụ";
        $("saveAdverseReportBtn").innerHTML =
            '<i class="bi bi-check2-circle me-2"></i>Lưu báo cáo';
    }

    function openCreateForm() {
        resetForm();
        formModal.show();
    }

    function openEditForm(id) {
        const report = findReport(id);
        if (!report) return;

        editingReportId = id;

        $("adverseEditingId").value = report.id;
        $("adversePatientName").value = report.patient;
        $("adversePatientCode").value = report.patientCode || "";
        $("adverseMedicineName").value = report.medicine;
        $("adverseReportDate").value = report.date;
        $("adverseSymptom").value = report.symptom;
        $("adverseSeverity").value = report.severity;
        $("adverseDescription").value = report.description;
        $("adverseStatus").value = report.status;
        $("adverseHandling").value = report.handling || "";

        $("adverseFormTitle").textContent = "Cập nhật báo cáo";
        $("saveAdverseReportBtn").innerHTML =
            '<i class="bi bi-check2-circle me-2"></i>Lưu thay đổi';

        formModal.show();
    }

    function generateReportId() {
        let number = 1;

        while (findReport(`ADR${String(number).padStart(3, "0")}`)) {
            number++;
        }

        return `ADR${String(number).padStart(3, "0")}`;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!formElement.reportValidity()) return;

        const patient = $("adversePatientName").value.trim();
        const patientCode = $("adversePatientCode").value.trim();
        const medicine = $("adverseMedicineName").value.trim();
        const date = $("adverseReportDate").value;
        const symptom = $("adverseSymptom").value.trim();
        const severity = $("adverseSeverity").value;
        const description = $("adverseDescription").value.trim();
        const status = $("adverseStatus").value;
        const handling = $("adverseHandling").value.trim();

        if (!patient || !medicine || !date || !symptom || !description) {
            showToast("Vui lòng nhập đầy đủ các thông tin bắt buộc.", "error");
            return;
        }

        const reportData = {
            patient,
            patientCode,
            medicine,
            date,
            symptom,
            severity,
            description,
            status,
            handling,
            reporter: "Trần Minh Đức"
        };

        if (editingReportId) {
            const existingReport = findReport(editingReportId);

            if (!existingReport) {
                showToast("Không tìm thấy báo cáo cần cập nhật.", "error");
                return;
            }

            Object.assign(existingReport, reportData);
            showToast(`Đã cập nhật báo cáo ${existingReport.id}.`);
        } else {
            const newReport = {
                id: generateReportId(),
                ...reportData
            };

            adverseReports.unshift(newReport);
            showToast(`Đã tạo báo cáo ${newReport.id}.`);
        }

        formModal.hide();
        renderTable();
    }

    searchInput.addEventListener("input", renderTable);
    severityFilter.addEventListener("change", renderTable);
    statusFilter.addEventListener("change", renderTable);

    $("addAdverseReportBtn").addEventListener("click", openCreateForm);

    $("refreshAdverseReportsBtn").addEventListener("click", () => {
        renderTable();
        showToast("Danh sách báo cáo đã được làm mới.");
    });

    $("clearAdverseFilters").addEventListener("click", () => {
        searchInput.value = "";
        severityFilter.value = "";
        statusFilter.value = "";
        renderTable();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-adverse-action]");
        if (!button) return;

        const id = button.dataset.adverseId;

        if (button.dataset.adverseAction === "detail") {
            showDetails(id);
        } else if (button.dataset.adverseAction === "edit") {
            openEditForm(id);
        }
    });

    $("editAdverseFromDetailBtn").addEventListener("click", () => {
        if (!selectedReportId) return;

        const id = selectedReportId;
        detailModal.hide();
        openEditForm(id);
    });

    formElement.addEventListener("submit", handleSubmit);

    formModalElement.addEventListener("hidden.bs.modal", () => {
        resetForm();
    });

    renderTable();
})();
