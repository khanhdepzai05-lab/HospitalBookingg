/* =====================================================
   MEDCARE - JAVASCRIPT KHU VỰC BÁC SĨ
   ===================================================== */

(() => {
    "use strict";

    function initDoctorDashboard() {
        const page = document.querySelector(".content");

        // Chỉ khởi tạo chức năng tổng quan trên trang tổng quan.
        if (!page || !document.querySelector(".stat-card")) {
            return;
        }

        // Đánh dấu trang hiện tại trong menu.
        const currentPage = window.location.pathname.split("/").pop();

        document.querySelectorAll(".sidebar .side-link").forEach(link => {
            const href = link.getAttribute("href");

            if (href && href === currentPage) {
                link.classList.add("active");
            }
        });

        // Cập nhật ngày hiện tại nếu trang có phần tử hiển thị ngày.
        const today = new Date();

        const formattedDate = today.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        document.querySelectorAll("[data-current-date]").forEach(element => {
            element.textContent = formattedDate;
        });

        // Hiển thị thông báo bằng Bootstrap Toast nếu trang có toast.
        function showDoctorToast(message) {
            const toastElement = document.getElementById("doctorToast");
            const messageElement = document.getElementById("doctorToastMessage");

            if (toastElement && messageElement && window.bootstrap) {
                messageElement.textContent = message;

                const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
                toast.show();
            }
        }

        // Ngăn các liên kết rỗng vô tình cuộn lên đầu trang.
        document.querySelectorAll('a[href="#"]').forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();
            });
        });

        // Hỗ trợ tìm kiếm nhanh lịch hẹn nếu bổ sung ô tìm kiếm sau này.
        const searchInput = document.getElementById("dashboardAppointmentSearch");
        const appointmentRows = document.querySelectorAll(
            "[data-appointment-row]"
        );

        if (searchInput && appointmentRows.length) {
            searchInput.addEventListener("input", () => {
                const keyword = searchInput.value
                    .trim()
                    .toLocaleLowerCase("vi-VN");

                appointmentRows.forEach(row => {
                    const content = row.textContent.toLocaleLowerCase("vi-VN");
                    row.hidden = !content.includes(keyword);
                });
            });
        }

        // Hiệu ứng hiển thị khi trang được tải.
        document.querySelectorAll(".stat-card, .panel").forEach(element => {
            element.classList.add("doctor-dashboard-ready");
        });

        // Chỉ gắn sự kiện khi phần tử thông báo tồn tại.
        document.querySelectorAll("[data-doctor-notice]").forEach(button => {
            button.addEventListener("click", () => {
                showDoctorToast(button.dataset.doctorNotice);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initDoctorDashboard);
    } else {
        initDoctorDashboard();
    }
})();
/* =========================================
   MEDCARE - DOCTOR APPOINTMENTS
   Chức năng trang lịch hẹn bác sĩ
========================================= */
(function () {
    "use strict";

    const tableBody = document.getElementById("appointmentTableBody");

    // Không chạy trên những trang bác sĩ khác.
    if (!tableBody) return;

    const searchInput = document.getElementById("appointmentSearch");
    const dateFilter = document.getElementById("appointmentDateFilter");
    const statusFilter = document.getElementById("appointmentStatusFilter");
    const resetButton = document.getElementById("resetAppointmentFilters");
    const refreshButton = document.getElementById("refreshAppointments");

    const resultCount = document.getElementById("appointmentResultCount");
    const totalElement = document.getElementById("appointmentTotal");
    const pendingElement = document.getElementById("appointmentPending");
    const confirmedElement = document.getElementById("appointmentConfirmed");
    const completedElement = document.getElementById("appointmentCompleted");

    const modalElement = document.getElementById("appointmentModal");
    const detailContent = document.getElementById("appointmentDetailContent");
    const confirmModalButton = document.getElementById("confirmAppointmentFromModal");

    const toastElement = document.getElementById("appointmentToast");
    const toastMessage = document.getElementById("appointmentToastMessage");

    if (
        !searchInput ||
        !dateFilter ||
        !statusFilter ||
        !resetButton ||
        !refreshButton ||
        !resultCount
    ) {
        console.error("MedCare: Thiếu phần tử cần thiết của trang lịch hẹn.");
        return;
    }

    /*
     * Dữ liệu mẫu phục vụ kiểm tra giao diện.
     * Khi kết nối backend, thay nguồn dữ liệu này bằng API/database.
     */
    const appointments = [
        {
            id: "LH001",
            patientCode: "BN00125",
            name: "Nguyễn Hoàng Nam",
            phone: "0901234567",
            specialty: "Nội tổng quát",
            date: "2026-10-21",
            time: "08:00",
            reason: "Khám sức khỏe định kỳ",
            status: "Đã hoàn thành"
        },
        {
            id: "LH002",
            patientCode: "BN00126",
            name: "Trần Thị Thu Hà",
            phone: "0912345678",
            specialty: "Nội tổng quát",
            date: "2026-10-21",
            time: "08:30",
            reason: "Đau đầu, chóng mặt",
            status: "Đã xác nhận"
        },
        {
            id: "LH003",
            patientCode: "BN00127",
            name: "Lê Minh Tuấn",
            phone: "0923456789",
            specialty: "Tim mạch",
            date: "2026-10-21",
            time: "09:00",
            reason: "Tái khám",
            status: "Chờ xác nhận"
        },
        {
            id: "LH004",
            patientCode: "BN00128",
            name: "Phạm Ngọc Mai",
            phone: "0934567890",
            specialty: "Nội tổng quát",
            date: "2026-10-21",
            time: "09:30",
            reason: "Kiểm tra sức khỏe",
            status: "Chờ xác nhận"
        },
        {
            id: "LH005",
            patientCode: "BN00129",
            name: "Đỗ Quốc Bảo",
            phone: "0945678901",
            specialty: "Da liễu",
            date: "2026-10-21",
            time: "10:00",
            reason: "Tư vấn điều trị",
            status: "Đã xác nhận"
        },
        {
            id: "LH006",
            patientCode: "BN00130",
            name: "Võ Thảo Vy",
            phone: "0956789012",
            specialty: "Da liễu",
            date: "2026-10-22",
            time: "08:00",
            reason: "Tái khám da liễu",
            status: "Chờ xác nhận"
        },
        {
            id: "LH007",
            patientCode: "BN00131",
            name: "Bùi Đức Anh",
            phone: "0967890123",
            specialty: "Tim mạch",
            date: "2026-10-22",
            time: "08:30",
            reason: "Tư vấn sức khỏe tim mạch",
            status: "Đã hoàn thành"
        },
        {
            id: "LH008",
            patientCode: "BN00132",
            name: "Ngô Khánh Linh",
            phone: "0978901234",
            specialty: "Nội tổng quát",
            date: "2026-10-23",
            time: "09:00",
            reason: "Khám tổng quát",
            status: "Đã hủy"
        }
    ];

    let selectedAppointmentId = null;

    const statusClasses = {
        "Chờ xác nhận": "status-pending",
        "Đã xác nhận": "status-confirmed",
        "Đã hoàn thành": "status-completed",
        "Đã hủy": "status-cancelled"
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const parts = dateString.split("-");

        if (parts.length !== 3) {
            return escapeHTML(dateString);
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getStatusBadge(status) {
        const className = statusClasses[status] || "status-pending";

        return `
            <span class="appointment-status ${className}">
                ${escapeHTML(status)}
            </span>
        `;
    }

    function showToast(message) {
        if (
            !toastElement ||
            !toastMessage ||
            !window.bootstrap ||
            !bootstrap.Toast
        ) {
            window.alert(message);
            return;
        }

        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2800
        }).show();
    }

    function updateStatistics() {
        if (totalElement) {
            totalElement.textContent = appointments.length;
        }

        if (pendingElement) {
            pendingElement.textContent = appointments.filter(
                item => item.status === "Chờ xác nhận"
            ).length;
        }

        if (confirmedElement) {
            confirmedElement.textContent = appointments.filter(
                item => item.status === "Đã xác nhận"
            ).length;
        }

        if (completedElement) {
            completedElement.textContent = appointments.filter(
                item => item.status === "Đã hoàn thành"
            ).length;
        }
    }

    function getFilteredAppointments() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const selectedDate = dateFilter.value;
        const selectedStatus = statusFilter.value;

        return appointments
            .filter(function (item) {
                const searchableText = [
                    item.id,
                    item.patientCode,
                    item.name,
                    item.phone
                ].join(" ").toLocaleLowerCase("vi");

                const matchesKeyword =
                    !keyword || searchableText.includes(keyword);

                const matchesDate =
                    !selectedDate || item.date === selectedDate;

                const matchesStatus =
                    !selectedStatus || item.status === selectedStatus;

                return matchesKeyword && matchesDate && matchesStatus;
            })
            .sort(function (a, b) {
                return (
                    a.date.localeCompare(b.date) ||
                    a.time.localeCompare(b.time)
                );
            });
    }

    function renderAppointments() {
        const filtered = getFilteredAppointments();

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="appointment-empty">
                        <i class="bi bi-calendar2-x"></i>
                        <div class="fw-semibold mb-1">
                            Không tìm thấy lịch hẹn
                        </div>
                        <div class="small">
                            Hãy thay đổi từ khóa hoặc điều kiện lọc.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filtered.map(function (item) {
                const firstLetter = escapeHTML(
                    item.name.trim().charAt(0) || "?"
                );

                let actions = `
                    <button
                        type="button"
                        class="appointment-action-btn"
                        data-action="view"
                        data-id="${escapeHTML(item.id)}"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết lịch hẹn">
                        <i class="bi bi-eye"></i>
                    </button>
                `;

                if (item.status === "Chờ xác nhận") {
                    actions += `
                        <button
                            type="button"
                            class="appointment-action-btn action-confirm"
                            data-action="confirm"
                            data-id="${escapeHTML(item.id)}"
                            title="Xác nhận lịch"
                            aria-label="Xác nhận lịch hẹn">
                            <i class="bi bi-check-lg"></i>
                        </button>

                        <button
                            type="button"
                            class="appointment-action-btn action-cancel"
                            data-action="cancel"
                            data-id="${escapeHTML(item.id)}"
                            title="Hủy lịch"
                            aria-label="Hủy lịch hẹn">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    `;
                } else if (item.status === "Đã xác nhận") {
                    actions += `
                        <button
                            type="button"
                            class="appointment-action-btn action-cancel"
                            data-action="cancel"
                            data-id="${escapeHTML(item.id)}"
                            title="Hủy lịch"
                            aria-label="Hủy lịch hẹn">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    `;
                }

                return `
                    <tr>
                        <td>
                            <span class="appointment-code">
                                ${escapeHTML(item.id)}
                            </span>
                        </td>

                        <td>
                            <div class="appointment-patient">
                                <div class="appointment-patient-avatar">
                                    ${firstLetter}
                                </div>

                                <div>
                                    <div class="appointment-patient-name">
                                        ${escapeHTML(item.name)}
                                    </div>
                                    <div class="appointment-patient-phone">
                                        ${escapeHTML(item.patientCode)}
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td>${escapeHTML(item.specialty)}</td>

                        <td>
                            <span class="appointment-date">
                                ${formatDate(item.date)}
                            </span>
                        </td>

                        <td>
                            <span class="appointment-time">
                                ${escapeHTML(item.time)}
                            </span>
                        </td>

                        <td>${getStatusBadge(item.status)}</td>

                        <td>
                            <div class="appointment-actions">
                                ${actions}
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            `Đang hiển thị ${filtered.length}/${appointments.length} lịch hẹn`;

        updateStatistics();
    }

    function findAppointment(id) {
        return appointments.find(item => item.id === id);
    }

    function showAppointmentDetails(id) {
        const item = findAppointment(id);

        if (
            !item ||
            !modalElement ||
            !detailContent ||
            !window.bootstrap
        ) {
            return;
        }

        selectedAppointmentId = id;

        detailContent.innerHTML = `
            <div class="appointment-detail-grid">

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Mã lịch hẹn</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.id)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Mã bệnh nhân</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.patientCode)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Họ và tên</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.name)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Số điện thoại</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.phone)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Chuyên khoa</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.specialty)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Ngày khám</span>
                    <div class="appointment-detail-value">
                        ${formatDate(item.date)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Giờ khám</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.time)}
                    </div>
                </div>

                <div class="appointment-detail-item">
                    <span class="appointment-detail-label">Trạng thái</span>
                    <div>${getStatusBadge(item.status)}</div>
                </div>

                <div class="appointment-detail-item appointment-detail-reason">
                    <span class="appointment-detail-label">Lý do khám</span>
                    <div class="appointment-detail-value">
                        ${escapeHTML(item.reason)}
                    </div>
                </div>

            </div>
        `;

        if (confirmModalButton) {
            confirmModalButton.classList.toggle(
                "d-none",
                item.status !== "Chờ xác nhận"
            );
        }

        bootstrap.Modal.getOrCreateInstance(modalElement).show();
    }

    function confirmAppointment(id) {
        const item = findAppointment(id);

        if (!item || item.status !== "Chờ xác nhận") {
            return;
        }

        item.status = "Đã xác nhận";

        renderAppointments();
        showToast(`Đã xác nhận lịch hẹn ${item.id}.`);

        if (
            selectedAppointmentId === id &&
            modalElement &&
            modalElement.classList.contains("show")
        ) {
            showAppointmentDetails(id);
        }
    }

    function cancelAppointment(id) {
        const item = findAppointment(id);

        if (
            !item ||
            !["Chờ xác nhận", "Đã xác nhận"].includes(item.status)
        ) {
            return;
        }

        const accepted = window.confirm(
            `Bạn có chắc chắn muốn hủy lịch hẹn ${item.id} của bệnh nhân ${item.name}?`
        );

        if (!accepted) return;

        item.status = "Đã hủy";

        renderAppointments();
        showToast(`Đã hủy lịch hẹn ${item.id}.`);

        if (
            selectedAppointmentId === id &&
            modalElement &&
            modalElement.classList.contains("show")
        ) {
            showAppointmentDetails(id);
        }
    }

    // Tìm kiếm và lọc.
    searchInput.addEventListener("input", renderAppointments);
    dateFilter.addEventListener("change", renderAppointments);
    statusFilter.addEventListener("change", renderAppointments);

    // Xóa điều kiện lọc.
    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        dateFilter.value = "";
        statusFilter.value = "";

        renderAppointments();
    });

    // Làm mới danh sách hiện tại.
    refreshButton.addEventListener("click", function () {
        renderAppointments();
        showToast("Danh sách lịch hẹn đã được làm mới.");
    });

    // Xử lý các nút thao tác trong bảng.
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "view") {
            showAppointmentDetails(id);
        } else if (action === "confirm") {
            confirmAppointment(id);
        } else if (action === "cancel") {
            cancelAppointment(id);
        }
    });

    // Xác nhận lịch từ cửa sổ chi tiết.
    if (confirmModalButton) {
        confirmModalButton.addEventListener("click", function () {
            if (selectedAppointmentId) {
                confirmAppointment(selectedAppointmentId);
            }
        });
    }

    // Hiển thị danh sách ban đầu.
    renderAppointments();
})();
/* ================================
   MEDCARE - DOCTOR QUEUE
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("queueTableBody");

    // Chỉ chạy trên trang hàng đợi khám
    if (!tableBody) return;

    const searchInput = document.getElementById("queueSearch");
    const statusFilter = document.getElementById("queueStatusFilter");
    const resetButton = document.getElementById("resetQueueFilters");
    const refreshButton = document.getElementById("refreshQueue");

    const totalElement = document.getElementById("queueTotal");
    const waitingElement = document.getElementById("queueWaiting");
    const progressElement = document.getElementById("queueInProgress");
    const completedElement = document.getElementById("queueCompleted");
    const resultCount = document.getElementById("queueResultCount");

    const detailModalElement = document.getElementById("queueDetailModal");
    const detailContent = document.getElementById("queueDetailContent");
    const startExamButton = document.getElementById("startExamFromModal");

    const toastElement = document.getElementById("queueToast");
    const toastMessage = document.getElementById("queueToastMessage");

    const appointments = [
        {
            id: 1,
            code: "BN001",
            name: "Nguyễn Thị Minh Châu",
            phone: "0901234567",
            gender: "Nữ",
            age: 28,
            time: "08:00",
            reason: "Khám tổng quát",
            status: "Chờ khám"
        },
        {
            id: 2,
            code: "BN002",
            name: "Trần Văn Hoàng",
            phone: "0912345678",
            gender: "Nam",
            age: 35,
            time: "08:15",
            reason: "Đau đầu, chóng mặt",
            status: "Đang khám"
        },
        {
            id: 3,
            code: "BN003",
            name: "Lê Thị Thu Hà",
            phone: "0934567890",
            gender: "Nữ",
            age: 24,
            time: "08:30",
            reason: "Khám sức khỏe định kỳ",
            status: "Chờ khám"
        },
        {
            id: 4,
            code: "BN004",
            name: "Phạm Minh Tuấn",
            phone: "0987654321",
            gender: "Nam",
            age: 42,
            time: "08:45",
            reason: "Đau lưng kéo dài",
            status: "Chờ khám"
        },
        {
            id: 5,
            code: "BN005",
            name: "Đỗ Ngọc Anh",
            phone: "0908765432",
            gender: "Nữ",
            age: 31,
            time: "09:00",
            reason: "Tái khám",
            status: "Đã khám"
        },
        {
            id: 6,
            code: "BN006",
            name: "Võ Quốc Bảo",
            phone: "0978123456",
            gender: "Nam",
            age: 19,
            time: "09:15",
            reason: "Ho và đau họng",
            status: "Chờ khám"
        },
        {
            id: 7,
            code: "BN007",
            name: "Nguyễn Hoàng Yến",
            phone: "0967123456",
            gender: "Nữ",
            age: 47,
            time: "09:30",
            reason: "Kiểm tra huyết áp",
            status: "Chờ khám"
        },
        {
            id: 8,
            code: "BN008",
            name: "Bùi Thanh Tùng",
            phone: "0945678123",
            gender: "Nam",
            age: 53,
            time: "09:45",
            reason: "Đau khớp",
            status: "Chờ khám"
        }
    ];

    let selectedPatientId = null;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (word) {
                return word.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function getStatusClass(status) {
        if (status === "Đang khám") return "queue-status-progress";
        if (status === "Đã khám") return "queue-status-completed";
        return "queue-status-waiting";
    }

    function showToast(message) {
        if (!toastElement || !toastMessage || !window.bootstrap) {
            window.alert(message);
            return;
        }

        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        }).show();
    }

    function updateStatistics() {
        totalElement.textContent = appointments.length;

        waitingElement.textContent = appointments.filter(function (patient) {
            return patient.status === "Chờ khám";
        }).length;

        progressElement.textContent = appointments.filter(function (patient) {
            return patient.status === "Đang khám";
        }).length;

        completedElement.textContent = appointments.filter(function (patient) {
            return patient.status === "Đã khám";
        }).length;
    }

    function getFilteredPatients() {
        const keyword = (searchInput.value || "").trim().toLowerCase();
        const status = statusFilter.value;

        return appointments.filter(function (patient) {
            const matchesKeyword =
                patient.name.toLowerCase().includes(keyword) ||
                patient.code.toLowerCase().includes(keyword) ||
                patient.phone.includes(keyword);

            const matchesStatus = !status || patient.status === status;

            return matchesKeyword && matchesStatus;
        });
    }

    function renderQueue() {
        const filteredPatients = getFilteredPatients();

        // Ưu tiên người đang khám, sau đó người chờ, cuối cùng người đã khám.
        const statusOrder = {
            "Đang khám": 0,
            "Chờ khám": 1,
            "Đã khám": 2
        };

        filteredPatients.sort(function (a, b) {
            const orderDifference = statusOrder[a.status] - statusOrder[b.status];

            if (orderDifference !== 0) return orderDifference;

            return a.time.localeCompare(b.time);
        });

        if (filteredPatients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="queue-empty">
                        <i class="bi bi-inbox"></i>
                        <div class="fw-semibold">Không tìm thấy bệnh nhân</div>
                        <div class="small mt-1">Thử thay đổi từ khóa hoặc bộ lọc.</div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredPatients.map(function (patient, index) {
                let actionButton = "";

                if (patient.status === "Chờ khám") {
                    actionButton = `
                        <button type="button"
                            class="queue-action-btn queue-action-start"
                            data-action="start"
                            data-id="${patient.id}">
                            <i class="bi bi-play-fill"></i>
                            Gọi khám
                        </button>
                    `;
                } else if (patient.status === "Đang khám") {
                    actionButton = `
                        <button type="button"
                            class="queue-action-btn queue-action-complete"
                            data-action="complete"
                            data-id="${patient.id}">
                            <i class="bi bi-check-lg"></i>
                            Hoàn tất
                        </button>
                    `;
                }

                return `
                    <tr>
                        <td>
                            <span class="queue-number">${String(index + 1).padStart(2, "0")}</span>
                        </td>

                        <td>
                            <div class="queue-patient">
                                <div class="queue-patient-avatar">
                                    ${escapeHTML(getInitials(patient.name))}
                                </div>
                                <div>
                                    <span class="queue-patient-name">
                                        ${escapeHTML(patient.name)}
                                    </span>
                                    <span class="queue-patient-phone">
                                        ${escapeHTML(patient.phone)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="queue-patient-code">
                                ${escapeHTML(patient.code)}
                            </span>
                        </td>

                        <td>
                            <span class="queue-time">
                                <i class="bi bi-clock me-1"></i>
                                ${escapeHTML(patient.time)}
                            </span>
                        </td>

                        <td>
                            <div class="queue-reason">
                                ${escapeHTML(patient.reason)}
                            </div>
                        </td>

                        <td>
                            <span class="queue-status ${getStatusClass(patient.status)}">
                                ${escapeHTML(patient.status)}
                            </span>
                        </td>

                        <td>
                            <div class="queue-actions">
                                <button type="button"
                                    class="queue-action-btn"
                                    data-action="detail"
                                    data-id="${patient.id}"
                                    title="Xem thông tin">
                                    <i class="bi bi-eye"></i>
                                </button>
                                ${actionButton}
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + filteredPatients.length + " / " + appointments.length + " bệnh nhân";

        updateStatistics();
    }

    function getPatientById(id) {
        return appointments.find(function (patient) {
            return patient.id === Number(id);
        });
    }

    function showPatientDetail(id) {
        const patient = getPatientById(id);

        if (!patient) return;

        selectedPatientId = patient.id;

        detailContent.innerHTML = `
            <div class="queue-detail-grid">
                <div class="queue-detail-item">
                    <span class="queue-detail-label">Mã bệnh nhân</span>
                    <span class="queue-detail-value">${escapeHTML(patient.code)}</span>
                </div>

                <div class="queue-detail-item">
                    <span class="queue-detail-label">Họ và tên</span>
                    <span class="queue-detail-value">${escapeHTML(patient.name)}</span>
                </div>

                <div class="queue-detail-item">
                    <span class="queue-detail-label">Số điện thoại</span>
                    <span class="queue-detail-value">${escapeHTML(patient.phone)}</span>
                </div>

                <div class="queue-detail-item">
                    <span class="queue-detail-label">Tuổi / Giới tính</span>
                    <span class="queue-detail-value">
                        ${patient.age} tuổi · ${escapeHTML(patient.gender)}
                    </span>
                </div>

                <div class="queue-detail-item">
                    <span class="queue-detail-label">Giờ tiếp nhận</span>
                    <span class="queue-detail-value">${escapeHTML(patient.time)}</span>
                </div>

                <div class="queue-detail-item">
                    <span class="queue-detail-label">Trạng thái</span>
                    <span class="queue-status ${getStatusClass(patient.status)}">
                        ${escapeHTML(patient.status)}
                    </span>
                </div>

                <div class="queue-detail-item queue-detail-reason">
                    <span class="queue-detail-label">Lý do khám</span>
                    <span class="queue-detail-value">${escapeHTML(patient.reason)}</span>
                </div>
            </div>
        `;

        startExamButton.style.display =
            patient.status === "Chờ khám" ? "" : "none";

        bootstrap.Modal.getOrCreateInstance(detailModalElement).show();
    }

    function startExam(id) {
        const patient = getPatientById(id);

        if (!patient || patient.status !== "Chờ khám") return;

        const currentPatient = appointments.find(function (item) {
            return item.status === "Đang khám";
        });

        if (currentPatient) {
            showToast("Vui lòng hoàn tất lượt khám hiện tại trước khi gọi bệnh nhân tiếp theo.");
            return;
        }

        patient.status = "Đang khám";

        renderQueue();
        showToast("Đã gọi khám bệnh nhân " + patient.name + ".");

        if (selectedPatientId === patient.id && detailModalElement.classList.contains("show")) {
            showPatientDetail(patient.id);
        }
    }

    function completeExam(id) {
        const patient = getPatientById(id);

        if (!patient || patient.status !== "Đang khám") return;

        if (!window.confirm("Xác nhận hoàn tất lượt khám của " + patient.name + "?")) {
            return;
        }

        patient.status = "Đã khám";

        renderQueue();
        showToast("Đã hoàn tất lượt khám của " + patient.name + ".");
    }

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "detail") {
            showPatientDetail(id);
        } else if (action === "start") {
            startExam(id);
        } else if (action === "complete") {
            completeExam(id);
        }
    });

    startExamButton.addEventListener("click", function () {
        if (selectedPatientId === null) return;

        const patient = getPatientById(selectedPatientId);

        if (!patient || patient.status !== "Chờ khám") return;

        startExam(selectedPatientId);

        if (patient.status === "Đang khám") {
            bootstrap.Modal.getOrCreateInstance(detailModalElement).hide();
        }
    });

    searchInput.addEventListener("input", renderQueue);
    statusFilter.addEventListener("change", renderQueue);

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        statusFilter.value = "";
        renderQueue();
    });

    refreshButton.addEventListener("click", function () {
        renderQueue();
        showToast("Danh sách hàng đợi đã được cập nhật.");
    });

    renderQueue();
})();
/* ================================
   MEDCARE - DOCTOR PATIENT LIST
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("patientTableBody");

    // Chỉ chạy trên trang danh sách bệnh nhân
    if (!tableBody) return;

    const searchInput = document.getElementById("patientSearch");
    const genderFilter = document.getElementById("patientGenderFilter");
    const recordFilter = document.getElementById("patientRecordFilter");
    const resetButton = document.getElementById("resetPatientFilters");
    const refreshButton = document.getElementById("refreshPatients");

    const totalElement = document.getElementById("patientTotal");
    const maleElement = document.getElementById("patientMale");
    const femaleElement = document.getElementById("patientFemale");
    const recordElement = document.getElementById("patientHasRecord");
    const resultCount = document.getElementById("patientResultCount");

    const modalElement = document.getElementById("patientInfoModal");
    const modalContent = document.getElementById("patientInfoContent");
    const viewRecordButton = document.getElementById("viewPatientRecord");

    const toastElement = document.getElementById("patientListToast");
    const toastMessage = document.getElementById("patientListToastMessage");

    const patients = [
        {
            id: 1,
            code: "BN001",
            name: "Nguyễn Thị Minh Châu",
            gender: "Nữ",
            dob: "1998-04-15",
            phone: "0901234567",
            email: "minhchau@example.com",
            address: "Quận 1, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Khám tổng quát"
        },
        {
            id: 2,
            code: "BN002",
            name: "Trần Văn Hoàng",
            gender: "Nam",
            dob: "1991-08-22",
            phone: "0912345678",
            email: "vanhoang@example.com",
            address: "Quận 3, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Khám nội tổng quát"
        },
        {
            id: 3,
            code: "BN003",
            name: "Lê Thị Thu Hà",
            gender: "Nữ",
            dob: "2002-01-09",
            phone: "0934567890",
            email: "thuha@example.com",
            address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Khám sức khỏe định kỳ"
        },
        {
            id: 4,
            code: "BN004",
            name: "Phạm Minh Tuấn",
            gender: "Nam",
            dob: "1984-11-30",
            phone: "0987654321",
            email: "minhtuan@example.com",
            address: "TP. Thủ Đức, TP. Hồ Chí Minh",
            hasRecord: false,
            history: "Chưa có lịch sử khám"
        },
        {
            id: 5,
            code: "BN005",
            name: "Đỗ Ngọc Anh",
            gender: "Nữ",
            dob: "1995-06-18",
            phone: "0908765432",
            email: "ngocanh@example.com",
            address: "Quận 7, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Tái khám"
        },
        {
            id: 6,
            code: "BN006",
            name: "Võ Quốc Bảo",
            gender: "Nam",
            dob: "2007-03-12",
            phone: "0978123456",
            email: "quocbao@example.com",
            address: "Quận Gò Vấp, TP. Hồ Chí Minh",
            hasRecord: false,
            history: "Chưa có lịch sử khám"
        },
        {
            id: 7,
            code: "BN007",
            name: "Nguyễn Hoàng Yến",
            gender: "Nữ",
            dob: "1979-09-25",
            phone: "0967123456",
            email: "hoangyen@example.com",
            address: "Quận Tân Bình, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Kiểm tra sức khỏe định kỳ"
        },
        {
            id: 8,
            code: "BN008",
            name: "Bùi Thanh Tùng",
            gender: "Nam",
            dob: "1973-12-05",
            phone: "0945678123",
            email: "thanhtung@example.com",
            address: "Quận 10, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Khám cơ xương khớp"
        },
        {
            id: 9,
            code: "BN009",
            name: "Phan Ngọc Mai",
            gender: "Nữ",
            dob: "2000-07-14",
            phone: "0923456781",
            email: "ngocmai@example.com",
            address: "Quận Phú Nhuận, TP. Hồ Chí Minh",
            hasRecord: false,
            history: "Chưa có lịch sử khám"
        },
        {
            id: 10,
            code: "BN010",
            name: "Lê Minh Đức",
            gender: "Nam",
            dob: "1988-02-28",
            phone: "0938123456",
            email: "minhduc@example.com",
            address: "Quận 5, TP. Hồ Chí Minh",
            hasRecord: true,
            history: "Khám nội tổng quát"
        }
    ];

    let selectedPatientId = null;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (word) {
                return word.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function formatDate(dateString) {
        if (!dateString) return "Chưa cập nhật";

        const parts = dateString.split("-");

        if (parts.length !== 3) return dateString;

        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function showToast(message) {
        if (!toastElement || !toastMessage || !window.bootstrap) {
            window.alert(message);
            return;
        }

        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        }).show();
    }

    function updateStatistics() {
        totalElement.textContent = patients.length;

        maleElement.textContent = patients.filter(function (patient) {
            return patient.gender === "Nam";
        }).length;

        femaleElement.textContent = patients.filter(function (patient) {
            return patient.gender === "Nữ";
        }).length;

        recordElement.textContent = patients.filter(function (patient) {
            return patient.hasRecord;
        }).length;
    }

    function getFilteredPatients() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const gender = genderFilter.value;
        const record = recordFilter.value;

        return patients.filter(function (patient) {
            const searchText = [
                patient.code,
                patient.name,
                patient.phone,
                patient.email
            ].join(" ").toLocaleLowerCase("vi");

            const matchesSearch = searchText.includes(keyword);
            const matchesGender = !gender || patient.gender === gender;

            let matchesRecord = true;

            if (record === "yes") {
                matchesRecord = patient.hasRecord;
            } else if (record === "no") {
                matchesRecord = !patient.hasRecord;
            }

            return matchesSearch && matchesGender && matchesRecord;
        });
    }

    function renderPatients() {
        const filteredPatients = getFilteredPatients();

        if (filteredPatients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="patient-list-empty">
                        <i class="bi bi-person-x"></i>
                        <div class="fw-semibold">Không tìm thấy bệnh nhân</div>
                        <div class="small mt-1">
                            Vui lòng thử từ khóa hoặc bộ lọc khác.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredPatients.map(function (patient) {
                const genderClass = patient.gender === "Nam"
                    ? "patient-gender-male"
                    : "patient-gender-female";

                const genderIcon = patient.gender === "Nam"
                    ? "bi-gender-male"
                    : "bi-gender-female";

                const recordHTML = patient.hasRecord
                    ? `<span class="patient-record-status patient-record-yes">
                           <i class="bi bi-check-circle-fill"></i> Đã có
                       </span>`
                    : `<span class="patient-record-status patient-record-no">
                           <i class="bi bi-clock-history"></i> Chưa có
                       </span>`;

                return `
                    <tr>
                        <td>
                            <span class="patient-list-code">
                                ${escapeHTML(patient.code)}
                            </span>
                        </td>

                        <td>
                            <div class="patient-list-person">
                                <div class="patient-list-avatar">
                                    ${escapeHTML(getInitials(patient.name))}
                                </div>
                                <div>
                                    <span class="patient-list-name">
                                        ${escapeHTML(patient.name)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="patient-gender ${genderClass}">
                                <i class="bi ${genderIcon}"></i>
                                ${escapeHTML(patient.gender)}
                            </span>
                        </td>

                        <td>${escapeHTML(formatDate(patient.dob))}</td>

                        <td>
                            <span class="patient-list-contact">
                                ${escapeHTML(patient.phone)}
                            </span>
                        </td>

                        <td>
                            <span class="patient-list-contact">
                                ${escapeHTML(patient.email)}
                            </span>
                        </td>

                        <td>${recordHTML}</td>

                        <td>
                            <div class="patient-list-actions">
                                <button type="button"
                                    class="patient-list-action"
                                    data-patient-action="detail"
                                    data-id="${patient.id}"
                                    title="Xem thông tin">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button"
                                    class="patient-list-action"
                                    data-patient-action="record"
                                    data-id="${patient.id}"
                                    title="Xem hồ sơ">
                                    <i class="bi bi-folder2-open"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + filteredPatients.length +
            " / " + patients.length + " bệnh nhân";

        updateStatistics();
    }

    function getPatientById(id) {
        return patients.find(function (patient) {
            return patient.id === Number(id);
        });
    }

    function showPatientDetail(id) {
        const patient = getPatientById(id);

        if (!patient) return;

        selectedPatientId = patient.id;

        modalContent.innerHTML = `
            <div class="patient-info-heading">
                <div class="patient-info-avatar">
                    ${escapeHTML(getInitials(patient.name))}
                </div>

                <div>
                    <h3 class="patient-info-name">
                        ${escapeHTML(patient.name)}
                    </h3>

                    <div class="patient-info-code">
                        Mã bệnh nhân: ${escapeHTML(patient.code)}
                    </div>

                    <div class="mt-2">
                        ${
                            patient.hasRecord
                                ? `<span class="patient-record-status patient-record-yes">
                                       <i class="bi bi-check-circle-fill"></i> Đã có hồ sơ
                                   </span>`
                                : `<span class="patient-record-status patient-record-no">
                                       <i class="bi bi-clock-history"></i> Chưa có hồ sơ
                                   </span>`
                        }
                    </div>
                </div>
            </div>

            <div class="patient-info-grid">
                <div class="patient-info-item">
                    <span class="patient-info-label">Giới tính</span>
                    <span class="patient-info-value">
                        ${escapeHTML(patient.gender)}
                    </span>
                </div>

                <div class="patient-info-item">
                    <span class="patient-info-label">Ngày sinh</span>
                    <span class="patient-info-value">
                        ${escapeHTML(formatDate(patient.dob))}
                    </span>
                </div>

                <div class="patient-info-item">
                    <span class="patient-info-label">Số điện thoại</span>
                    <span class="patient-info-value">
                        ${escapeHTML(patient.phone)}
                    </span>
                </div>

                <div class="patient-info-item">
                    <span class="patient-info-label">Email</span>
                    <span class="patient-info-value">
                        ${escapeHTML(patient.email)}
                    </span>
                </div>

                <div class="patient-info-item patient-info-full">
                    <span class="patient-info-label">Địa chỉ</span>
                    <span class="patient-info-value">
                        ${escapeHTML(patient.address)}
                    </span>
                </div>

                <div class="patient-info-item patient-info-full">
                    <span class="patient-info-label">Thông tin khám</span>
                    <span class="patient-info-value">
                        ${escapeHTML(patient.history)}
                    </span>
                </div>
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(modalElement).show();
    }

    function openPatientRecord(id) {
        const patient = getPatientById(id);

        if (!patient) return;

        if (!patient.hasRecord) {
            showToast("Bệnh nhân này chưa có hồ sơ khám.");
            return;
        }

        // Chuyển sang trang hồ sơ và truyền mã bệnh nhân qua URL.
        window.location.href =
            "ho-so-benh-nhan.html?maBenhNhan=" +
            encodeURIComponent(patient.code);
    }

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-patient-action]");

        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.patientAction;

        if (action === "detail") {
            showPatientDetail(id);
        } else if (action === "record") {
            openPatientRecord(id);
        }
    });

    viewRecordButton.addEventListener("click", function () {
        if (selectedPatientId === null) return;

        const patient = getPatientById(selectedPatientId);

        if (!patient) return;

        if (!patient.hasRecord) {
            showToast("Bệnh nhân này chưa có hồ sơ khám.");
            return;
        }

        openPatientRecord(selectedPatientId);
    });

    searchInput.addEventListener("input", renderPatients);
    genderFilter.addEventListener("change", renderPatients);
    recordFilter.addEventListener("change", renderPatients);

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        genderFilter.value = "";
        recordFilter.value = "";

        renderPatients();
    });

    refreshButton.addEventListener("click", function () {
        renderPatients();
        showToast("Danh sách bệnh nhân đã được cập nhật.");
    });

    renderPatients();
})();
/* ================================
   MEDCARE - MEDICAL RECORDS
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("medicalRecordTableBody");

    // Chỉ chạy trên trang hồ sơ bệnh nhân
    if (!tableBody) return;

    const searchInput = document.getElementById("medicalRecordSearch");
    const recordFilter = document.getElementById("medicalRecordFilter");
    const resetButton = document.getElementById("resetMedicalRecordFilters");
    const refreshButton = document.getElementById("refreshMedicalRecords");

    const totalElement = document.getElementById("recordTotal");
    const historyElement = document.getElementById("recordWithHistory");
    const incompleteElement = document.getElementById("recordIncomplete");
    const visitTotalElement = document.getElementById("recordVisitTotal");
    const resultCount = document.getElementById("medicalRecordResultCount");

    const detailPanel = document.getElementById("medicalRecordDetailPanel");
    const detailContent = document.getElementById("medicalRecordDetailContent");
    const closeDetailButton = document.getElementById("closeMedicalRecordDetail");

    const toastElement = document.getElementById("medicalRecordToast");
    const toastMessage = document.getElementById("medicalRecordToastMessage");

    const records = [
        {
            id: 1,
            code: "BN001",
            name: "Nguyễn Thị Minh Châu",
            gender: "Nữ",
            dob: "1998-04-15",
            phone: "0901234567",
            email: "minhchau@example.com",
            address: "Quận 1, TP. Hồ Chí Minh",
            blood: "O+",
            height: "160 cm",
            weight: "52 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Chưa ghi nhận bệnh lý mạn tính.",
            familyHistory: "Chưa cập nhật",
            note: "Khám tổng quát định kỳ.",
            visits: [
                {
                    date: "2026-10-20",
                    title: "Khám tổng quát",
                    description: "Khám sức khỏe định kỳ, tư vấn chế độ sinh hoạt."
                },
                {
                    date: "2026-06-12",
                    title: "Tái khám",
                    description: "Theo dõi tình trạng sức khỏe."
                }
            ]
        },
        {
            id: 2,
            code: "BN002",
            name: "Trần Văn Hoàng",
            gender: "Nam",
            dob: "1991-08-22",
            phone: "0912345678",
            email: "vanhoang@example.com",
            address: "Quận 3, TP. Hồ Chí Minh",
            blood: "A+",
            height: "172 cm",
            weight: "68 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Có tiền sử đau đầu tái diễn theo lời khai.",
            familyHistory: "Chưa cập nhật",
            note: "Theo dõi triệu chứng và tái khám theo chỉ định.",
            visits: [
                {
                    date: "2026-10-18",
                    title: "Khám nội tổng quát",
                    description: "Đánh giá triệu chứng đau đầu, tư vấn theo dõi."
                }
            ]
        },
        {
            id: 3,
            code: "BN003",
            name: "Lê Thị Thu Hà",
            gender: "Nữ",
            dob: "2002-01-09",
            phone: "0934567890",
            email: "thuha@example.com",
            address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
            blood: "B+",
            height: "158 cm",
            weight: "48 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Chưa ghi nhận bệnh lý đáng chú ý.",
            familyHistory: "Chưa cập nhật",
            note: "Khám sức khỏe định kỳ.",
            visits: [
                {
                    date: "2026-10-15",
                    title: "Khám sức khỏe định kỳ",
                    description: "Đánh giá sức khỏe tổng quát."
                }
            ]
        },
        {
            id: 4,
            code: "BN004",
            name: "Phạm Minh Tuấn",
            gender: "Nam",
            dob: "1984-11-30",
            phone: "0987654321",
            email: "minhtuan@example.com",
            address: "TP. Thủ Đức, TP. Hồ Chí Minh",
            blood: "Chưa rõ",
            height: "Chưa cập nhật",
            weight: "Chưa cập nhật",
            allergies: "Chưa cập nhật",
            medicalHistory: "",
            familyHistory: "",
            note: "Cần bổ sung thông tin tiền sử bệnh và thông tin sức khỏe.",
            visits: []
        },
        {
            id: 5,
            code: "BN005",
            name: "Đỗ Ngọc Anh",
            gender: "Nữ",
            dob: "1995-06-18",
            phone: "0908765432",
            email: "ngocanh@example.com",
            address: "Quận 7, TP. Hồ Chí Minh",
            blood: "AB+",
            height: "162 cm",
            weight: "54 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Đã có lịch sử tái khám.",
            familyHistory: "Chưa cập nhật",
            note: "Theo dõi sức khỏe theo lịch hẹn.",
            visits: [
                {
                    date: "2026-10-10",
                    title: "Tái khám",
                    description: "Đánh giá tình trạng hiện tại và hướng dẫn chăm sóc sức khỏe."
                },
                {
                    date: "2026-08-10",
                    title: "Khám ban đầu",
                    description: "Ghi nhận thông tin khám và tư vấn."
                }
            ]
        },
        {
            id: 6,
            code: "BN006",
            name: "Võ Quốc Bảo",
            gender: "Nam",
            dob: "2007-03-12",
            phone: "0978123456",
            email: "quocbao@example.com",
            address: "Quận Gò Vấp, TP. Hồ Chí Minh",
            blood: "Chưa rõ",
            height: "Chưa cập nhật",
            weight: "Chưa cập nhật",
            allergies: "Chưa cập nhật",
            medicalHistory: "",
            familyHistory: "",
            note: "Cần bổ sung tiền sử và thông tin sức khỏe.",
            visits: []
        },
        {
            id: 7,
            code: "BN007",
            name: "Nguyễn Hoàng Yến",
            gender: "Nữ",
            dob: "1979-09-25",
            phone: "0967123456",
            email: "hoangyen@example.com",
            address: "Quận Tân Bình, TP. Hồ Chí Minh",
            blood: "O-",
            height: "155 cm",
            weight: "57 kg",
            allergies: "Chưa cập nhật",
            medicalHistory: "Có lịch sử kiểm tra sức khỏe định kỳ.",
            familyHistory: "Chưa cập nhật",
            note: "Tiếp tục theo dõi sức khỏe định kỳ.",
            visits: [
                {
                    date: "2026-09-22",
                    title: "Kiểm tra sức khỏe",
                    description: "Đánh giá sức khỏe tổng quát."
                }
            ]
        },
        {
            id: 8,
            code: "BN008",
            name: "Bùi Thanh Tùng",
            gender: "Nam",
            dob: "1973-12-05",
            phone: "0945678123",
            email: "thanhtung@example.com",
            address: "Quận 10, TP. Hồ Chí Minh",
            blood: "A-",
            height: "170 cm",
            weight: "72 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Đã ghi nhận lần khám cơ xương khớp.",
            familyHistory: "Chưa cập nhật",
            note: "Theo dõi triệu chứng và thực hiện hướng dẫn của bác sĩ.",
            visits: [
                {
                    date: "2026-09-12",
                    title: "Khám cơ xương khớp",
                    description: "Đánh giá tình trạng đau khớp và hướng dẫn chăm sóc."
                }
            ]
        },
        {
            id: 9,
            code: "BN009",
            name: "Phan Ngọc Mai",
            gender: "Nữ",
            dob: "2000-07-14",
            phone: "0923456781",
            email: "ngocmai@example.com",
            address: "Quận Phú Nhuận, TP. Hồ Chí Minh",
            blood: "Chưa rõ",
            height: "Chưa cập nhật",
            weight: "Chưa cập nhật",
            allergies: "Chưa cập nhật",
            medicalHistory: "",
            familyHistory: "",
            note: "Cần bổ sung thông tin tiền sử.",
            visits: []
        },
        {
            id: 10,
            code: "BN010",
            name: "Lê Minh Đức",
            gender: "Nam",
            dob: "1988-02-28",
            phone: "0938123456",
            email: "minhduc@example.com",
            address: "Quận 5, TP. Hồ Chí Minh",
            blood: "B-",
            height: "175 cm",
            weight: "70 kg",
            allergies: "Chưa ghi nhận",
            medicalHistory: "Đã ghi nhận lịch sử khám nội tổng quát.",
            familyHistory: "Chưa cập nhật",
            note: "Theo dõi sức khỏe định kỳ.",
            visits: [
                {
                    date: "2026-10-05",
                    title: "Khám nội tổng quát",
                    description: "Khám tổng quát và tư vấn chăm sóc sức khỏe."
                }
            ]
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (word) {
                return word.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function formatDate(value) {
        if (!value) return "Chưa cập nhật";

        const parts = value.split("-");

        if (parts.length !== 3) return value;

        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function hasHistory(record) {
        return record.visits.length > 0;
    }

    function isIncomplete(record) {
        return !record.medicalHistory.trim() ||
               !record.familyHistory.trim() ||
               record.blood === "Chưa rõ";
    }

    function showToast(message) {
        if (!toastElement || !toastMessage || !window.bootstrap) {
            window.alert(message);
            return;
        }

        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        }).show();
    }

    function updateStatistics() {
        totalElement.textContent = records.length;

        historyElement.textContent = records.filter(function (record) {
            return hasHistory(record);
        }).length;

        incompleteElement.textContent = records.filter(function (record) {
            return isIncomplete(record);
        }).length;

        visitTotalElement.textContent = records.reduce(function (total, record) {
            return total + record.visits.length;
        }, 0);
    }

    function getFilteredRecords() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const filter = recordFilter.value;

        return records.filter(function (record) {
            const searchText = (
                record.code + " " + record.name + " " + record.phone
            ).toLocaleLowerCase("vi");

            const matchesSearch = searchText.includes(keyword);

            let matchesFilter = true;

            if (filter === "history") {
                matchesFilter = hasHistory(record);
            } else if (filter === "incomplete") {
                matchesFilter = isIncomplete(record);
            }

            return matchesSearch && matchesFilter;
        });
    }

    function renderRecords() {
        const filteredRecords = getFilteredRecords();

        if (filteredRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="medical-record-empty">
                        <i class="bi bi-folder2-open"></i>
                        <div class="fw-semibold">Không tìm thấy hồ sơ</div>
                        <div class="small mt-1">
                            Hãy thử từ khóa hoặc bộ lọc khác.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredRecords.map(function (record) {
                const historyStatus = hasHistory(record)
                    ? `<span class="medical-record-history has-history">
                           <i class="bi bi-check-circle-fill"></i> Có lịch sử
                       </span>`
                    : `<span class="medical-record-history no-history">
                           <i class="bi bi-exclamation-circle"></i> Chưa có
                       </span>`;

                const lastVisit = record.visits.length
                    ? formatDate(
                        record.visits.slice().sort(function (a, b) {
                            return b.date.localeCompare(a.date);
                        })[0].date
                    )
                    : "Chưa có";

                return `
                    <tr>
                        <td>
                            <span class="medical-record-code">
                                ${escapeHTML(record.code)}
                            </span>
                        </td>

                        <td>
                            <div class="medical-record-person">
                                <div class="medical-record-avatar">
                                    ${escapeHTML(getInitials(record.name))}
                                </div>
                                <div>
                                    <span class="medical-record-name">
                                        ${escapeHTML(record.name)}
                                    </span>
                                    <span class="medical-record-subtext">
                                        ${escapeHTML(record.gender)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>${escapeHTML(formatDate(record.dob))}</td>

                        <td>
                            <span class="medical-record-blood">
                                ${escapeHTML(record.blood)}
                            </span>
                        </td>

                        <td>${historyStatus}</td>

                        <td>${escapeHTML(lastVisit)}</td>

                        <td class="text-center">
                            <button type="button"
                                class="medical-record-action"
                                data-record-id="${record.id}">
                                <i class="bi bi-eye"></i>
                                Xem hồ sơ
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + filteredRecords.length +
            " / " + records.length + " hồ sơ";

        updateStatistics();
    }

    function getRecordById(id) {
        return records.find(function (record) {
            return record.id === Number(id);
        });
    }

    function renderRecordDetail(record) {
        const visitsHTML = record.visits.length
            ? record.visits.slice().sort(function (a, b) {
                return b.date.localeCompare(a.date);
            }).map(function (visit) {
                return `
                    <div class="medical-record-timeline-item">
                        <div class="medical-record-timeline-date">
                            ${escapeHTML(formatDate(visit.date))}
                        </div>
                        <div class="medical-record-timeline-title">
                            ${escapeHTML(visit.title)}
                        </div>
                        <div class="medical-record-timeline-description">
                            ${escapeHTML(visit.description)}
                        </div>
                    </div>
                `;
            }).join("")
            : `
                <div class="medical-record-note">
                    Chưa có lịch sử khám được ghi nhận trong hồ sơ.
                </div>
            `;

        detailContent.innerHTML = `
            <div class="medical-record-profile">
                <div class="medical-record-profile-avatar">
                    ${escapeHTML(getInitials(record.name))}
                </div>
                <div>
                    <h3 class="medical-record-profile-name">
                        ${escapeHTML(record.name)}
                    </h3>
                    <div class="medical-record-profile-code">
                        Mã bệnh nhân: ${escapeHTML(record.code)}
                    </div>
                    <div class="medical-record-profile-code mt-1">
                        ${escapeHTML(record.gender)} · ${escapeHTML(formatDate(record.dob))}
                    </div>
                </div>
            </div>

            <section class="medical-record-section">
                <h4 class="medical-record-section-title">
                    <i class="bi bi-person-lines-fill"></i>
                    Thông tin cá nhân
                </h4>

                <div class="medical-record-info-grid">
                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Số điện thoại</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.phone)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Email</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.email)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Nhóm máu</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.blood)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Chiều cao</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.height)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Cân nặng</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.weight)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Ngày sinh</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(formatDate(record.dob))}
                        </span>
                    </div>
                </div>

                <div class="medical-record-info-item mt-3">
                    <span class="medical-record-info-label">Địa chỉ</span>
                    <span class="medical-record-info-value">
                        ${escapeHTML(record.address)}
                    </span>
                </div>
            </section>

            <section class="medical-record-section">
                <h4 class="medical-record-section-title">
                    <i class="bi bi-heart-pulse"></i>
                    Tiền sử sức khỏe
                </h4>

                <div class="medical-record-info-grid">
                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Tiền sử bệnh</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.medicalHistory || "Chưa cập nhật")}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Dị ứng</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.allergies)}
                        </span>
                    </div>

                    <div class="medical-record-info-item">
                        <span class="medical-record-info-label">Tiền sử gia đình</span>
                        <span class="medical-record-info-value">
                            ${escapeHTML(record.familyHistory || "Chưa cập nhật")}
                        </span>
                    </div>
                </div>

                <div class="medical-record-note mt-3">
                    <strong>Ghi chú:</strong>
                    ${escapeHTML(record.note)}
                </div>
            </section>

            <section class="medical-record-section">
                <h4 class="medical-record-section-title">
                    <i class="bi bi-clock-history"></i>
                    Lịch sử khám bệnh
                </h4>

                <div class="medical-record-timeline">
                    ${visitsHTML}
                </div>
            </section>
        `;

        detailPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function openRecordByCode(code) {
        const record = records.find(function (item) {
            return item.code.toLowerCase() === String(code).toLowerCase();
        });

        if (!record) {
            showToast("Không tìm thấy hồ sơ có mã bệnh nhân " + code + ".");
            return;
        }

        searchInput.value = record.code;
        recordFilter.value = "";
        renderRecords();
        renderRecordDetail(record);
    }

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-record-id]");

        if (!button) return;

        const record = getRecordById(button.dataset.recordId);

        if (record) {
            renderRecordDetail(record);
        }
    });

    searchInput.addEventListener("input", renderRecords);
    recordFilter.addEventListener("change", renderRecords);

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        recordFilter.value = "";
        renderRecords();
    });

    refreshButton.addEventListener("click", function () {
        renderRecords();
        showToast("Danh sách hồ sơ đã được cập nhật.");
    });

    closeDetailButton.addEventListener("click", function () {
        detailContent.innerHTML = `
            <div class="medical-record-placeholder">
                <i class="bi bi-person-vcard"></i>
                <h4>Chưa chọn bệnh nhân</h4>
                <p>Chọn một hồ sơ trong danh sách phía trên để xem thông tin chi tiết.</p>
            </div>
        `;
    });

    // Cho phép mở đúng hồ sơ khi điều hướng từ trang danh sách bệnh nhân.
    renderRecords();

    const params = new URLSearchParams(window.location.search);
    const patientCode = params.get("maBenhNhan");

    if (patientCode) {
        openRecordByCode(patientCode);
    }
})();

/* ================================
   MEDCARE - EXAMINATION FORMS
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("examTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("examSearch");
    const dateFilter = document.getElementById("examDateFilter");
    const statusFilter = document.getElementById("examStatusFilter");
    const resetButton = document.getElementById("resetExamFilters");
    const createButton = document.getElementById("createExaminationBtn");

    const totalElement = document.getElementById("examTotal");
    const waitingElement = document.getElementById("examWaiting");
    const progressElement = document.getElementById("examInProgress");
    const completedElement = document.getElementById("examCompleted");
    const resultCount = document.getElementById("examResultCount");

    const formElement = document.getElementById("examForm");
    const formModalElement = document.getElementById("examFormModal");
    const detailModalElement = document.getElementById("examDetailModal");
    const detailContent = document.getElementById("examDetailContent");
    const editFromDetailButton = document.getElementById("editExamFromDetail");

    const toastElement = document.getElementById("examToast");
    const toastMessage = document.getElementById("examToastMessage");

    if (!window.bootstrap) {
        console.error("Bootstrap chưa được tải.");
        return;
    }

    const formModal = bootstrap.Modal.getOrCreateInstance(formModalElement);
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const fields = {
        id: document.getElementById("examEditId"),
        code: document.getElementById("examPatientCode"),
        name: document.getElementById("examPatientName"),
        date: document.getElementById("examDate"),
        status: document.getElementById("examStatus"),
        symptoms: document.getElementById("examSymptoms"),
        diagnosis: document.getElementById("examDiagnosis"),
        treatment: document.getElementById("examTreatment"),
        notes: document.getElementById("examNotes")
    };

    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    let nextId = 5;
    let selectedExamId = null;

    const examinations = [
        {
            id: 1,
            code: "PK20261020-001",
            patientCode: "BN001",
            patientName: "Nguyễn Thị Minh Châu",
            date: "2026-10-20",
            symptoms: "Mệt mỏi, cần kiểm tra sức khỏe định kỳ.",
            diagnosis: "Chưa ghi nhận bất thường đáng chú ý.",
            treatment: "Tư vấn chế độ sinh hoạt và theo dõi sức khỏe.",
            notes: "Tái khám theo lịch hẹn nếu có triệu chứng.",
            status: "Hoàn thành"
        },
        {
            id: 2,
            code: "PK20261022-001",
            patientCode: "BN002",
            patientName: "Trần Văn Hoàng",
            date: "2026-10-22",
            symptoms: "Đau đầu tái diễn theo lời khai của bệnh nhân.",
            diagnosis: "Đang đánh giá nguyên nhân.",
            treatment: "Theo dõi triệu chứng, thực hiện chỉ định sau khi bác sĩ đánh giá.",
            notes: "",
            status: "Đang khám"
        },
        {
            id: 3,
            code: "PK20261022-002",
            patientCode: "BN003",
            patientName: "Lê Thị Thu Hà",
            date: "2026-10-22",
            symptoms: "Đến khám sức khỏe định kỳ.",
            diagnosis: "",
            treatment: "",
            notes: "",
            status: "Chờ khám"
        },
        {
            id: 4,
            code: "PK20261021-001",
            patientCode: "BN005",
            patientName: "Đỗ Ngọc Anh",
            date: "2026-10-21",
            symptoms: "Đến tái khám theo lịch hẹn.",
            diagnosis: "Tiếp tục theo dõi tình trạng sức khỏe.",
            treatment: "Thực hiện hướng dẫn chăm sóc sức khỏe.",
            notes: "Đã tư vấn cho bệnh nhân.",
            status: "Hoàn thành"
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function formatDate(value) {
        if (!value) return "Chưa cập nhật";

        const parts = value.split("-");
        return parts.length === 3
            ? parts[2] + "/" + parts[1] + "/" + parts[0]
            : value;
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function showToast(message) {
        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2600
        }).show();
    }

    function getStatusClass(status) {
        if (status === "Chờ khám") return "status-waiting";
        if (status === "Đang khám") return "status-progress";
        return "status-completed";
    }

    function getStatusIcon(status) {
        if (status === "Chờ khám") return "bi-hourglass-split";
        if (status === "Đang khám") return "bi-activity";
        return "bi-check-circle-fill";
    }

    function updateStatistics() {
        totalElement.textContent = examinations.length;

        waitingElement.textContent = examinations.filter(function (item) {
            return item.status === "Chờ khám";
        }).length;

        progressElement.textContent = examinations.filter(function (item) {
            return item.status === "Đang khám";
        }).length;

        completedElement.textContent = examinations.filter(function (item) {
            return item.status === "Hoàn thành";
        }).length;
    }

    function getFilteredExaminations() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const date = dateFilter.value;
        const status = statusFilter.value;

        return examinations.filter(function (item) {
            const searchText = [
                item.code,
                item.patientCode,
                item.patientName,
                item.symptoms,
                item.diagnosis
            ].join(" ").toLocaleLowerCase("vi");

            return searchText.includes(keyword) &&
                (!date || item.date === date) &&
                (!status || item.status === status);
        });
    }

    function renderTable() {
        const list = getFilteredExaminations();

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="examination-empty">
                        <i class="bi bi-clipboard2-x"></i>
                        <div class="fw-semibold">Không tìm thấy phiếu khám</div>
                        <div class="small mt-1">
                            Thử thay đổi từ khóa hoặc bộ lọc.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = list.map(function (item) {
                return `
                    <tr>
                        <td>
                            <span class="examination-code">
                                ${escapeHTML(item.code)}
                            </span>
                            <span class="examination-patient-code">
                                ${escapeHTML(item.patientCode)}
                            </span>
                        </td>

                        <td>
                            <div class="examination-patient">
                                <div class="examination-avatar">
                                    ${escapeHTML(getInitials(item.patientName))}
                                </div>
                                <div>
                                    <span class="examination-patient-name">
                                        ${escapeHTML(item.patientName)}
                                    </span>
                                    <span class="examination-patient-code">
                                        ${escapeHTML(item.patientCode)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>${escapeHTML(formatDate(item.date))}</td>

                        <td>${escapeHTML(item.symptoms)}</td>

                        <td>${escapeHTML(item.diagnosis || "Chưa cập nhật")}</td>

                        <td>
                            <span class="examination-status ${getStatusClass(item.status)}">
                                <i class="bi ${getStatusIcon(item.status)}"></i>
                                ${escapeHTML(item.status)}
                            </span>
                        </td>

                        <td>
                            <div class="examination-actions">
                                <button type="button"
                                    class="examination-icon-btn"
                                    data-action="view"
                                    data-id="${item.id}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button"
                                    class="examination-icon-btn"
                                    data-action="edit"
                                    data-id="${item.id}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button type="button"
                                    class="examination-icon-btn delete"
                                    data-action="delete"
                                    data-id="${item.id}"
                                    title="Xóa phiếu khám"
                                    aria-label="Xóa phiếu khám">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + list.length + " / " + examinations.length + " phiếu khám";

        updateStatistics();
    }

    function findExam(id) {
        return examinations.find(function (item) {
            return item.id === Number(id);
        });
    }

    function openCreateForm() {
        formElement.reset();
        fields.id.value = "";
        fields.date.value = localDate;
        fields.status.value = "Chờ khám";
        document.getElementById("examFormTitle").textContent = "Tạo phiếu khám";
        formModal.show();
    }

    function openEditForm(item) {
        if (!item) return;

        detailModal.hide();
        formElement.reset();

        fields.id.value = item.id;
        fields.code.value = item.patientCode;
        fields.name.value = item.patientName;
        fields.date.value = item.date;
        fields.status.value = item.status;
        fields.symptoms.value = item.symptoms;
        fields.diagnosis.value = item.diagnosis;
        fields.treatment.value = item.treatment;
        fields.notes.value = item.notes;

        document.getElementById("examFormTitle").textContent =
            "Chỉnh sửa phiếu khám";

        formModal.show();
    }

    function renderDetail(item) {
        if (!item) return;

        selectedExamId = item.id;

        detailContent.innerHTML = `
            <div class="examination-detail-header">
                <div>
                    <div class="examination-detail-code">
                        ${escapeHTML(item.code)}
                    </div>
                    <div class="examination-detail-patient">
                        ${escapeHTML(item.patientName)}
                    </div>
                    <div class="examination-patient-code mt-2">
                        Mã bệnh nhân: ${escapeHTML(item.patientCode)}
                    </div>
                    <div class="examination-patient-code mt-1">
                        Ngày khám: ${escapeHTML(formatDate(item.date))}
                    </div>
                </div>

                <span class="examination-status ${getStatusClass(item.status)}">
                    <i class="bi ${getStatusIcon(item.status)}"></i>
                    ${escapeHTML(item.status)}
                </span>
            </div>

            <section class="examination-detail-section">
                <h6 class="examination-detail-title">
                    <i class="bi bi-clipboard2-pulse"></i>
                    Triệu chứng
                </h6>
                <div class="examination-detail-text">
                    ${escapeHTML(item.symptoms || "Chưa cập nhật")}
                </div>
            </section>

            <section class="examination-detail-section">
                <h6 class="examination-detail-title">
                    <i class="bi bi-search-heart"></i>
                    Chẩn đoán
                </h6>
                <div class="examination-detail-text">
                    ${escapeHTML(item.diagnosis || "Chưa cập nhật")}
                </div>
            </section>

            <section class="examination-detail-section">
                <h6 class="examination-detail-title">
                    <i class="bi bi-prescription2"></i>
                    Hướng điều trị
                </h6>
                <div class="examination-detail-text">
                    ${escapeHTML(item.treatment || "Chưa cập nhật")}
                </div>
            </section>

            <section class="examination-detail-section">
                <h6 class="examination-detail-title">
                    <i class="bi bi-journal-text"></i>
                    Ghi chú
                </h6>
                <div class="examination-detail-text">
                    ${escapeHTML(item.notes || "Không có ghi chú")}
                </div>
            </section>
        `;

        detailModal.show();
    }

    createButton.addEventListener("click", openCreateForm);

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const item = findExam(button.dataset.id);
        if (!item) return;

        const action = button.dataset.action;

        if (action === "view") {
            renderDetail(item);
        }

        if (action === "edit") {
            openEditForm(item);
        }

        if (action === "delete") {
            const confirmed = window.confirm(
                "Bạn có chắc chắn muốn xóa phiếu khám " + item.code + "?"
            );

            if (!confirmed) return;

            const index = examinations.findIndex(function (exam) {
                return exam.id === item.id;
            });

            if (index !== -1) {
                examinations.splice(index, 1);

                if (selectedExamId === item.id) {
                    selectedExamId = null;
                }

                renderTable();
                showToast("Đã xóa phiếu khám khỏi danh sách.");
            }
        }
    });

    formElement.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        const patientCode = fields.code.value.trim().toUpperCase();
        const patientName = fields.name.value.trim();

        if (!patientCode || !patientName) {
            showToast("Vui lòng nhập đầy đủ thông tin bệnh nhân.");
            return;
        }

        const editId = fields.id.value;

        const data = {
            patientCode: patientCode,
            patientName: patientName,
            date: fields.date.value,
            status: fields.status.value,
            symptoms: fields.symptoms.value.trim(),
            diagnosis: fields.diagnosis.value.trim(),
            treatment: fields.treatment.value.trim(),
            notes: fields.notes.value.trim()
        };

        if (editId) {
            const existing = findExam(editId);

            if (!existing) {
                showToast("Không tìm thấy phiếu khám cần chỉnh sửa.");
                return;
            }

            Object.assign(existing, data);
            showToast("Đã cập nhật phiếu khám.");
        } else {
            const dateCode = data.date.replace(/-/g, "");

            examinations.unshift({
                id: nextId++,
                code: "PK" + dateCode + "-" + String(nextId).padStart(3, "0"),
                ...data
            });

            showToast("Đã tạo phiếu khám mới.");
        }

        formModal.hide();
        renderTable();
    });

    editFromDetailButton.addEventListener("click", function () {
        const item = findExam(selectedExamId);
        if (item) openEditForm(item);
    });

    searchInput.addEventListener("input", renderTable);
    dateFilter.addEventListener("change", renderTable);
    statusFilter.addEventListener("change", renderTable);

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        dateFilter.value = "";
        statusFilter.value = "";
        renderTable();
    });

    renderTable();
})();

/* ================================
   MEDCARE - PRESCRIPTIONS
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("prescriptionTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("prescriptionSearch");
    const dateFilter = document.getElementById("prescriptionDateFilter");
    const statusFilter = document.getElementById("prescriptionStatusFilter");
    const resetButton = document.getElementById("resetPrescriptionFilters");
    const createButton = document.getElementById("createPrescriptionBtn");

    const totalElement = document.getElementById("prescriptionTotal");
    const pendingElement = document.getElementById("prescriptionPending");
    const dispensedElement = document.getElementById("prescriptionDispensed");
    const medicineTotalElement = document.getElementById("prescriptionMedicineTotal");
    const resultCount = document.getElementById("prescriptionResultCount");

    const formElement = document.getElementById("prescriptionForm");
    const formModalElement = document.getElementById("prescriptionFormModal");
    const detailModalElement = document.getElementById("prescriptionDetailModal");
    const medicineList = document.getElementById("prescriptionMedicineList");
    const detailContent = document.getElementById("prescriptionDetailContent");
    const editFromDetailButton = document.getElementById("editPrescriptionFromDetail");

    const toastElement = document.getElementById("prescriptionToast");
    const toastMessage = document.getElementById("prescriptionToastMessage");

    if (!window.bootstrap) {
        console.error("Bootstrap chưa được tải.");
        return;
    }

    const formModal = bootstrap.Modal.getOrCreateInstance(formModalElement);
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const fields = {
        id: document.getElementById("prescriptionEditId"),
        patientCode: document.getElementById("prescriptionPatientCode"),
        patientName: document.getElementById("prescriptionPatientName"),
        date: document.getElementById("prescriptionDate"),
        diagnosis: document.getElementById("prescriptionDiagnosis"),
        status: document.getElementById("prescriptionStatus"),
        instructions: document.getElementById("prescriptionInstructions")
    };

    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    let nextId = 4;
    let medicineRowId = 0;
    let selectedPrescriptionId = null;

    const prescriptions = [
        {
            id: 1,
            code: "DT20261020-001",
            patientCode: "BN001",
            patientName: "Nguyễn Thị Minh Châu",
            date: "2026-10-20",
            diagnosis: "Khám sức khỏe định kỳ",
            status: "Đã cấp thuốc",
            instructions: "Sử dụng thuốc theo chỉ định trên đơn và hướng dẫn của bác sĩ.",
            medicines: [
                {
                    name: "Vitamin tổng hợp",
                    strength: "Theo nhãn sản phẩm",
                    dosage: "Theo hướng dẫn",
                    frequency: "Theo hướng dẫn",
                    duration: "Theo chỉ định",
                    quantity: "1 hộp",
                    notes: "Kiểm tra thành phần và tiền sử dị ứng trước khi sử dụng."
                }
            ]
        },
        {
            id: 2,
            code: "DT20261022-001",
            patientCode: "BN002",
            patientName: "Trần Văn Hoàng",
            date: "2026-10-22",
            diagnosis: "Đang đánh giá triệu chứng đau đầu",
            status: "Chờ cấp thuốc",
            instructions: "Chỉ cấp thuốc sau khi bác sĩ hoàn tất đánh giá và xác nhận đơn.",
            medicines: [
                {
                    name: "Chưa xác định",
                    strength: "Chưa xác định",
                    dosage: "Chưa xác định",
                    frequency: "Chưa xác định",
                    duration: "Chưa xác định",
                    quantity: "Chưa xác định",
                    notes: "Cần bác sĩ hoàn tất chỉ định."
                }
            ]
        },
        {
            id: 3,
            code: "DT20261021-001",
            patientCode: "BN005",
            patientName: "Đỗ Ngọc Anh",
            date: "2026-10-21",
            diagnosis: "Tái khám",
            status: "Đã cấp thuốc",
            instructions: "Tuân thủ đơn thuốc đã được xác nhận.",
            medicines: [
                {
                    name: "Thuốc theo đơn tái khám",
                    strength: "Theo đơn đã xác nhận",
                    dosage: "Theo chỉ định",
                    frequency: "Theo chỉ định",
                    duration: "Theo chỉ định",
                    quantity: "Theo đơn",
                    notes: "Đối chiếu đơn thuốc gốc trước khi cấp."
                }
            ]
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function formatDate(value) {
        if (!value) return "Chưa cập nhật";

        const parts = value.split("-");
        return parts.length === 3
            ? parts[2] + "/" + parts[1] + "/" + parts[0]
            : value;
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function showToast(message) {
        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2600
        }).show();
    }

    function getStatusClass(status) {
        return status === "Đã cấp thuốc"
            ? "status-dispensed"
            : "status-pending";
    }

    function updateStatistics() {
        totalElement.textContent = prescriptions.length;

        pendingElement.textContent = prescriptions.filter(function (item) {
            return item.status === "Chờ cấp thuốc";
        }).length;

        dispensedElement.textContent = prescriptions.filter(function (item) {
            return item.status === "Đã cấp thuốc";
        }).length;

        const medicineNames = new Set();

        prescriptions.forEach(function (prescription) {
            prescription.medicines.forEach(function (medicine) {
                const name = medicine.name.trim();

                if (name && name !== "Chưa xác định" &&
                    name !== "Thuốc theo đơn tái khám") {
                    medicineNames.add(name.toLocaleLowerCase("vi"));
                }
            });
        });

        medicineTotalElement.textContent = medicineNames.size;
    }

    function getFilteredPrescriptions() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const date = dateFilter.value;
        const status = statusFilter.value;

        return prescriptions.filter(function (item) {
            const searchText = [
                item.code,
                item.patientCode,
                item.patientName,
                item.diagnosis
            ].join(" ").toLocaleLowerCase("vi");

            return searchText.includes(keyword) &&
                (!date || item.date === date) &&
                (!status || item.status === status);
        });
    }

    function renderTable() {
        const list = getFilteredPrescriptions();

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="prescription-empty">
                        <i class="bi bi-prescription2"></i>
                        <div class="fw-semibold">Không tìm thấy đơn thuốc</div>
                        <div class="small mt-1">
                            Hãy thử thay đổi từ khóa hoặc bộ lọc.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = list.map(function (item) {
                return `
                    <tr>
                        <td>
                            <span class="prescription-code">
                                ${escapeHTML(item.code)}
                            </span>
                        </td>

                        <td>
                            <div class="prescription-patient">
                                <div class="prescription-avatar">
                                    ${escapeHTML(getInitials(item.patientName))}
                                </div>
                                <div>
                                    <span class="prescription-patient-name">
                                        ${escapeHTML(item.patientName)}
                                    </span>
                                    <span class="prescription-patient-code">
                                        ${escapeHTML(item.patientCode)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>${escapeHTML(formatDate(item.date))}</td>

                        <td>${item.medicines.length} loại</td>

                        <td>${escapeHTML(item.diagnosis)}</td>

                        <td>
                            <span class="prescription-status ${getStatusClass(item.status)}">
                                <i class="bi ${
                                    item.status === "Đã cấp thuốc"
                                        ? "bi-check-circle-fill"
                                        : "bi-hourglass-split"
                                }"></i>
                                ${escapeHTML(item.status)}
                            </span>
                        </td>

                        <td>
                            <div class="prescription-actions">
                                <button type="button"
                                    class="prescription-icon-btn"
                                    data-action="view"
                                    data-id="${item.id}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button"
                                    class="prescription-icon-btn"
                                    data-action="edit"
                                    data-id="${item.id}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button type="button"
                                    class="prescription-icon-btn delete"
                                    data-action="delete"
                                    data-id="${item.id}"
                                    title="Xóa đơn thuốc"
                                    aria-label="Xóa đơn thuốc">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + list.length + " / " + prescriptions.length + " đơn thuốc";

        updateStatistics();
    }

    function findPrescription(id) {
        return prescriptions.find(function (item) {
            return item.id === Number(id);
        });
    }

    function addMedicineRow(medicine = {}) {
        medicineRowId++;

        const row = document.createElement("div");
        row.className = "prescription-medicine-row";
        row.dataset.medicineRowId = medicineRowId;

        row.innerHTML = `
            <div class="prescription-medicine-row-heading">
                <span class="prescription-medicine-row-title">
                    Thuốc ${medicineList.children.length + 1}
                </span>

                <button type="button" class="prescription-remove-medicine"
                    data-remove-medicine title="Xóa thuốc" aria-label="Xóa thuốc">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Tên thuốc</label>
                    <input type="text" class="form-control medicine-name"
                        placeholder="Nhập tên thuốc" required
                        value="${escapeHTML(medicine.name || "")}">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Hàm lượng / nồng độ</label>
                    <input type="text" class="form-control medicine-strength"
                        placeholder="Theo chỉ định chuyên môn"
                        value="${escapeHTML(medicine.strength || "")}">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Liều dùng</label>
                    <input type="text" class="form-control medicine-dosage"
                        placeholder="Nhập liều dùng đã xác định"
                        value="${escapeHTML(medicine.dosage || "")}" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Tần suất sử dụng</label>
                    <input type="text" class="form-control medicine-frequency"
                        placeholder="Theo chỉ định"
                        value="${escapeHTML(medicine.frequency || "")}" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Thời gian sử dụng</label>
                    <input type="text" class="form-control medicine-duration"
                        placeholder="Theo chỉ định"
                        value="${escapeHTML(medicine.duration || "")}" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Số lượng</label>
                    <input type="text" class="form-control medicine-quantity"
                        placeholder="Nhập số lượng"
                        value="${escapeHTML(medicine.quantity || "")}" required>
                </div>

                <div class="col-12">
                    <label class="form-label">Lưu ý sử dụng</label>
                    <input type="text" class="form-control medicine-notes"
                        placeholder="Lưu ý hoặc hướng dẫn bổ sung"
                        value="${escapeHTML(medicine.notes || "")}">
                </div>
            </div>
        `;

        medicineList.appendChild(row);
        updateMedicineRowTitles();
    }

    function updateMedicineRowTitles() {
        Array.from(medicineList.children).forEach(function (row, index) {
            const title = row.querySelector(".prescription-medicine-row-title");
            const removeButton = row.querySelector("[data-remove-medicine]");

            title.textContent = "Thuốc " + (index + 1);
            removeButton.disabled = medicineList.children.length <= 1;
        });
    }

    function collectMedicines() {
        return Array.from(medicineList.querySelectorAll(".prescription-medicine-row"))
            .map(function (row) {
                return {
                    name: row.querySelector(".medicine-name").value.trim(),
                    strength: row.querySelector(".medicine-strength").value.trim(),
                    dosage: row.querySelector(".medicine-dosage").value.trim(),
                    frequency: row.querySelector(".medicine-frequency").value.trim(),
                    duration: row.querySelector(".medicine-duration").value.trim(),
                    quantity: row.querySelector(".medicine-quantity").value.trim(),
                    notes: row.querySelector(".medicine-notes").value.trim()
                };
            });
    }

    function openCreateForm() {
        formElement.reset();
        fields.id.value = "";
        fields.date.value = localDate;
        fields.status.value = "Chờ cấp thuốc";

        medicineList.innerHTML = "";
        addMedicineRow();

        document.getElementById("prescriptionFormTitle").textContent =
            "Tạo đơn thuốc";

        formModal.show();
    }

    function openEditForm(item) {
        if (!item) return;

        detailModal.hide();
        formElement.reset();

        fields.id.value = item.id;
        fields.patientCode.value = item.patientCode;
        fields.patientName.value = item.patientName;
        fields.date.value = item.date;
        fields.diagnosis.value = item.diagnosis;
        fields.status.value = item.status;
        fields.instructions.value = item.instructions;

        medicineList.innerHTML = "";

        item.medicines.forEach(function (medicine) {
            addMedicineRow(medicine);
        });

        if (item.medicines.length === 0) {
            addMedicineRow();
        }

        document.getElementById("prescriptionFormTitle").textContent =
            "Chỉnh sửa đơn thuốc";

        formModal.show();
    }

    function renderDetail(item) {
        if (!item) return;

        selectedPrescriptionId = item.id;

        const medicineRows = item.medicines.map(function (medicine, index) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <span class="medicine-name">${escapeHTML(medicine.name)}</span>
                        <div class="prescription-patient-code">
                            ${escapeHTML(medicine.strength || "Chưa cập nhật")}
                        </div>
                    </td>
                    <td>${escapeHTML(medicine.dosage)}</td>
                    <td>${escapeHTML(medicine.frequency)}</td>
                    <td>${escapeHTML(medicine.duration)}</td>
                    <td>${escapeHTML(medicine.quantity)}</td>
                    <td>${escapeHTML(medicine.notes || "Không có")}</td>
                </tr>
            `;
        }).join("");

        detailContent.innerHTML = `
            <div class="prescription-detail-header">
                <div>
                    <div class="prescription-detail-code">
                        ${escapeHTML(item.code)}
                    </div>
                    <div class="prescription-detail-patient">
                        ${escapeHTML(item.patientName)}
                    </div>
                    <div class="prescription-patient-code mt-2">
                        Mã bệnh nhân: ${escapeHTML(item.patientCode)}
                    </div>
                    <div class="prescription-patient-code mt-1">
                        Ngày kê đơn: ${escapeHTML(formatDate(item.date))}
                    </div>
                    <div class="prescription-patient-code mt-1">
                        Chẩn đoán: ${escapeHTML(item.diagnosis)}
                    </div>
                </div>

                <span class="prescription-status ${getStatusClass(item.status)}">
                    <i class="bi ${
                        item.status === "Đã cấp thuốc"
                            ? "bi-check-circle-fill"
                            : "bi-hourglass-split"
                    }"></i>
                    ${escapeHTML(item.status)}
                </span>
            </div>

            <section class="prescription-detail-section">
                <h6 class="prescription-detail-title">
                    <i class="bi bi-capsule"></i>
                    Danh sách thuốc
                </h6>

                <div class="prescription-medicine-detail">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên thuốc</th>
                                <th>Liều dùng</th>
                                <th>Tần suất</th>
                                <th>Thời gian</th>
                                <th>Số lượng</th>
                                <th>Lưu ý</th>
                            </tr>
                        </thead>
                        <tbody>${medicineRows}</tbody>
                    </table>
                </div>
            </section>

            <section class="prescription-detail-section">
                <h6 class="prescription-detail-title">
                    <i class="bi bi-journal-text"></i>
                    Hướng dẫn chung
                </h6>
                <div class="prescription-detail-text">
                    ${escapeHTML(item.instructions || "Không có hướng dẫn bổ sung.")}
                </div>
            </section>
        `;

        detailModal.show();
    }

    createButton.addEventListener("click", openCreateForm);

    document.getElementById("addPrescriptionMedicine").addEventListener("click", function () {
        addMedicineRow();
    });

    medicineList.addEventListener("click", function (event) {
        const button = event.target.closest("[data-remove-medicine]");
        if (!button || medicineList.children.length <= 1) return;

        button.closest(".prescription-medicine-row").remove();
        updateMedicineRowTitles();
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const item = findPrescription(button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "view") {
            renderDetail(item);
        }

        if (button.dataset.action === "edit") {
            openEditForm(item);
        }

        if (button.dataset.action === "delete") {
            const confirmed = window.confirm(
                "Bạn có chắc chắn muốn xóa đơn thuốc " + item.code + "?"
            );

            if (!confirmed) return;

            const index = prescriptions.findIndex(function (prescription) {
                return prescription.id === item.id;
            });

            if (index !== -1) {
                prescriptions.splice(index, 1);

                if (selectedPrescriptionId === item.id) {
                    selectedPrescriptionId = null;
                }

                renderTable();
                showToast("Đã xóa đơn thuốc khỏi danh sách.");
            }
        }
    });

    formElement.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        const medicines = collectMedicines();

        if (medicines.length === 0 ||
            medicines.some(function (medicine) {
                return !medicine.name ||
                    !medicine.dosage ||
                    !medicine.frequency ||
                    !medicine.duration ||
                    !medicine.quantity;
            })) {
            showToast("Vui lòng hoàn thiện thông tin từng loại thuốc.");
            return;
        }

        const patientCode = fields.patientCode.value.trim().toUpperCase();
        const patientName = fields.patientName.value.trim();

        if (!patientCode || !patientName) {
            showToast("Vui lòng nhập đầy đủ thông tin bệnh nhân.");
            return;
        }

        const data = {
            patientCode: patientCode,
            patientName: patientName,
            date: fields.date.value,
            diagnosis: fields.diagnosis.value.trim(),
            status: fields.status.value,
            instructions: fields.instructions.value.trim(),
            medicines: medicines
        };

        const editId = fields.id.value;

        if (editId) {
            const existing = findPrescription(editId);

            if (!existing) {
                showToast("Không tìm thấy đơn thuốc cần chỉnh sửa.");
                return;
            }

            Object.assign(existing, data);
            showToast("Đã cập nhật đơn thuốc.");
        } else {
            const id = nextId++;
            const dateCode = data.date.replace(/-/g, "");

            prescriptions.unshift({
                id: id,
                code: "DT" + dateCode + "-" + String(id).padStart(3, "0"),
                ...data
            });

            showToast("Đã tạo đơn thuốc mới.");
        }

        formModal.hide();
        renderTable();
    });

    editFromDetailButton.addEventListener("click", function () {
        const item = findPrescription(selectedPrescriptionId);
        if (item) openEditForm(item);
    });

    searchInput.addEventListener("input", renderTable);
    dateFilter.addEventListener("change", renderTable);
    statusFilter.addEventListener("change", renderTable);

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        dateFilter.value = "";
        statusFilter.value = "";
        renderTable();
    });

    renderTable();
})();

/* ================================
   MEDCARE - DOCTOR WORK SCHEDULE
================================ */

(function () {
    "use strict";

    const tableBody = document.getElementById("scheduleTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("scheduleSearch");
    const dayFilter = document.getElementById("scheduleDayFilter");
    const shiftFilter = document.getElementById("scheduleShiftFilter");

    const totalElement = document.getElementById("scheduleTotal");
    const morningElement = document.getElementById("scheduleMorning");
    const afternoonElement = document.getElementById("scheduleAfternoon");
    const daysOffElement = document.getElementById("scheduleDaysOff");
    const resultCount = document.getElementById("scheduleResultCount");

    const weekGrid = document.getElementById("scheduleWeekGrid");
    const weekLabel = document.getElementById("scheduleWeekLabel");

    const form = document.getElementById("scheduleForm");
    const formModalElement = document.getElementById("scheduleFormModal");
    const formModal = bootstrap.Modal.getOrCreateInstance(formModalElement);

    const toastElement = document.getElementById("scheduleToast");
    const toastMessage = document.getElementById("scheduleToastMessage");

    const fields = {
        id: document.getElementById("scheduleEditId"),
        date: document.getElementById("scheduleDate"),
        start: document.getElementById("scheduleStart"),
        end: document.getElementById("scheduleEnd"),
        room: document.getElementById("scheduleRoom"),
        shift: document.getElementById("scheduleShift"),
        note: document.getElementById("scheduleNote")
    };

    const today = new Date();

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function addDays(date, amount) {
        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }

    function getMonday(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        const day = result.getDay();
        result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
        return result;
    }

    function formatDate(value) {
        if (!value) return "";
        const parts = value.split("-");
        return parts.length === 3
            ? parts[2] + "/" + parts[1] + "/" + parts[0]
            : value;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function getDayName(date) {
        if (date.getDay() === 0) return "Chủ Nhật";
        return "Thứ " + (date.getDay() + 1);
    }

    function inferShift(start) {
        const hour = Number(start.split(":")[0]);

        if (hour < 12) return "morning";
        if (hour < 18) return "afternoon";
        return "evening";
    }

    function shiftLabel(shift) {
        return {
            morning: "Ca sáng",
            afternoon: "Ca chiều",
            evening: "Ca tối"
        }[shift] || "Ca làm";
    }

    function shiftIcon(shift) {
        return {
            morning: "bi-sunrise",
            afternoon: "bi-sun",
            evening: "bi-moon-stars"
        }[shift] || "bi-clock";
    }

    function showToast(message) {
        toastMessage.textContent = message;
        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        }).show();
    }

    // Tạo lịch mẫu tương đối với ngày hiện tại.
    const schedules = [];
    let nextId = 1;

    for (let offset = -2; offset < 12; offset++) {
        const date = addDays(today, offset);
        const day = date.getDay();

        if (day === 0) continue;

        if ([1, 3, 5].includes(day)) {
            schedules.push({
                id: nextId++,
                date: dateKey(date),
                start: "07:30",
                end: "11:30",
                shift: "morning",
                room: "Phòng khám 101",
                note: "Khám bệnh theo lịch hẹn"
            });
        }

        if ([2, 4, 6].includes(day)) {
            schedules.push({
                id: nextId++,
                date: dateKey(date),
                start: "13:30",
                end: "17:00",
                shift: "afternoon",
                room: "Phòng khám 102",
                note: "Khám và tái khám"
            });
        }

        if (day === 5) {
            schedules.push({
                id: nextId++,
                date: dateKey(date),
                start: "18:00",
                end: "20:00",
                shift: "evening",
                room: "Phòng khám 201",
                note: "Ca khám buổi tối"
            });
        }
    }

    let weekStart = getMonday(today);

    function updateStatistics() {
        totalElement.textContent = schedules.length;

        morningElement.textContent = schedules.filter(function (item) {
            return item.shift === "morning";
        }).length;

        afternoonElement.textContent = schedules.filter(function (item) {
            return item.shift === "afternoon";
        }).length;

        const workingDays = new Set(schedules.map(function (item) {
            return item.date;
        }));

        daysOffElement.textContent = Array.from({ length: 7 }, function (_, i) {
            return dateKey(addDays(weekStart, i));
        }).filter(function (date) {
            return !workingDays.has(date);
        }).length;
    }

    function getFilteredSchedules() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const day = dayFilter.value;
        const shift = shiftFilter.value;

        return schedules.filter(function (item) {
            const date = new Date(item.date + "T12:00:00");

            const searchText = (
                item.room + " " + item.note + " " + item.date
            ).toLocaleLowerCase("vi");

            return searchText.includes(keyword) &&
                (day === "" || String(date.getDay()) === day) &&
                (!shift || item.shift === shift);
        }).sort(function (a, b) {
            return a.date.localeCompare(b.date) ||
                a.start.localeCompare(b.start);
        });
    }

    function renderCalendar() {
        const endDate = addDays(weekStart, 6);

        weekLabel.textContent =
            "Từ " + formatDate(dateKey(weekStart)) +
            " đến " + formatDate(dateKey(endDate));

        const weekdays = ["morning", "afternoon", "evening"];

        weekGrid.innerHTML = Array.from({ length: 7 }, function (_, index) {
            const date = addDays(weekStart, index);
            const key = dateKey(date);
            const isToday = key === dateKey(today);

            const daySchedules = schedules.filter(function (item) {
                return item.date === key;
            }).sort(function (a, b) {
                return a.start.localeCompare(b.start);
            });

            let eventsHTML = "";

            if (daySchedules.length) {
                eventsHTML = daySchedules.map(function (item) {
                    return `
                        <div class="schedule-event ${escapeHTML(
                            weekdays.includes(item.shift) ? item.shift : "morning"
                        )}"
                            data-calendar-id="${item.id}"
                            role="button"
                            tabindex="0"
                            title="Nhấn để chỉnh sửa lịch">
                            <span class="schedule-event-time">
                                ${escapeHTML(item.start)} - ${escapeHTML(item.end)}
                            </span>
                            <span class="schedule-event-room">
                                ${escapeHTML(item.room)}
                            </span>
                        </div>
                    `;
                }).join("");
            } else {
                eventsHTML = '<div class="schedule-no-event">Ngày nghỉ</div>';
            }

            return `
                <div class="schedule-day-column ${isToday ? "is-today" : ""}">
                    <div class="schedule-day-header">
                        <span class="schedule-day-name">${getDayName(date)}</span>
                        <span class="schedule-day-number">${date.getDate()}</span>
                    </div>
                    <div class="schedule-day-content">${eventsHTML}</div>
                </div>
            `;
        }).join("");
    }

    function renderTable() {
        const list = getFilteredSchedules();

        if (!list.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="schedule-empty">
                        <i class="bi bi-calendar-x"></i>
                        <div class="fw-semibold">Không tìm thấy lịch làm việc</div>
                        <div class="small mt-1">Thử thay đổi bộ lọc hoặc thêm lịch mới.</div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = list.map(function (item) {
                const date = new Date(item.date + "T12:00:00");

                return `
                    <tr>
                        <td>
                            <span class="schedule-date-main">${getDayName(date)}</span>
                            <span class="schedule-date-sub">${formatDate(item.date)}</span>
                        </td>
                        <td>
                            <span class="schedule-time">
                                ${escapeHTML(item.start)} - ${escapeHTML(item.end)}
                            </span>
                        </td>
                        <td>
                            <span class="schedule-shift ${escapeHTML(item.shift)}">
                                <i class="bi ${shiftIcon(item.shift)}"></i>
                                ${shiftLabel(item.shift)}
                            </span>
                        </td>
                        <td><span class="schedule-room">${escapeHTML(item.room)}</span></td>
                        <td>${escapeHTML(item.note || "—")}</td>
                        <td>
                            <div class="schedule-row-actions">
                                <button type="button" class="schedule-action-btn"
                                    data-action="edit" data-id="${item.id}"
                                    title="Chỉnh sửa" aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button type="button" class="schedule-action-btn delete"
                                    data-action="delete" data-id="${item.id}"
                                    title="Xóa lịch" aria-label="Xóa lịch">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        resultCount.textContent =
            "Hiển thị " + list.length + " / " + schedules.length + " ca làm việc";

        updateStatistics();
    }

    function renderAll() {
        renderCalendar();
        renderTable();
    }

    function findSchedule(id) {
        return schedules.find(function (item) {
            return item.id === Number(id);
        });
    }

    function openForm(item) {
        form.reset();

        if (item) {
            fields.id.value = item.id;
            fields.date.value = item.date;
            fields.start.value = item.start;
            fields.end.value = item.end;
            fields.room.value = item.room;
            fields.shift.value = item.shift;
            fields.note.value = item.note || "";

            document.getElementById("scheduleFormTitle").textContent =
                "Chỉnh sửa lịch làm việc";
        } else {
            fields.id.value = "";
            fields.date.value = dateKey(today);
            fields.start.value = "07:30";
            fields.end.value = "11:30";
            fields.room.value = "";
            fields.shift.value = "morning";
            fields.note.value = "";

            document.getElementById("scheduleFormTitle").textContent =
                "Thêm lịch làm việc";
        }

        formModal.show();
    }

    document.getElementById("addWorkSchedule").addEventListener("click", function () {
        openForm(null);
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const item = findSchedule(button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "edit") {
            openForm(item);
        }

        if (button.dataset.action === "delete") {
            if (!window.confirm("Bạn có chắc muốn xóa lịch làm việc này?")) return;

            const index = schedules.findIndex(function (schedule) {
                return schedule.id === item.id;
            });

            if (index !== -1) {
                schedules.splice(index, 1);
                renderAll();
                showToast("Đã xóa lịch làm việc.");
            }
        }
    });

    weekGrid.addEventListener("click", function (event) {
        const eventCard = event.target.closest("[data-calendar-id]");
        if (!eventCard) return;

        const item = findSchedule(eventCard.dataset.calendarId);
        if (item) openForm(item);
    });

    weekGrid.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;

        const eventCard = event.target.closest("[data-calendar-id]");
        if (!eventCard) return;

        event.preventDefault();

        const item = findSchedule(eventCard.dataset.calendarId);
        if (item) openForm(item);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (fields.end.value <= fields.start.value) {
            fields.end.setCustomValidity("Giờ kết thúc phải sau giờ bắt đầu.");
            fields.end.reportValidity();
            fields.end.setCustomValidity("");
            return;
        }

        const data = {
            date: fields.date.value,
            start: fields.start.value,
            end: fields.end.value,
            room: fields.room.value,
            shift: fields.shift.value,
            note: fields.note.value.trim()
        };

        // Kiểm tra trùng giờ cùng phòng khám.
        const editId = Number(fields.id.value);

        const conflict = schedules.some(function (item) {
            if (item.id === editId) return false;
            if (item.date !== data.date || item.room !== data.room) return false;

            return data.start < item.end && data.end > item.start;
        });

        if (conflict) {
            showToast("Khung giờ này đã có lịch tại phòng khám đã chọn.");
            return;
        }

        if (editId) {
            const existing = findSchedule(editId);

            if (!existing) {
                showToast("Không tìm thấy lịch cần chỉnh sửa.");
                return;
            }

            Object.assign(existing, data);
            showToast("Đã cập nhật lịch làm việc.");
        } else {
            schedules.push({
                id: nextId++,
                ...data
            });
            showToast("Đã thêm lịch làm việc.");
        }

        weekStart = getMonday(new Date(data.date + "T12:00:00"));
        formModal.hide();
        renderAll();
    });

    searchInput.addEventListener("input", renderTable);
    dayFilter.addEventListener("change", renderTable);
    shiftFilter.addEventListener("change", renderTable);

    document.getElementById("resetScheduleFilters").addEventListener("click", function () {
        searchInput.value = "";
        dayFilter.value = "";
        shiftFilter.value = "";
        renderTable();
    });

    document.getElementById("schedulePrevWeek").addEventListener("click", function () {
        weekStart = addDays(weekStart, -7);
        renderAll();
    });

    document.getElementById("scheduleNextWeek").addEventListener("click", function () {
        weekStart = addDays(weekStart, 7);
        renderAll();
    });

    document.getElementById("scheduleToday").addEventListener("click", function () {
        weekStart = getMonday(today);
        renderAll();
    });

    renderAll();
})();
