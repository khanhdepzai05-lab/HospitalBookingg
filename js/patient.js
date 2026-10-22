
/* ==========================================
   PATIENT - TỔNG QUAN
========================================== */

(() => {
    const tableBody = document.getElementById("patientUpcomingTableBody");

    // Chỉ chạy trên trang tổng quan bệnh nhân
    if (!tableBody) return;

    const searchInput = document.getElementById("patientAppointmentSearch");
    const statusFilter = document.getElementById("patientAppointmentStatus");
    const resultCount = document.getElementById("patientUpcomingResultCount");

    const totalElement = document.getElementById("patientTotalAppointments");
    const upcomingElement = document.getElementById("patientUpcomingAppointments");
    const completedElement = document.getElementById("patientCompletedAppointments");
    const prescriptionElement = document.getElementById("patientPrescriptionCount");

    const appointments = [
        {
            code: "LH20261025001",
            doctor: "Nguyễn Hoàng Nam",
            specialty: "Tim mạch",
            date: "2026-10-25",
            time: "08:00",
            status: "confirmed"
        },
        {
            code: "LH20261028002",
            doctor: "Trần Ngọc Hà",
            specialty: "Nội tổng quát",
            date: "2026-10-28",
            time: "09:30",
            status: "pending"
        },
        {
            code: "LH20261030003",
            doctor: "Phạm Minh Tuấn",
            specialty: "Nhi khoa",
            date: "2026-10-30",
            time: "14:00",
            status: "confirmed"
        }
    ];

    const completedCount = 6;
    const prescriptionCount = 2;

    const statusLabels = {
        confirmed: "Đã xác nhận",
        pending: "Chờ xác nhận"
    };

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(dateString) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
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

    function getToday() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
    }

    function getUpcomingAppointments() {
        const today = getToday();

        return appointments.filter(appointment => {
            const appointmentDate = new Date(`${appointment.date}T00:00:00`);

            return appointmentDate >= today &&
                ["confirmed", "pending"].includes(appointment.status);
        });
    }

    function updateStatistics() {
        const upcoming = getUpcomingAppointments();

        if (totalElement) {
            totalElement.textContent = appointments.length + completedCount;
        }

        if (upcomingElement) {
            upcomingElement.textContent = upcoming.length;
        }

        if (completedElement) {
            completedElement.textContent = completedCount;
        }

        if (prescriptionElement) {
            prescriptionElement.textContent = prescriptionCount;
        }
    }

    function renderAppointments() {
        const keyword = (searchInput?.value || "")
            .trim()
            .toLocaleLowerCase("vi");

        const selectedStatus = statusFilter?.value || "";

        const filteredAppointments = getUpcomingAppointments().filter(appointment => {
            const searchContent = [
                appointment.code,
                appointment.doctor,
                appointment.specialty
            ].join(" ").toLocaleLowerCase("vi");

            return searchContent.includes(keyword) &&
                (!selectedStatus || appointment.status === selectedStatus);
        });

        if (filteredAppointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="patient-overview-empty">
                        <i class="bi bi-calendar-x"></i>
                        Không tìm thấy lịch hẹn phù hợp.
                    </td>
                </tr>
            `;

            if (resultCount) {
                resultCount.textContent = "Không có lịch hẹn phù hợp";
            }

            return;
        }

        tableBody.innerHTML = filteredAppointments.map(appointment => {
            const statusClass = appointment.status;
            const statusLabel = statusLabels[appointment.status] || "Chưa xác định";

            return `
                <tr>
                    <td>
                        <span class="patient-overview-code">
                            ${escapeHTML(appointment.code)}
                        </span>
                    </td>

                    <td>
                        <div class="patient-overview-doctor">
                            <div class="patient-overview-doctor-avatar">
                                ${escapeHTML(getInitials(appointment.doctor))}
                            </div>

                            <div class="patient-overview-doctor-info">
                                <span class="patient-overview-doctor-name">
                                    ${escapeHTML(appointment.doctor)}
                                </span>
                                <span class="patient-overview-doctor-specialty">
                                    ${escapeHTML(appointment.specialty)}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="patient-overview-date">
                            ${formatDate(appointment.date)}
                        </span>
                    </td>

                    <td>
                        <span class="patient-overview-time">
                            ${escapeHTML(appointment.time)}
                        </span>
                    </td>

                    <td>
                        <span class="patient-overview-status ${statusClass}">
                            ${statusLabel}
                        </span>
                    </td>

                    <td class="text-end">
                        <a
                            href="lich-hen.html"
                            class="patient-overview-action"
                            title="Xem lịch hẹn"
                            aria-label="Xem lịch hẹn"
                        >
                            <i class="bi bi-eye"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join("");

        if (resultCount) {
            resultCount.textContent =
                `Đang hiển thị ${filteredAppointments.length} lịch hẹn`;
        }
    }

    searchInput?.addEventListener("input", renderAppointments);
    statusFilter?.addEventListener("change", renderAppointments);

    updateStatistics();
    renderAppointments();
})();

/* ==========================================
   PATIENT - LỊCH HẸN CỦA TÔI
========================================== */

(() => {
    const tableBody = document.getElementById("myAppointmentTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("myAppointmentSearch");
    const statusFilter = document.getElementById("myAppointmentStatusFilter");
    const dateFilter = document.getElementById("myAppointmentDateFilter");
    const resetButton = document.getElementById("resetMyAppointmentFilters");
    const resultCount = document.getElementById("myAppointmentResultCount");

    const totalElement = document.getElementById("myAppointmentTotal");
    const pendingElement = document.getElementById("myAppointmentPending");
    const confirmedElement = document.getElementById("myAppointmentConfirmed");
    const completedElement = document.getElementById("myAppointmentCompleted");

    const detailModalElement = document.getElementById("myAppointmentDetailModal");
    const detailContent = document.getElementById("myAppointmentDetailContent");
    const toastElement = document.getElementById("myAppointmentToast");
    const toastMessage = document.getElementById("myAppointmentToastMessage");

    const appointments = [
        {
            code: "LH20261025001",
            doctor: "Nguyễn Hoàng Nam",
            specialty: "Tim mạch",
            date: "2026-10-25",
            time: "08:00",
            reason: "Khám sức khỏe định kỳ",
            status: "confirmed",
            phone: "028 3822 1234",
            room: "Phòng khám 201"
        },
        {
            code: "LH20261028002",
            doctor: "Trần Ngọc Hà",
            specialty: "Nội tổng quát",
            date: "2026-10-28",
            time: "09:30",
            reason: "Tư vấn sức khỏe",
            status: "pending",
            phone: "028 3822 1235",
            room: "Đang cập nhật"
        },
        {
            code: "LH20261030003",
            doctor: "Phạm Minh Tuấn",
            specialty: "Nhi khoa",
            date: "2026-10-30",
            time: "14:00",
            reason: "Tái khám",
            status: "confirmed",
            phone: "028 3822 1236",
            room: "Phòng khám 105"
        },
        {
            code: "LH20261015004",
            doctor: "Lê Minh Quân",
            specialty: "Da liễu",
            date: "2026-10-15",
            time: "10:00",
            reason: "Khám da liễu",
            status: "completed",
            phone: "028 3822 1237",
            room: "Phòng khám 302"
        },
        {
            code: "LH20261010005",
            doctor: "Võ Thanh Hùng",
            specialty: "Răng hàm mặt",
            date: "2026-10-10",
            time: "15:00",
            reason: "Kiểm tra răng định kỳ",
            status: "cancelled",
            phone: "028 3822 1238",
            room: "Phòng khám 108"
        }
    ];

    const statusInfo = {
        pending: {
            label: "Chờ xác nhận",
            className: "pending"
        },
        confirmed: {
            label: "Đã xác nhận",
            className: "confirmed"
        },
        completed: {
            label: "Đã hoàn thành",
            className: "completed"
        },
        cancelled: {
            label: "Đã hủy",
            className: "cancelled"
        }
    };

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(value) {
        const [year, month, day] = value.split("-");
        return `${day}/${month}/${year}`;
    }

    function initials(name) {
        return name.trim()
            .split(/\s+/)
            .slice(-2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function updateStatistics() {
        totalElement.textContent = appointments.length;
        pendingElement.textContent = appointments.filter(item => item.status === "pending").length;
        confirmedElement.textContent = appointments.filter(item => item.status === "confirmed").length;
        completedElement.textContent = appointments.filter(item => item.status === "completed").length;
    }

    function showToast(message) {
        if (!toastElement || !toastMessage || !window.bootstrap) {
            window.alert(message);
            return;
        }

        toastMessage.textContent = message;
        bootstrap.Toast.getOrCreateInstance(toastElement).show();
    }

    function renderAppointments() {
        const keyword = (searchInput?.value || "").trim().toLocaleLowerCase("vi");
        const selectedStatus = statusFilter?.value || "";
        const selectedDate = dateFilter?.value || "";

        const filtered = appointments.filter(item => {
            const searchable = [
                item.code,
                item.doctor,
                item.specialty,
                item.reason
            ].join(" ").toLocaleLowerCase("vi");

            return searchable.includes(keyword) &&
                (!selectedStatus || item.status === selectedStatus) &&
                (!selectedDate || item.date === selectedDate);
        });

        if (!filtered.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="patient-appointment-empty">
                        <i class="bi bi-calendar-x"></i>
                        Không tìm thấy lịch hẹn phù hợp với điều kiện tìm kiếm.
                    </td>
                </tr>
            `;

            resultCount.textContent = "Không có lịch hẹn phù hợp";
            return;
        }

        tableBody.innerHTML = filtered.map(item => {
            const status = statusInfo[item.status];
            const canCancel = ["pending", "confirmed"].includes(item.status);

            return `
                <tr>
                    <td>
                        <span class="patient-appointment-code">${escapeHTML(item.code)}</span>
                    </td>

                    <td>
                        <div class="patient-appointment-doctor">
                            <div class="patient-appointment-doctor-avatar">
                                ${escapeHTML(initials(item.doctor))}
                            </div>
                            <div class="patient-appointment-doctor-info">
                                <span class="patient-appointment-doctor-name">
                                    ${escapeHTML(item.doctor)}
                                </span>
                                <span class="patient-appointment-doctor-specialty">
                                    ${escapeHTML(item.specialty)}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td>${formatDate(item.date)}</td>
                    <td>${escapeHTML(item.time)}</td>
                    <td>${escapeHTML(item.reason)}</td>

                    <td>
                        <span class="patient-appointment-status ${status.className}">
                            ${status.label}
                        </span>
                    </td>

                    <td class="text-end">
                        <div class="patient-appointment-actions">
                            <button
                                type="button"
                                class="patient-appointment-action"
                                data-action="detail"
                                data-code="${escapeHTML(item.code)}"
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết"
                            >
                                <i class="bi bi-eye"></i>
                            </button>

                            ${canCancel ? `
                                <button
                                    type="button"
                                    class="patient-appointment-action cancel"
                                    data-action="cancel"
                                    data-code="${escapeHTML(item.code)}"
                                    title="Hủy lịch hẹn"
                                    aria-label="Hủy lịch hẹn"
                                >
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        resultCount.textContent = `Hiển thị ${filtered.length}/${appointments.length} lịch hẹn`;
    }

    function showDetails(code) {
        const item = appointments.find(appointment => appointment.code === code);
        if (!item || !detailContent || !detailModalElement) return;

        const status = statusInfo[item.status];

        detailContent.innerHTML = `
            <div class="patient-appointment-detail-list">
                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Mã lịch hẹn</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.code)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Trạng thái</span>
                    <div>
                        <span class="patient-appointment-status ${status.className}">
                            ${status.label}
                        </span>
                    </div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Bác sĩ</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.doctor)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Chuyên khoa</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.specialty)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Ngày khám</span>
                    <div class="patient-appointment-detail-value">${formatDate(item.date)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Giờ khám</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.time)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Lý do khám</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.reason)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Phòng khám</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.room)}</div>
                </div>

                <div class="patient-appointment-detail-item">
                    <span class="patient-appointment-detail-label">Liên hệ cơ sở y tế</span>
                    <div class="patient-appointment-detail-value">${escapeHTML(item.phone)}</div>
                </div>
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(detailModalElement).show();
    }

    function cancelAppointment(code) {
        const item = appointments.find(appointment => appointment.code === code);
        if (!item || !["pending", "confirmed"].includes(item.status)) return;

        const accepted = window.confirm(
            `Bạn có chắc muốn hủy lịch hẹn ${item.code} không?`
        );

        if (!accepted) return;

        item.status = "cancelled";
        updateStatistics();
        renderAppointments();
        showToast("Lịch hẹn đã được cập nhật trạng thái hủy.");
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const code = button.dataset.code;

        if (button.dataset.action === "detail") {
            showDetails(code);
        } else if (button.dataset.action === "cancel") {
            cancelAppointment(code);
        }
    });

    searchInput?.addEventListener("input", renderAppointments);
    statusFilter?.addEventListener("change", renderAppointments);
    dateFilter?.addEventListener("change", renderAppointments);

    resetButton?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "";
        if (dateFilter) dateFilter.value = "";

        renderAppointments();
    });

    updateStatistics();
    renderAppointments();
})();

/* =========================================
   PATIENT - LỊCH SỬ KHÁM BỆNH
========================================= */
(() => {
    const tableBody = document.getElementById("patientHistoryTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("patientHistorySearch");
    const specialtySelect = document.getElementById("patientHistorySpecialty");
    const yearSelect = document.getElementById("patientHistoryYear");
    const resetBtn = document.getElementById("patientHistoryResetBtn");
    const exportBtn = document.getElementById("patientHistoryExportBtn");
    const emptyState = document.getElementById("patientHistoryEmpty");
    const resultCount = document.getElementById("patientHistoryResultCount");
    const prevBtn = document.getElementById("patientHistoryPrev");
    const nextBtn = document.getElementById("patientHistoryNext");
    const pageInfo = document.getElementById("patientHistoryPageInfo");
    const detailModal = document.getElementById("patientHistoryDetailModal");
    const detailContent = document.getElementById("patientHistoryDetailContent");
    const toast = document.getElementById("patientHistoryToast");

    const pageSize = 5;
    let currentPage = 1;
    let toastTimer;

    const records = [
        {
            id: "MC-2026-018",
            date: "2026-10-12",
            doctor: "BS. Trần Hoàng Nam",
            specialty: "Nội tổng quát",
            diagnosis: "Viêm họng cấp",
            status: "completed",
            symptoms: "Đau họng, ho khan và cảm giác mệt mỏi.",
            conclusion: "Đã hoàn thành thăm khám và được tư vấn theo dõi triệu chứng.",
            advice: "Nghỉ ngơi hợp lý, uống đủ nước và tuân thủ hướng dẫn chuyên môn.",
            followUp: "2026-10-26"
        },
        {
            id: "MC-2026-014",
            date: "2026-09-24",
            doctor: "BS. Nguyễn Thu Hà",
            specialty: "Da liễu",
            diagnosis: "Viêm da kích ứng",
            status: "completed",
            symptoms: "Da xuất hiện vùng đỏ và ngứa nhẹ.",
            conclusion: "Đã hoàn thành thăm khám và được hướng dẫn chăm sóc da.",
            advice: "Hạn chế tiếp xúc với yếu tố gây kích ứng và thực hiện theo chỉ định.",
            followUp: "2026-10-24"
        },
        {
            id: "MC-2026-009",
            date: "2026-08-16",
            doctor: "BS. Lê Minh Tuấn",
            specialty: "Tim mạch",
            diagnosis: "Theo dõi sức khỏe tim mạch",
            status: "completed",
            symptoms: "Khám định kỳ, đôi lúc cảm thấy hồi hộp.",
            conclusion: "Đã thực hiện thăm khám và tư vấn theo dõi sức khỏe.",
            advice: "Duy trì lịch sinh hoạt điều độ và tái khám theo lịch hẹn.",
            followUp: "Chưa có lịch tái khám"
        },
        {
            id: "MC-2026-005",
            date: "2026-07-09",
            doctor: "BS. Phạm Ngọc Lan",
            specialty: "Tai Mũi Họng",
            diagnosis: "Viêm mũi dị ứng",
            status: "completed",
            symptoms: "Hắt hơi và nghẹt mũi theo từng đợt.",
            conclusion: "Đã hoàn thành thăm khám và được tư vấn theo dõi các triệu chứng.",
            advice: "Hạn chế tiếp xúc với tác nhân gây dị ứng và tuân thủ hướng dẫn bác sĩ.",
            followUp: "Chưa có lịch tái khám"
        },
        {
            id: "MC-2025-032",
            date: "2025-12-18",
            doctor: "BS. Trần Hoàng Nam",
            specialty: "Nội tổng quát",
            diagnosis: "Khám sức khỏe định kỳ",
            status: "completed",
            symptoms: "Khám tổng quát theo nhu cầu cá nhân.",
            conclusion: "Đã hoàn thành buổi khám sức khỏe định kỳ.",
            advice: "Duy trì chế độ sinh hoạt lành mạnh và khám định kỳ.",
            followUp: "Theo lịch khám định kỳ"
        },
        {
            id: "MC-2025-026",
            date: "2025-10-03",
            doctor: "BS. Nguyễn Thu Hà",
            specialty: "Da liễu",
            diagnosis: "Kiểm tra tình trạng da",
            status: "completed",
            symptoms: "Khám và đánh giá tình trạng da.",
            conclusion: "Đã hoàn thành thăm khám và được hướng dẫn chăm sóc da.",
            advice: "Theo dõi tình trạng da và tái khám khi cần thiết.",
            followUp: "Chưa có lịch tái khám"
        },
        {
            id: "MC-2025-019",
            date: "2025-07-21",
            doctor: "BS. Đỗ Quang Huy",
            specialty: "Nhi khoa",
            diagnosis: "Tư vấn sức khỏe",
            status: "completed",
            symptoms: "Khám và tư vấn sức khỏe.",
            conclusion: "Đã hoàn thành buổi tư vấn sức khỏe.",
            advice: "Thực hiện theo hướng dẫn chuyên môn đã được cung cấp.",
            followUp: "Chưa có lịch tái khám"
        },
        {
            id: "MC-2025-011",
            date: "2025-04-15",
            doctor: "BS. Lê Minh Tuấn",
            specialty: "Tim mạch",
            diagnosis: "Khám sức khỏe định kỳ",
            status: "completed",
            symptoms: "Khám kiểm tra sức khỏe định kỳ.",
            conclusion: "Đã hoàn thành thăm khám và được hướng dẫn theo dõi sức khỏe.",
            advice: "Tái khám theo lịch được tư vấn.",
            followUp: "Theo lịch khám định kỳ"
        }
    ];

    const statusLabels = {
        completed: "Đã hoàn thành",
        cancelled: "Đã hủy",
        pending: "Đang xử lý"
    };

    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

    function formatDate(value) {
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "Chưa có thông tin";
        const [year, month, day] = value.split("-");
        return `${day}/${month}/${year}`;
    }

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function populateYears() {
        const years = [...new Set(records.map(item => item.date.slice(0, 4)))]
            .sort((a, b) => Number(b) - Number(a));

        years.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    function getFilteredRecords() {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        const specialty = specialtySelect.value;
        const year = yearSelect.value;

        return records
            .filter(record => {
                const searchable = [
                    record.id,
                    record.doctor,
                    record.specialty,
                    record.diagnosis
                ].join(" ").toLocaleLowerCase("vi");

                return (!keyword || searchable.includes(keyword))
                    && (!specialty || record.specialty === specialty)
                    && (!year || record.date.startsWith(year));
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function renderStats() {
        document.getElementById("patientHistoryTotal").textContent = records.length;

        document.getElementById("patientHistoryCompleted").textContent =
            records.filter(record => record.status === "completed").length;

        document.getElementById("patientHistoryDoctors").textContent =
            new Set(records.map(record => record.doctor)).size;
    }

    function renderTable() {
        const filtered = getFilteredRecords();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * pageSize;
        const visible = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = visible.map(record => {
            const statusClass = record.status || "completed";
            const initials = record.doctor
                .replace(/^BS\.\s*/i, "")
                .split(/\s+/)
                .filter(Boolean)
                .slice(-2)
                .map(word => word[0])
                .join("")
                .toUpperCase();

            return `
                <tr>
                    <td>
                        <span class="patient-history-code">${escapeHTML(record.id)}</span>
                    </td>
                    <td>
                        <span class="patient-history-date">${formatDate(record.date)}</span>
                    </td>
                    <td>
                        <div class="patient-history-doctor">
                            <div class="patient-history-doctor-avatar">${escapeHTML(initials)}</div>
                            <div>
                                <strong>${escapeHTML(record.doctor)}</strong>
                                <small>Bác sĩ phụ trách</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="patient-history-specialty">${escapeHTML(record.specialty)}</span>
                    </td>
                    <td>
                        <div class="patient-history-diagnosis">${escapeHTML(record.diagnosis)}</div>
                    </td>
                    <td>
                        <span class="patient-history-status ${escapeHTML(statusClass)}">
                            <i class="bi bi-check-circle-fill"></i>
                            ${escapeHTML(statusLabels[statusClass] || "Đã hoàn thành")}
                        </span>
                    </td>
                    <td>
                        <div class="patient-history-actions">
                            <button type="button" data-history-detail="${escapeHTML(record.id)}"
                                    title="Xem chi tiết" aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        const tableContainer = tableBody.closest(".table-responsive");
        tableContainer.classList.toggle("d-none", filtered.length === 0);
        emptyState.classList.toggle("d-none", filtered.length !== 0);

        resultCount.textContent = filtered.length
            ? `Hiển thị ${start + 1}–${Math.min(start + pageSize, filtered.length)} trong ${filtered.length} lần khám`
            : "Hiển thị 0 lần khám";

        pageInfo.textContent = `Trang ${currentPage}/${totalPages}`;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    }

    function showDetails(id) {
        const record = records.find(item => item.id === id);
        if (!record) return;

        const fields = [
            ["Mã lần khám", record.id],
            ["Ngày khám", formatDate(record.date)],
            ["Bác sĩ phụ trách", record.doctor],
            ["Chuyên khoa", record.specialty],
            ["Trạng thái", statusLabels[record.status] || "Đã hoàn thành"],
            ["Chẩn đoán", record.diagnosis],
            ["Triệu chứng / Lý do khám", record.symptoms],
            ["Kết luận sau khám", record.conclusion],
            ["Hướng dẫn của bác sĩ", record.advice],
            ["Lịch tái khám", record.followUp.includes("-") ? formatDate(record.followUp) : record.followUp]
        ];

        detailContent.innerHTML = `
            <div class="patient-history-detail-grid">
                ${fields.map(([label, value], index) => `
                    <div class="patient-history-detail-item ${index >= 6 ? "full" : ""}">
                        <span class="detail-label">${escapeHTML(label)}</span>
                        <strong>${escapeHTML(value)}</strong>
                    </div>
                `).join("")}
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(detailModal).show();
    }

    function exportCSV() {
        const filtered = getFilteredRecords();

        if (!filtered.length) {
            showToast("Không có dữ liệu để xuất.");
            return;
        }

        const headers = [
            "Mã khám", "Ngày khám", "Bác sĩ", "Chuyên khoa",
            "Chẩn đoán", "Trạng thái", "Triệu chứng",
            "Kết luận", "Hướng dẫn", "Lịch tái khám"
        ];

        const csvCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

        const rows = filtered.map(record => [
            record.id,
            formatDate(record.date),
            record.doctor,
            record.specialty,
            record.diagnosis,
            statusLabels[record.status] || "Đã hoàn thành",
            record.symptoms,
            record.conclusion,
            record.advice,
            record.followUp.includes("-") ? formatDate(record.followUp) : record.followUp
        ]);

        const csv = "\uFEFF" + [headers, ...rows]
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

        const url = URL.createObjectURL(
            new Blob([csv], { type: "text/csv;charset=utf-8;" })
        );

        const link = document.createElement("a");
        link.href = url;
        link.download = "lich-su-kham-benh.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showToast("Đã xuất danh sách lịch sử khám.");
    }

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable();
    });

    specialtySelect.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    yearSelect.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        specialtySelect.value = "";
        yearSelect.value = "";
        currentPage = 1;
        renderTable();
    });

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredRecords().length / pageSize));

        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-history-detail]");
        if (button) showDetails(button.dataset.historyDetail);
    });

    exportBtn.addEventListener("click", exportCSV);

    populateYears();
    renderStats();
    renderTable();
})();

/* ==========================================
   KẾT QUẢ KHÁM BỆNH - PATIENT
========================================== */
(() => {
    const tableBody = document.getElementById("patientResultsTableBody");

    // Chỉ chạy ở trang kết quả khám.
    if (!tableBody) return;

    const searchInput = document.getElementById("patientResultsSearch");
    const specialtyFilter = document.getElementById("patientResultsSpecialty");
    const yearFilter = document.getElementById("patientResultsYear");
    const resetButton = document.getElementById("patientResultsReset");

    const totalElement = document.getElementById("patientResultsTotal");
    const diagnosedElement = document.getElementById("patientResultsDiagnosed");
    const doctorsElement = document.getElementById("patientResultsDoctors");

    const pageInfo = document.getElementById("patientResultsPageInfo");
    const pageNumber = document.getElementById("patientResultsPageNumber");
    const prevButton = document.getElementById("patientResultsPrev");
    const nextButton = document.getElementById("patientResultsNext");
    const emptyElement = document.getElementById("patientResultsEmpty");

    const detailModalElement = document.getElementById("patientResultsDetailModal");
    const detailContent = document.getElementById("patientResultsDetailContent");
    const printDetailButton = document.getElementById("patientResultsPrintDetail");
    const printAllButton = document.getElementById("patientResultsPrintAll");
    const exportButton = document.getElementById("patientResultsExport");

    const toastElement = document.getElementById("patientResultsToast");
    const toastMessage = document.getElementById("patientResultsToastMessage");

    const pageSize = 5;
    let currentPage = 1;
    let selectedResult = null;
    let toastTimer = null;

    const results = [
        {
            id: "KQ001",
            date: "2026-10-12",
            specialty: "Nội tổng quát",
            doctor: "BS. Nguyễn Hoàng Nam",
            diagnosis: "Viêm họng cấp",
            symptoms: "Đau họng, ho nhẹ, khó chịu khi nuốt.",
            indicators: "Nhiệt độ: 37,2°C; Mạch: 78 lần/phút; Huyết áp: 120/80 mmHg.",
            conclusion: "Kết quả khám ghi nhận các biểu hiện phù hợp với viêm họng cấp.",
            advice: "Uống đủ nước, nghỉ ngơi và sử dụng thuốc theo đúng chỉ định. Tái khám nếu triệu chứng kéo dài hoặc trở nên nghiêm trọng.",
            followUp: "2026-10-19"
        },
        {
            id: "KQ002",
            date: "2026-09-28",
            specialty: "Tim mạch",
            doctor: "BS. Trần Minh Quân",
            diagnosis: "Theo dõi huyết áp",
            symptoms: "Đến khám để kiểm tra huyết áp định kỳ.",
            indicators: "Huyết áp: 125/82 mmHg; Mạch: 76 lần/phút.",
            conclusion: "Đã thực hiện kiểm tra và tư vấn theo dõi huyết áp tại nhà.",
            advice: "Theo dõi huyết áp theo hướng dẫn và tái khám theo lịch hẹn.",
            followUp: "2026-11-28"
        },
        {
            id: "KQ003",
            date: "2026-08-16",
            specialty: "Tai mũi họng",
            doctor: "BS. Lê Thu Hà",
            diagnosis: "Viêm mũi dị ứng",
            symptoms: "Hắt hơi, sổ mũi và ngứa mũi từng đợt.",
            indicators: "Nhiệt độ: 36,8°C; Mạch: 80 lần/phút.",
            conclusion: "Các triệu chứng phù hợp với viêm mũi dị ứng.",
            advice: "Hạn chế tiếp xúc với yếu tố gây dị ứng và sử dụng thuốc theo hướng dẫn của bác sĩ.",
            followUp: "2026-09-16"
        },
        {
            id: "KQ004",
            date: "2026-06-22",
            specialty: "Da liễu",
            doctor: "BS. Phạm Ngọc Lan",
            diagnosis: "Viêm da tiếp xúc",
            symptoms: "Da ngứa và nổi mẩn đỏ tại một số vị trí.",
            indicators: "Nhiệt độ: 36,7°C; Mạch: 77 lần/phút.",
            conclusion: "Kết quả thăm khám ghi nhận biểu hiện phù hợp với viêm da tiếp xúc.",
            advice: "Tránh tiếp xúc với tác nhân nghi ngờ gây kích ứng. Chăm sóc da theo hướng dẫn của bác sĩ.",
            followUp: "2026-07-06"
        },
        {
            id: "KQ005",
            date: "2026-04-10",
            specialty: "Nội tổng quát",
            doctor: "BS. Nguyễn Hoàng Nam",
            diagnosis: "Rối loạn tiêu hóa",
            symptoms: "Khó chịu vùng bụng và ăn uống không ngon miệng.",
            indicators: "Nhiệt độ: 36,9°C; Mạch: 79 lần/phút.",
            conclusion: "Đã thăm khám và tư vấn chế độ ăn uống phù hợp.",
            advice: "Ăn uống đúng giờ, đảm bảo vệ sinh thực phẩm và theo dõi triệu chứng.",
            followUp: "2026-04-24"
        },
        {
            id: "KQ006",
            date: "2025-12-18",
            specialty: "Tim mạch",
            doctor: "BS. Trần Minh Quân",
            diagnosis: "Khám sức khỏe định kỳ",
            symptoms: "Khám tổng quát theo lịch định kỳ.",
            indicators: "Huyết áp: 118/78 mmHg; Mạch: 74 lần/phút; Nhiệt độ: 36,8°C.",
            conclusion: "Đã hoàn thành thăm khám và được tư vấn theo dõi sức khỏe.",
            advice: "Duy trì chế độ sinh hoạt phù hợp và khám sức khỏe định kỳ.",
            followUp: "2026-12-18"
        },
        {
            id: "KQ007",
            date: "2025-10-05",
            specialty: "Nhi khoa",
            doctor: "BS. Võ Thanh Tâm",
            diagnosis: "Tư vấn sức khỏe",
            symptoms: "Tư vấn và kiểm tra sức khỏe theo lịch hẹn.",
            indicators: "Nhiệt độ: 36,7°C; Mạch: 82 lần/phút.",
            conclusion: "Đã hoàn tất buổi khám và trao đổi các lưu ý chăm sóc sức khỏe.",
            advice: "Thực hiện theo hướng dẫn chăm sóc sức khỏe được trao đổi trong buổi khám.",
            followUp: ""
        },
        {
            id: "KQ008",
            date: "2025-07-14",
            specialty: "Nội tổng quát",
            doctor: "BS. Nguyễn Hoàng Nam",
            diagnosis: "Khám sức khỏe tổng quát",
            symptoms: "Kiểm tra sức khỏe tổng quát.",
            indicators: "Nhiệt độ: 36,6°C; Mạch: 76 lần/phút; Huyết áp: 118/78 mmHg.",
            conclusion: "Đã hoàn tất các bước thăm khám tổng quát.",
            advice: "Duy trì lối sống lành mạnh và kiểm tra sức khỏe theo lịch phù hợp.",
            followUp: ""
        }
    ];

    const escapeHTML = (value) => {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có lịch";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const showToast = (message) => {
        toastMessage.textContent = message;
        toastElement.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastElement.classList.remove("show");
        }, 2600);
    };

    const getFilteredResults = () => {
        const keyword = searchInput.value.trim().toLowerCase();
        const specialty = specialtyFilter.value;
        const year = yearFilter.value;

        return results.filter((result) => {
            const searchText = [
                result.id,
                result.doctor,
                result.specialty,
                result.diagnosis,
                result.conclusion
            ].join(" ").toLowerCase();

            return (!keyword || searchText.includes(keyword))
                && (!specialty || result.specialty === specialty)
                && (!year || result.date.startsWith(year));
        });
    };

    const renderStatistics = () => {
        totalElement.textContent = results.length;

        diagnosedElement.textContent = results.filter(
            (result) => Boolean(result.diagnosis)
        ).length;

        doctorsElement.textContent = new Set(
            results.map((result) => result.doctor)
        ).size;
    };

    const renderTable = () => {
        const filtered = getFilteredResults();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

        currentPage = Math.min(Math.max(currentPage, 1), totalPages);

        const start = (currentPage - 1) * pageSize;
        const currentResults = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = currentResults.map((result) => `
            <tr>
                <td>
                    <span class="patient-results-code">${escapeHTML(result.id)}</span>
                </td>
                <td>
                    <span class="patient-results-date">${formatDate(result.date)}</span>
                </td>
                <td>
                    <div class="patient-results-doctor">
                        <div class="patient-results-doctor-avatar">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div>
                            <div class="patient-results-doctor-name">${escapeHTML(result.doctor)}</div>
                            <div class="patient-results-doctor-label">Bác sĩ phụ trách</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="patient-results-specialty">${escapeHTML(result.specialty)}</span>
                </td>
                <td>
                    <div class="patient-results-diagnosis">${escapeHTML(result.diagnosis)}</div>
                </td>
                <td>
                    <span class="patient-results-status">
                        <i class="bi bi-check-circle-fill"></i> Đã có kết quả
                    </span>
                </td>
                <td>
                    <div class="patient-results-actions">
                        <button type="button"
                                class="patient-results-action-btn"
                                data-result-action="view"
                                data-result-id="${escapeHTML(result.id)}"
                                title="Xem chi tiết">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button"
                                class="patient-results-action-btn"
                                data-result-action="print"
                                data-result-id="${escapeHTML(result.id)}"
                                title="In kết quả">
                            <i class="bi bi-printer"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        emptyElement.classList.toggle("d-none", filtered.length > 0);
        tableBody.closest(".table-responsive").classList.toggle(
            "d-none",
            filtered.length === 0
        );

        const end = Math.min(start + pageSize, filtered.length);
        pageInfo.textContent = `Hiển thị ${filtered.length ? start + 1 : 0}–${end} trong ${filtered.length} kết quả`;
        pageNumber.textContent = `Trang ${currentPage}/${totalPages}`;

        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
    };

    const renderYearOptions = () => {
        const years = [...new Set(
            results.map((result) => result.date.slice(0, 4))
        )].sort((a, b) => b.localeCompare(a));

        yearFilter.innerHTML = '<option value="">Tất cả năm</option>' +
            years.map((year) => `<option value="${year}">${year}</option>`).join("");
    };

    const detailItem = (label, value) => `
        <div class="patient-results-detail-item">
            <span class="detail-label">${escapeHTML(label)}</span>
            <span class="detail-value">${escapeHTML(value || "Chưa có thông tin")}</span>
        </div>
    `;

    const renderDetail = (result) => {
        selectedResult = result;

        detailContent.innerHTML = `
            <div class="patient-results-detail-header">
                <div>
                    <div class="patient-results-detail-code">
                        Mã kết quả: ${escapeHTML(result.id)}
                    </div>
                    <div class="patient-results-detail-date">
                        <i class="bi bi-calendar3 me-1"></i>
                        Ngày khám: ${formatDate(result.date)}
                    </div>
                </div>

                <span class="patient-results-status">
                    <i class="bi bi-check-circle-fill"></i> Đã có kết quả
                </span>
            </div>

            <div class="patient-results-detail-section">
                <h6><i class="bi bi-person-vcard"></i> Thông tin buổi khám</h6>
                <div class="patient-results-detail-grid">
                    ${detailItem("Bệnh nhân", "Nguyễn Minh Anh")}
                    ${detailItem("Bác sĩ phụ trách", result.doctor)}
                    ${detailItem("Chuyên khoa", result.specialty)}
                    ${detailItem("Ngày tái khám", formatDate(result.followUp))}
                </div>
            </div>

            <div class="patient-results-detail-section">
                <h6><i class="bi bi-clipboard2-pulse"></i> Kết quả chuyên môn</h6>
                <div class="patient-results-detail-grid">
                    ${detailItem("Chẩn đoán", result.diagnosis)}
                    ${detailItem("Triệu chứng", result.symptoms)}
                </div>

                <div class="patient-results-detail-item mt-3">
                    <span class="detail-label">Chỉ số sức khỏe</span>
                    <span class="detail-value">${escapeHTML(result.indicators)}</span>
                </div>

                <div class="patient-results-detail-item mt-3">
                    <span class="detail-label">Kết luận của bác sĩ</span>
                    <span class="detail-value">${escapeHTML(result.conclusion)}</span>
                </div>
            </div>

            <div class="patient-results-detail-section">
                <h6><i class="bi bi-journal-medical"></i> Hướng dẫn sau khám</h6>
                <div class="patient-results-detail-note">${escapeHTML(result.advice)}</div>
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(detailModalElement).show();
    };

    const printSelectedResult = () => {
        if (!selectedResult) return;

        document.body.classList.add("patient-results-printing");

        const cleanup = () => {
            document.body.classList.remove("patient-results-printing");
            window.removeEventListener("afterprint", cleanup);
        };

        window.addEventListener("afterprint", cleanup);
        window.print();
        setTimeout(cleanup, 1500);
    };

    const exportCSV = () => {
        const filtered = getFilteredResults();

        if (!filtered.length) {
            showToast("Không có kết quả để xuất");
            return;
        }

        const rows = [
            ["Mã kết quả", "Ngày khám", "Bác sĩ", "Chuyên khoa", "Chẩn đoán", "Kết luận"],
            ...filtered.map((result) => [
                result.id,
                formatDate(result.date),
                result.doctor,
                result.specialty,
                result.diagnosis,
                result.conclusion
            ])
        ];

        const csv = "\uFEFF" + rows.map((row) =>
            row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        ).join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "ket-qua-kham.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showToast("Đã xuất danh sách kết quả khám");
    };

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable();
    });

    specialtyFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    yearFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    resetButton.addEventListener("click", () => {
        searchInput.value = "";
        specialtyFilter.value = "";
        yearFilter.value = "";
        currentPage = 1;
        renderTable();
        showToast("Đã đặt lại bộ lọc");
    });

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextButton.addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(
            getFilteredResults().length / pageSize
        ));

        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-result-action]");
        if (!button) return;

        const result = results.find(
            (item) => item.id === button.dataset.resultId
        );

        if (!result) return;

        if (button.dataset.resultAction === "view") {
            renderDetail(result);
        }

        if (button.dataset.resultAction === "print") {
            renderDetail(result);

            detailModalElement.addEventListener("shown.bs.modal", function printAfterOpen() {
                detailModalElement.removeEventListener("shown.bs.modal", printAfterOpen);
                printSelectedResult();
            });
        }
    });

    printDetailButton.addEventListener("click", printSelectedResult);
    exportButton.addEventListener("click", exportCSV);

    printAllButton.addEventListener("click", () => {
        showToast("Chọn một kết quả trong danh sách để xem và in phiếu");
    });

    renderYearOptions();
    renderStatistics();
    renderTable();
})();
/* ========================================
   PATIENT - QUẢN LÝ ĐƠN THUỐC
======================================== */
(() => {
    const tableBody = document.getElementById("patientRxTableBody");
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);

    const searchInput = $("patientRxSearch");
    const statusFilter = $("patientRxStatus");
    const yearFilter = $("patientRxYear");
    const resetButton = $("patientRxReset");
    const emptyResetButton = $("patientRxEmptyReset");
    const emptyState = $("patientRxEmpty");
    const exportButton = $("patientRxExport");
    const exportSecondaryButton = $("patientRxExportSecondary");
    const detailModalElement = $("patientRxDetailModal");
    const detailContent = $("patientRxDetailContent");
    const printButton = $("patientRxPrint");

    const PAGE_SIZE = 5;
    let currentPage = 1;
    let selectedPrescription = null;
    let toastTimer;

    const prescriptions = [
        {
            id: "DT2026008",
            date: "2026-10-18",
            doctor: "BS. Nguyễn Hoàng Nam",
            specialty: "Nội tổng quát",
            diagnosis: "Viêm họng cấp",
            duration: 5,
            status: "active",
            note: "Thực hiện theo hướng dẫn kê đơn và chỉ định của bác sĩ.",
            medicines: [
                {
                    name: "Paracetamol 500 mg",
                    quantity: "10 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Tuân thủ liều lượng ghi trên đơn thuốc."
                },
                {
                    name: "Thuốc hỗ trợ điều trị họng",
                    quantity: "10 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Đọc kỹ hướng dẫn sử dụng trước khi dùng."
                }
            ]
        },
        {
            id: "DT2026007",
            date: "2026-10-05",
            doctor: "BS. Trần Thu Hà",
            specialty: "Tai Mũi Họng",
            diagnosis: "Viêm mũi dị ứng",
            duration: 7,
            status: "completed",
            note: "Theo dõi triệu chứng và tái khám theo lịch hẹn nếu cần.",
            medicines: [
                {
                    name: "Cetirizine 10 mg",
                    quantity: "7 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Làm theo hướng dẫn trên đơn thuốc."
                },
                {
                    name: "Dung dịch vệ sinh mũi",
                    quantity: "1 chai",
                    dose: "Theo đơn kê",
                    usage: "Theo hướng dẫn sử dụng",
                    instruction: "Đọc kỹ hướng dẫn của sản phẩm."
                }
            ]
        },
        {
            id: "DT2026006",
            date: "2026-09-21",
            doctor: "BS. Lê Minh Tuấn",
            specialty: "Nội tổng quát",
            diagnosis: "Rối loạn tiêu hóa",
            duration: 3,
            status: "completed",
            note: "Thực hiện đúng hướng dẫn của bác sĩ.",
            medicines: [
                {
                    name: "Men vi sinh",
                    quantity: "6 gói",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Bảo quản theo hướng dẫn trên bao bì."
                },
                {
                    name: "Dung dịch bù nước",
                    quantity: "Theo đơn",
                    dose: "Theo đơn kê",
                    usage: "Theo hướng dẫn sản phẩm",
                    instruction: "Thực hiện đúng hướng dẫn pha của sản phẩm."
                }
            ]
        },
        {
            id: "DT2026005",
            date: "2026-08-14",
            doctor: "BS. Phạm Ngọc Mai",
            specialty: "Da liễu",
            diagnosis: "Viêm da tiếp xúc",
            duration: 7,
            status: "completed",
            note: "Tránh các yếu tố gây kích ứng theo hướng dẫn của bác sĩ.",
            medicines: [
                {
                    name: "Kem bôi da",
                    quantity: "1 tuýp",
                    dose: "Theo đơn kê",
                    usage: "Bôi theo chỉ định",
                    instruction: "Chỉ sử dụng theo hướng dẫn của bác sĩ."
                }
            ]
        },
        {
            id: "DT2026004",
            date: "2026-07-26",
            doctor: "BS. Nguyễn Hoàng Nam",
            specialty: "Nội tổng quát",
            diagnosis: "Đau cơ, mỏi cơ",
            duration: 5,
            status: "completed",
            note: "Nghỉ ngơi hợp lý và tái khám khi triệu chứng kéo dài.",
            medicines: [
                {
                    name: "Thuốc giảm đau",
                    quantity: "10 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Không tự ý tăng liều sử dụng."
                }
            ]
        },
        {
            id: "DT2026003",
            date: "2026-06-12",
            doctor: "BS. Trần Thu Hà",
            specialty: "Tai Mũi Họng",
            diagnosis: "Viêm họng",
            duration: 5,
            status: "completed",
            note: "Theo dõi triệu chứng và thực hiện hướng dẫn tái khám.",
            medicines: [
                {
                    name: "Thuốc hỗ trợ điều trị họng",
                    quantity: "10 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Sử dụng theo hướng dẫn được kê."
                },
                {
                    name: "Dung dịch súc họng",
                    quantity: "1 chai",
                    dose: "Theo đơn kê",
                    usage: "Theo hướng dẫn sản phẩm",
                    instruction: "Sử dụng đúng hướng dẫn trên bao bì."
                }
            ]
        },
        {
            id: "DT2026002",
            date: "2026-04-08",
            doctor: "BS. Phạm Ngọc Mai",
            specialty: "Da liễu",
            diagnosis: "Dị ứng da",
            duration: 5,
            status: "completed",
            note: "Theo dõi phản ứng của da và tái khám nếu có biểu hiện bất thường.",
            medicines: [
                {
                    name: "Thuốc chống dị ứng",
                    quantity: "5 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định của bác sĩ",
                    instruction: "Đọc kỹ hướng dẫn sử dụng."
                }
            ]
        },
        {
            id: "DT2026001",
            date: "2026-02-16",
            doctor: "BS. Lê Minh Tuấn",
            specialty: "Nội tổng quát",
            diagnosis: "Khám sức khỏe tổng quát",
            duration: 3,
            status: "completed",
            note: "Thực hiện hướng dẫn chăm sóc sức khỏe trong hồ sơ khám.",
            medicines: [
                {
                    name: "Vitamin tổng hợp",
                    quantity: "3 viên",
                    dose: "Theo đơn kê",
                    usage: "Theo chỉ định",
                    instruction: "Sử dụng theo hướng dẫn trên đơn thuốc."
                }
            ]
        }
    ];

    const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

    const formatDate = (date) => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const statusLabel = (status) =>
        status === "active" ? "Đang sử dụng" : "Đã hoàn thành";

    const filteredData = () => {
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");

        return prescriptions.filter((item) => {
            const text = [
                item.id,
                item.doctor,
                item.specialty,
                item.diagnosis
            ].join(" ").toLocaleLowerCase("vi");

            return (!keyword || text.includes(keyword))
                && (!statusFilter.value || item.status === statusFilter.value)
                && (!yearFilter.value || item.date.startsWith(yearFilter.value));
        });
    };

    const updateStats = () => {
        $("patientRxTotal").textContent = prescriptions.length;
        $("patientRxActive").textContent =
            prescriptions.filter((item) => item.status === "active").length;
        $("patientRxCompleted").textContent =
            prescriptions.filter((item) => item.status === "completed").length;
    };

    const renderTable = () => {
        const data = filteredData();
        const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const visibleItems = data.slice(start, start + PAGE_SIZE);

        tableBody.innerHTML = visibleItems.map((item) => `
            <tr>
                <td><span class="patient-rx-code">${escapeHTML(item.id)}</span></td>
                <td><span class="patient-rx-date">${formatDate(item.date)}</span></td>
                <td>
                    <div class="patient-rx-doctor">
                        <strong>${escapeHTML(item.doctor)}</strong>
                        <span>${escapeHTML(item.specialty)}</span>
                    </div>
                </td>
                <td><div class="patient-rx-diagnosis">${escapeHTML(item.diagnosis)}</div></td>
                <td><span class="patient-rx-medicine-count">${item.medicines.length}</span></td>
                <td><span class="patient-rx-duration">${item.duration} ngày</span></td>
                <td><span class="patient-rx-status ${item.status}">${statusLabel(item.status)}</span></td>
                <td>
                    <div class="patient-rx-actions">
                        <button type="button" class="patient-rx-action-btn"
                                data-rx-action="detail" data-rx-id="${escapeHTML(item.id)}"
                                title="Xem chi tiết" aria-label="Xem chi tiết">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="patient-rx-action-btn"
                                data-rx-action="print" data-rx-id="${escapeHTML(item.id)}"
                                title="In đơn thuốc" aria-label="In đơn thuốc">
                            <i class="bi bi-printer"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        emptyState.classList.toggle("d-none", data.length > 0);
        tableBody.closest(".table-responsive").classList.toggle("d-none", data.length === 0);

        $("patientRxPageInfo").textContent = data.length
            ? `Hiển thị ${start + 1}–${Math.min(start + PAGE_SIZE, data.length)} trong ${data.length} đơn thuốc`
            : "Không có đơn thuốc phù hợp";

        $("patientRxPage").textContent = `${currentPage} / ${totalPages}`;
        $("patientRxPrev").disabled = currentPage <= 1;
        $("patientRxNext").disabled = currentPage >= totalPages;

        const countText = `${data.length} đơn thuốc`;
        document.querySelectorAll(".patient-rx-count").forEach((element) => {
            element.textContent = countText;
        });
    };

    const showToast = (message) => {
        $("patientRxToastMessage").textContent = message;
        $("patientRxToast").classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            $("patientRxToast").classList.remove("show");
        }, 2800);
    };

    const renderDetail = (item) => {
        const medicinesHTML = item.medicines.map((medicine, index) => `
            <div class="patient-rx-medicine-card">
                <div class="patient-rx-medicine-head">
                    <strong>${index + 1}. ${escapeHTML(medicine.name)}</strong>
                    <span>${escapeHTML(medicine.quantity)}</span>
                </div>
                <div class="patient-rx-medicine-info">
                    <div><strong>Liều dùng</strong>${escapeHTML(medicine.dose)}</div>
                    <div><strong>Cách sử dụng</strong>${escapeHTML(medicine.usage)}</div>
                    <div><strong>Hướng dẫn</strong>${escapeHTML(medicine.instruction)}</div>
                </div>
            </div>
        `).join("");

        detailContent.innerHTML = `
            <div class="patient-rx-print-area">
                <div class="patient-rx-detail-top">
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Mã đơn thuốc</span>
                        <div class="patient-rx-detail-value">${escapeHTML(item.id)}</div>
                    </div>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Ngày kê đơn</span>
                        <div class="patient-rx-detail-value">${formatDate(item.date)}</div>
                    </div>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Trạng thái</span>
                        <div class="patient-rx-detail-value">${statusLabel(item.status)}</div>
                    </div>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Bác sĩ kê đơn</span>
                        <div class="patient-rx-detail-value">${escapeHTML(item.doctor)}</div>
                    </div>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Chuyên khoa</span>
                        <div class="patient-rx-detail-value">${escapeHTML(item.specialty)}</div>
                    </div>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Thời gian dùng theo đơn</span>
                        <div class="patient-rx-detail-value">${item.duration} ngày</div>
                    </div>
                </div>

                <section class="patient-rx-detail-section">
                    <h6><i class="bi bi-clipboard2-pulse me-2"></i>Thông tin khám</h6>
                    <div class="patient-rx-detail-item">
                        <span class="patient-rx-detail-label">Chẩn đoán</span>
                        <div class="patient-rx-detail-value">${escapeHTML(item.diagnosis)}</div>
                    </div>
                </section>

                <section class="patient-rx-detail-section">
                    <h6><i class="bi bi-capsule me-2"></i>Danh sách thuốc (${item.medicines.length})</h6>
                    ${medicinesHTML}
                </section>

                <section class="patient-rx-detail-section">
                    <h6><i class="bi bi-info-circle me-2"></i>Lời dặn của bác sĩ</h6>
                    <div class="patient-rx-instruction">${escapeHTML(item.note)}</div>
                </section>

                <div class="patient-rx-doctor-sign">
                    <strong>${escapeHTML(item.doctor)}</strong>
                    <span>Bác sĩ kê đơn</span>
                </div>
            </div>
        `;
    };

    const openDetail = (id) => {
        const item = prescriptions.find((prescription) => prescription.id === id);
        if (!item) return;

        selectedPrescription = item;
        renderDetail(item);

        bootstrap.Modal.getOrCreateInstance(detailModalElement).show();
    };

    const printPrescription = () => {
        if (!selectedPrescription) {
            showToast("Vui lòng chọn đơn thuốc cần in.");
            return;
        }

        const printArea = detailContent.querySelector(".patient-rx-print-area");
        if (!printArea) return;

        const printWindow = window.open("", "_blank", "width=900,height=750");

        if (!printWindow) {
            showToast("Trình duyệt đang chặn cửa sổ in. Hãy cho phép cửa sổ bật lên rồi thử lại.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Đơn thuốc ${escapeHTML(selectedPrescription.id)}</title>
                <style>
                    body { padding: 25px; color: #26384f; font-family: Arial, sans-serif; font-size: 13px; }
                    h1 { color: #123b68; font-size: 23px; }
                    .patient-rx-detail-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                    .patient-rx-detail-item { padding: 10px; border: 1px solid #dce4ee; border-radius: 6px; }
                    .patient-rx-detail-label { display: block; margin-bottom: 6px; color: #718096; font-size: 11px; }
                    .patient-rx-detail-value { font-weight: 600; line-height: 1.6; overflow-wrap: anywhere; }
                    .patient-rx-detail-section { margin-top: 20px; }
                    .patient-rx-detail-section h6 { color: #123b68; font-size: 14px; }
                    .patient-rx-medicine-card { margin-bottom: 10px; padding: 12px; border: 1px solid #dce4ee; border-radius: 6px; break-inside: avoid; }
                    .patient-rx-medicine-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
                    .patient-rx-medicine-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                    .patient-rx-medicine-info div { font-size: 11px; line-height: 1.7; }
                    .patient-rx-medicine-info strong { display: block; }
                    .patient-rx-instruction { padding: 12px; background: #f5f8fc; line-height: 1.8; white-space: pre-line; }
                    .patient-rx-doctor-sign { margin-top: 28px; text-align: right; }
                    .patient-rx-doctor-sign span { display: block; margin-top: 5px; }
                    @page { size: A4; margin: 15mm; }
                </style>
            </head>
            <body>
                <h1>MedCare</h1>
                <p>Thông tin đơn thuốc</p>
                <hr>
                ${printArea.outerHTML}
                <script>
                    window.onload = function () { window.print(); };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    const exportCSV = () => {
        const data = filteredData();

        if (!data.length) {
            showToast("Không có đơn thuốc để xuất.");
            return;
        }

        const headers = [
            "Mã đơn thuốc", "Ngày kê đơn", "Bác sĩ", "Chuyên khoa",
            "Chẩn đoán", "Số loại thuốc", "Thời gian dùng (ngày)", "Trạng thái"
        ];

        const rows = data.map((item) => [
            item.id,
            formatDate(item.date),
            item.doctor,
            item.specialty,
            item.diagnosis,
            item.medicines.length,
            item.duration,
            statusLabel(item.status)
        ]);

        const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = "\uFEFF" + [headers, ...rows]
            .map((row) => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-don-thuoc.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showToast("Đã xuất danh sách đơn thuốc.");
    };

    const resetFilters = () => {
        searchInput.value = "";
        statusFilter.value = "";
        yearFilter.value = "";
        currentPage = 1;
        renderTable();
    };

    const populateYears = () => {
        const years = [...new Set(
            prescriptions.map((item) => item.date.slice(0, 4))
        )].sort((a, b) => b.localeCompare(a));

        yearFilter.innerHTML = `
            <option value="">Tất cả năm</option>
            ${years.map((year) => `<option value="${year}">${year}</option>`).join("")}
        `;
    };

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable();
    });

    statusFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    yearFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    resetButton.addEventListener("click", resetFilters);
    emptyResetButton.addEventListener("click", resetFilters);

    $("patientRxPrev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    $("patientRxNext").addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(filteredData().length / PAGE_SIZE));

        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-rx-action]");
        if (!button) return;

        const id = button.dataset.rxId;

        if (button.dataset.rxAction === "detail") {
            openDetail(id);
            return;
        }

        if (button.dataset.rxAction === "print") {
            openDetail(id);

            detailModalElement.addEventListener("shown.bs.modal", () => {
                printPrescription();
            }, { once: true });
        }
    });

    printButton.addEventListener("click", printPrescription);
    exportButton.addEventListener("click", exportCSV);

    if (exportSecondaryButton) {
        exportSecondaryButton.addEventListener("click", exportCSV);
    }

    populateYears();
    updateStats();
    renderTable();
})();

/* ==========================================
   PATIENT - LỊCH UỐNG THUỐC
========================================== */
(() => {
    const tableBody = document.getElementById("patientScheduleTableBody");
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);

    const el = {
        total: $("patientScheduleTotal"),
        taken: $("patientScheduleTaken"),
        pending: $("patientSchedulePending"),
        search: $("patientScheduleSearch"),
        period: $("patientSchedulePeriodFilter"),
        status: $("patientScheduleStatusFilter"),
        reset: $("patientScheduleResetBtn"),
        emptyReset: $("patientScheduleEmptyResetBtn"),
        empty: $("patientScheduleEmpty"),
        resultCount: $("patientScheduleResultCount"),
        pagination: $("patientSchedulePagination"),
        dateLabel: $("patientScheduleDateLabel"),
        fullDate: $("patientScheduleFullDate"),
        prevDay: $("patientSchedulePrevDay"),
        nextDay: $("patientScheduleNextDay"),
        today: $("patientScheduleTodayBtn"),
        export: $("patientScheduleExportBtn"),
        detailModal: $("patientScheduleDetailModal"),
        detailContent: $("patientScheduleDetailContent"),
        confirmTaken: $("patientScheduleConfirmTakenBtn"),
        toast: $("patientScheduleToast"),
        toastMessage: $("patientScheduleToastMessage")
    };

    const pageSize = 6;
    let currentPage = 1;
    let selectedDate = new Date();
    let selectedMedicineId = null;
    let toastTimer;

    const pad = (number) => String(number).padStart(2, "0");

    const dateKey = (date) =>
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const formatDate = (date) => date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const formatShortDate = (date) => date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const isToday = () => dateKey(selectedDate) === dateKey(new Date());

    const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

    /*
       Danh sách phục vụ giao diện.
       Khi tích hợp backend, thay danh sách này bằng dữ liệu
       thuốc thực tế từ đơn thuốc của bệnh nhân.
    */
    const medicines = [
        {
            id: 1,
            name: "Paracetamol 500mg",
            description: "Thuốc giảm đau, hạ sốt",
            dose: "Theo đơn thuốc",
            time: "08:00",
            period: "Sáng",
            instruction: "Sử dụng đúng liều lượng và khoảng cách liều theo đơn thuốc.",
            note: "Không tự ý tăng liều hoặc dùng thêm thuốc có cùng hoạt chất."
        },
        {
            id: 2,
            name: "Vitamin C 500mg",
            description: "Vitamin bổ sung",
            dose: "Theo đơn thuốc",
            time: "08:30",
            period: "Sáng",
            instruction: "Sử dụng theo hướng dẫn của bác sĩ hoặc dược sĩ.",
            note: "Tuân thủ liều lượng được hướng dẫn."
        },
        {
            id: 3,
            name: "Thuốc điều trị",
            description: "Liều theo đơn đã kê",
            dose: "Theo đơn thuốc",
            time: "12:00",
            period: "Trưa",
            instruction: "Đối chiếu đơn thuốc thực tế trước khi sử dụng.",
            note: "Không tự ý thay đổi liều hoặc thời gian dùng thuốc."
        },
        {
            id: 4,
            name: "Men vi sinh",
            description: "Hỗ trợ hệ tiêu hóa",
            dose: "Theo hướng dẫn",
            time: "13:00",
            period: "Trưa",
            instruction: "Thực hiện theo hướng dẫn trên đơn thuốc hoặc sản phẩm.",
            note: "Nếu có thắc mắc, hỏi bác sĩ hoặc dược sĩ."
        },
        {
            id: 5,
            name: "Thuốc theo đơn",
            description: "Liều dùng buổi chiều",
            dose: "Theo đơn thuốc",
            time: "16:00",
            period: "Chiều",
            instruction: "Sử dụng theo chỉ định của bác sĩ.",
            note: "Không dùng liều thay thế nếu chưa được hướng dẫn."
        },
        {
            id: 6,
            name: "Thuốc điều trị",
            description: "Liều dùng buổi tối",
            dose: "Theo đơn thuốc",
            time: "19:00",
            period: "Tối",
            instruction: "Kiểm tra tên thuốc và hướng dẫn trên đơn trước khi sử dụng.",
            note: "Nếu gặp phản ứng bất thường, liên hệ cơ sở y tế."
        },
        {
            id: 7,
            name: "Vitamin bổ sung",
            description: "Thuốc bổ sung theo chỉ định",
            dose: "Theo đơn thuốc",
            time: "20:00",
            period: "Tối",
            instruction: "Dùng đúng liều được chỉ định.",
            note: "Không tự ý phối hợp thêm thuốc hoặc thực phẩm bổ sung."
        },
        {
            id: 8,
            name: "Thuốc theo chỉ định",
            description: "Liều dùng cuối ngày",
            dose: "Theo đơn thuốc",
            time: "21:00",
            period: "Tối",
            instruction: "Đối chiếu đơn thuốc thực tế trước khi sử dụng.",
            note: "Chỉ dùng khi có chỉ định phù hợp."
        }
    ];

    // Trạng thái được ghi nhận theo ngày trong phiên hiện tại.
    const takenDoses = new Set();

    const doseKey = (medicine) => `${dateKey(selectedDate)}-${medicine.id}`;

    const isTaken = (medicine) => takenDoses.has(doseKey(medicine));

    function showToast(message) {
        if (!el.toast || !el.toastMessage) return;

        el.toastMessage.textContent = message;
        el.toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.toast.classList.remove("show");
        }, 2600);
    }

    function updateDateDisplay() {
        if (el.dateLabel) {
            el.dateLabel.textContent = isToday()
                ? "Hôm nay"
                : formatShortDate(selectedDate);
        }

        if (el.fullDate) {
            el.fullDate.textContent = formatDate(selectedDate);
        }
    }

    function getFilteredMedicines() {
        const keyword = (el.search?.value || "").trim().toLocaleLowerCase("vi");
        const period = el.period?.value || "";
        const status = el.status?.value || "";

        return medicines.filter((medicine) => {
            const matchesKeyword =
                !keyword ||
                medicine.name.toLocaleLowerCase("vi").includes(keyword) ||
                medicine.description.toLocaleLowerCase("vi").includes(keyword);

            const matchesPeriod = !period || medicine.period === period;

            const currentStatus = isTaken(medicine) ? "taken" : "pending";
            const matchesStatus = !status || currentStatus === status;

            return matchesKeyword && matchesPeriod && matchesStatus;
        }).sort((a, b) => a.time.localeCompare(b.time));
    }

    function getPeriodIcon(period) {
        return {
            "Sáng": "bi-sunrise",
            "Trưa": "bi-sun",
            "Chiều": "bi-cloud-sun",
            "Tối": "bi-moon-stars"
        }[period] || "bi-clock";
    }

    function renderStats() {
        const total = medicines.length;
        const taken = medicines.filter(isTaken).length;

        if (el.total) el.total.textContent = total;
        if (el.taken) el.taken.textContent = taken;
        if (el.pending) el.pending.textContent = total - taken;
    }

    function renderPagination(totalItems) {
        if (!el.pagination) return;

        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        el.pagination.innerHTML = `
            <button type="button" data-page="prev" aria-label="Trang trước"
                ${currentPage <= 1 ? "disabled" : ""}>
                <i class="bi bi-chevron-left"></i>
            </button>
            ${Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return `
                    <button type="button"
                        data-page="${page}"
                        class="${page === currentPage ? "active" : ""}"
                        aria-label="Trang ${page}"
                        ${page === currentPage ? 'aria-current="page"' : ""}>
                        ${page}
                    </button>
                `;
            }).join("")}
            <button type="button" data-page="next" aria-label="Trang tiếp theo"
                ${currentPage >= totalPages ? "disabled" : ""}>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;
    }

    function renderTable() {
        const filtered = getFilteredMedicines();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

        currentPage = Math.min(currentPage, totalPages);
        currentPage = Math.max(currentPage, 1);

        const start = (currentPage - 1) * pageSize;
        const rows = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = rows.map((medicine) => {
            const taken = isTaken(medicine);

            return `
                <tr>
                    <td>
                        <div class="patient-schedule-time">
                            <span class="patient-schedule-time-icon">
                                <i class="bi ${getPeriodIcon(medicine.period)}"></i>
                            </span>
                            ${escapeHTML(medicine.time)}
                        </div>
                    </td>
                    <td>
                        <div class="patient-schedule-medicine-name">
                            ${escapeHTML(medicine.name)}
                        </div>
                        <span class="patient-schedule-medicine-description">
                            ${escapeHTML(medicine.description)}
                        </span>
                    </td>
                    <td>${escapeHTML(medicine.dose)}</td>
                    <td>
                        <span class="patient-schedule-period">
                            <i class="bi ${getPeriodIcon(medicine.period)}"></i>
                            ${escapeHTML(medicine.period)}
                        </span>
                    </td>
                    <td>
                        <span class="patient-schedule-status ${taken ? "status-taken" : "status-pending"}">
                            <i class="bi ${taken ? "bi-check-circle-fill" : "bi-clock"}"></i>
                            ${taken ? "Đã uống" : "Chưa uống"}
                        </span>
                    </td>
                    <td>
                        <div class="patient-schedule-actions">
                            <button type="button"
                                class="patient-schedule-action"
                                data-schedule-action="detail"
                                data-id="${medicine.id}">
                                <i class="bi bi-eye"></i> Chi tiết
                            </button>

                            <button type="button"
                                class="patient-schedule-action action-taken"
                                data-schedule-action="taken"
                                data-id="${medicine.id}"
                                ${taken || !isToday() ? "disabled" : ""}>
                                <i class="bi bi-check2-circle"></i>
                                ${taken ? "Đã ghi nhận" : "Đã uống"}
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        const table = tableBody.closest("table");

        if (table) {
            table.classList.toggle("d-none", filtered.length === 0);
        }

        if (el.empty) {
            el.empty.classList.toggle("d-none", filtered.length > 0);
        }

        if (el.resultCount) {
            el.resultCount.textContent =
                `Hiển thị ${rows.length} / ${filtered.length} liều thuốc`;
        }

        renderPagination(filtered.length);
        renderStats();
        updateDateDisplay();
    }

    function render() {
        currentPage = 1;
        renderTable();
    }

    function markAsTaken(id) {
        const medicine = medicines.find((item) => item.id === Number(id));
        if (!medicine) return;

        if (!isToday()) {
            showToast("Chỉ ghi nhận liều đã uống sau khi xác nhận thực tế.");
            return;
        }

        if (isTaken(medicine)) {
            showToast("Liều thuốc này đã được ghi nhận.");
            return;
        }

        takenDoses.add(doseKey(medicine));
        renderTable();
        showToast("Đã ghi nhận trạng thái uống thuốc.");
    }

    function openDetail(id) {
        const medicine = medicines.find((item) => item.id === Number(id));
        if (!medicine || !el.detailContent) return;

        selectedMedicineId = medicine.id;
        const taken = isTaken(medicine);

        el.detailContent.innerHTML = `
            <div class="patient-schedule-detail-grid">
                <div class="patient-schedule-detail-item full">
                    <span>Tên thuốc</span>
                    <strong>${escapeHTML(medicine.name)}</strong>
                </div>

                <div class="patient-schedule-detail-item">
                    <span>Thời gian</span>
                    <strong>${escapeHTML(medicine.time)} · ${escapeHTML(medicine.period)}</strong>
                </div>

                <div class="patient-schedule-detail-item">
                    <span>Liều dùng</span>
                    <strong>${escapeHTML(medicine.dose)}</strong>
                </div>

                <div class="patient-schedule-detail-item">
                    <span>Ngày theo dõi</span>
                    <strong>${escapeHTML(formatShortDate(selectedDate))}</strong>
                </div>

                <div class="patient-schedule-detail-item">
                    <span>Trạng thái</span>
                    <strong>${taken ? "Đã uống" : "Chưa uống"}</strong>
                </div>

                <div class="patient-schedule-detail-item full">
                    <span>Hướng dẫn sử dụng</span>
                    <strong>${escapeHTML(medicine.instruction)}</strong>
                </div>

                <div class="patient-schedule-detail-item full">
                    <span>Lưu ý</span>
                    <strong>${escapeHTML(medicine.note)}</strong>
                </div>
            </div>
        `;

        if (el.confirmTaken) {
            el.confirmTaken.disabled = taken || !isToday();
            el.confirmTaken.innerHTML = taken
                ? '<i class="bi bi-check-lg"></i> Đã ghi nhận'
                : '<i class="bi bi-check-lg"></i> Đánh dấu đã uống';
        }

        if (el.detailModal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(el.detailModal).show();
        }
    }

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-schedule-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.scheduleAction === "detail") {
            openDetail(id);
        }

        if (button.dataset.scheduleAction === "taken") {
            markAsTaken(id);
        }
    });

    el.confirmTaken?.addEventListener("click", () => {
        if (selectedMedicineId === null) return;

        const medicine = medicines.find((item) => item.id === selectedMedicineId);
        if (!medicine) return;

        if (!isTaken(medicine) && isToday()) {
            markAsTaken(selectedMedicineId);
        }

        if (el.detailModal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(el.detailModal).hide();
        }
    });

    function resetFilters() {
        if (el.search) el.search.value = "";
        if (el.period) el.period.value = "";
        if (el.status) el.status.value = "";
        render();
    }

    el.search?.addEventListener("input", render);
    el.period?.addEventListener("change", render);
    el.status?.addEventListener("change", render);
    el.reset?.addEventListener("click", resetFilters);
    el.emptyReset?.addEventListener("click", resetFilters);

    el.pagination?.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredMedicines().length / pageSize)
        );

        const value = button.dataset.page;

        if (value === "prev") {
            currentPage--;
        } else if (value === "next") {
            currentPage++;
        } else {
            currentPage = Number(value);
        }

        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        renderTable();
    });

    el.prevDay?.addEventListener("click", () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        render();
    });

    el.nextDay?.addEventListener("click", () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        render();
    });

    el.today?.addEventListener("click", () => {
        selectedDate = new Date();
        render();
    });

    el.export?.addEventListener("click", () => {
        const rows = getFilteredMedicines();

        if (!rows.length) {
            showToast("Không có dữ liệu để xuất.");
            return;
        }

        const csvCell = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvRows = [
            ["Ngày", "Thời gian", "Tên thuốc", "Liều dùng", "Buổi", "Trạng thái"],
            ...rows.map((medicine) => [
                formatShortDate(selectedDate),
                medicine.time,
                medicine.name,
                medicine.dose,
                medicine.period,
                isTaken(medicine) ? "Đã uống" : "Chưa uống"
            ])
        ];

        const csv = "\uFEFF" + csvRows
            .map((row) => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `lich-uong-thuoc-${dateKey(selectedDate)}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showToast("Đã xuất danh sách lịch uống thuốc.");
    });

    render();
})();

/* ==========================================
   PATIENT - HỒ SƠ CÁ NHÂN
========================================== */
(() => {
    const form = document.getElementById("patientProfileForm");
    if (!form) return;

    const $ = (id) => document.getElementById(id);

    const editBtn = $("patientProfileEditBtn");
    const cancelBtn = $("patientProfileCancelBtn");
    const saveActions = $("patientProfileFormActions");
    const formMode = $("patientProfileFormMode");
    const contactStatus = $("patientProfileContactStatus");

    const fields = [
        "patientProfileFullName",
        "patientProfileDob",
        "patientProfileGender",
        "patientProfileCitizenId",
        "patientProfileOccupation",
        "patientProfilePhone",
        "patientProfileEmail",
        "patientProfileAddress",
        "patientProfileBloodType",
        "patientProfileEmergencyPhone",
        "patientProfileAllergies"
    ];

    const toast = $("patientProfileToast");
    const toastMessage = $("patientProfileToastMessage");

    let originalValues = {};
    let editing = false;
    let toastTimer;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function showToast(message) {
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    function getFieldValues() {
        const values = {};

        fields.forEach((id) => {
            const input = $(id);
            if (input) values[id] = input.value;
        });

        return values;
    }

    function restoreValues(values) {
        fields.forEach((id) => {
            const input = $(id);
            if (input && Object.prototype.hasOwnProperty.call(values, id)) {
                input.value = values[id];
            }
        });
    }

    function setEditing(value) {
        editing = value;

        fields.forEach((id) => {
            const input = $(id);
            if (input) input.disabled = !value;
        });

        if (saveActions) {
            saveActions.classList.toggle("d-none", !value);
        }

        if (editBtn) {
            editBtn.classList.toggle("d-none", value);
        }

        if (formMode) {
            formMode.innerHTML = value
                ? '<i class="bi bi-pencil-square"></i> Đang chỉnh sửa'
                : '<i class="bi bi-eye"></i> Chế độ xem';
        }

        if (value) {
            $("patientProfileFullName")?.focus();
        }
    }

    function formatDate(value) {
        if (!value) return "Chưa cập nhật";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function updateProfileSummary() {
        const name = $("patientProfileFullName")?.value.trim() || "Chưa cập nhật";
        const dob = $("patientProfileDob")?.value || "";
        const gender = $("patientProfileGender")?.value || "Chưa cập nhật";
        const phone = $("patientProfilePhone")?.value.trim() || "Chưa cập nhật";
        const email = $("patientProfileEmail")?.value.trim() || "Chưa cập nhật";

        const displayName = $("patientProfileDisplayName");
        const displayDob = $("patientProfileDisplayDob");
        const displayGender = $("patientProfileDisplayGender");
        const displayPhone = $("patientProfileDisplayPhone");
        const displayEmail = $("patientProfileDisplayEmail");

        if (displayName) displayName.textContent = name;
        if (displayDob) displayDob.textContent = formatDate(dob);
        if (displayGender) displayGender.textContent = gender;
        if (displayPhone) displayPhone.textContent = phone;
        if (displayEmail) displayEmail.textContent = email;

        const nameParts = name.trim().split(/\s+/);
        const initials = nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : nameParts[0]?.[0] || "";

        const avatar = $("patientProfileAvatar");
        if (avatar) {
            avatar.textContent = initials.toLocaleUpperCase("vi");
        }

        if (contactStatus) {
            const hasPhone = Boolean($("patientProfilePhone")?.value.trim());
            const hasEmail = Boolean($("patientProfileEmail")?.value.trim());

            contactStatus.textContent = hasPhone && hasEmail
                ? "Đầy đủ"
                : hasPhone || hasEmail
                    ? "Bổ sung"
                    : "Chưa có";
        }
    }

    editBtn?.addEventListener("click", () => {
        originalValues = getFieldValues();
        setEditing(true);
    });

    cancelBtn?.addEventListener("click", () => {
        restoreValues(originalValues);
        setEditing(false);
        form.classList.remove("was-validated");
        showToast("Đã hủy các thay đổi.");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!editing) return;

        form.classList.add("was-validated");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const fullName = $("patientProfileFullName")?.value.trim() || "";
        const phone = $("patientProfilePhone")?.value.trim() || "";
        const citizenId = $("patientProfileCitizenId")?.value.trim() || "";

        if (fullName.length < 2) {
            $("patientProfileFullName")?.setCustomValidity(
                "Vui lòng nhập họ và tên hợp lệ."
            );
            $("patientProfileFullName")?.reportValidity();
            $("patientProfileFullName")?.setCustomValidity("");
            return;
        }

        if (!/^[0-9+\s().-]{9,15}$/.test(phone)) {
            $("patientProfilePhone")?.setCustomValidity(
                "Vui lòng kiểm tra số điện thoại."
            );
            $("patientProfilePhone")?.reportValidity();
            $("patientProfilePhone")?.setCustomValidity("");
            return;
        }

        if (citizenId && !/^[0-9]{9,12}$/.test(citizenId)) {
            $("patientProfileCitizenId")?.setCustomValidity(
                "Số CCCD cần có 9 hoặc 12 chữ số."
            );
            $("patientProfileCitizenId")?.reportValidity();
            $("patientProfileCitizenId")?.setCustomValidity("");
            return;
        }

        const dobValue = $("patientProfileDob")?.value;

        if (dobValue) {
            const dob = new Date(`${dobValue}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (Number.isNaN(dob.getTime()) || dob > today) {
                $("patientProfileDob")?.setCustomValidity(
                    "Ngày sinh không hợp lệ."
                );
                $("patientProfileDob")?.reportValidity();
                $("patientProfileDob")?.setCustomValidity("");
                return;
            }
        }

        updateProfileSummary();
        originalValues = getFieldValues();
        setEditing(false);
        form.classList.remove("was-validated");

        showToast("Thông tin hồ sơ đã được cập nhật.");
    });

    // Modal đổi mật khẩu
    const passwordForm = $("patientProfilePasswordForm");
    const passwordModal = $("patientProfilePasswordModal");
    const passwordMessage = $("patientProfilePasswordMessage");
    const changePasswordBtn = $("patientProfileChangePasswordBtn");

    function showPasswordMessage(message, type) {
        if (!passwordMessage) return;

        passwordMessage.textContent = message;
        passwordMessage.className =
            `patient-profile-password-message show ${type}`;
    }

    changePasswordBtn?.addEventListener("click", () => {
        if (!passwordForm) return;

        passwordForm.reset();

        if (passwordMessage) {
            passwordMessage.textContent = "";
            passwordMessage.className = "patient-profile-password-message";
        }

        if (passwordModal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(passwordModal).show();
        }
    });

    passwordModal?.querySelectorAll("[data-password-target]").forEach((button) => {
        button.addEventListener("click", () => {
            const target = $(button.dataset.passwordTarget);
            if (!target) return;

            const show = target.type === "password";
            target.type = show ? "text" : "password";

            const icon = button.querySelector("i");
            if (icon) {
                icon.className = show ? "bi bi-eye-slash" : "bi bi-eye";
            }
        });
    });

    passwordForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const currentPassword = $("patientProfileCurrentPassword")?.value || "";
        const newPassword = $("patientProfileNewPassword")?.value || "";
        const confirmPassword = $("patientProfileConfirmPassword")?.value || "";

        if (!currentPassword || !newPassword || !confirmPassword) {
            showPasswordMessage("Vui lòng nhập đầy đủ thông tin.", "error");
            return;
        }

        if (newPassword.length < 8) {
            showPasswordMessage(
                "Mật khẩu mới cần có ít nhất 8 ký tự.",
                "error"
            );
            return;
        }

        if (currentPassword === newPassword) {
            showPasswordMessage(
                "Mật khẩu mới cần khác mật khẩu hiện tại.",
                "error"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showPasswordMessage(
                "Mật khẩu xác nhận không khớp.",
                "error"
            );
            return;
        }

        /*
         * Việc xác minh mật khẩu hiện tại và cập nhật mật khẩu
         * phải được thực hiện bởi backend.
         * Không lưu mật khẩu vào JavaScript hoặc trình duyệt.
         */
        showPasswordMessage(
            "Thông tin đã hợp lệ. Cần xác thực với hệ thống để hoàn tất đổi mật khẩu.",
            "success"
        );
    });

    updateProfileSummary();
    setEditing(false);
})();

/* ==========================================
   PATIENT - PHẢN HỒI
========================================== */
(() => {
    const tableBody = document.getElementById("patientFeedbackTableBody");
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);

    const el = {
        total: $("patientFeedbackTotal"),
        pending: $("patientFeedbackPending"),
        answered: $("patientFeedbackAnswered"),
        search: $("patientFeedbackSearch"),
        categoryFilter: $("patientFeedbackCategoryFilter"),
        statusFilter: $("patientFeedbackStatusFilter"),
        reset: $("patientFeedbackResetBtn"),
        emptyReset: $("patientFeedbackEmptyResetBtn"),
        empty: $("patientFeedbackEmpty"),
        resultCount: $("patientFeedbackResultCount"),
        pagination: $("patientFeedbackPagination"),
        exportBtn: $("patientFeedbackExportBtn"),
        newBtn: $("patientFeedbackNewBtn"),
        supportBtn: $("patientFeedbackSupportBtn"),
        formModal: $("patientFeedbackFormModal"),
        detailModal: $("patientFeedbackDetailModal"),
        form: $("patientFeedbackForm"),
        formTitle: $("patientFeedbackFormTitle"),
        category: $("patientFeedbackCategory"),
        appointment: $("patientFeedbackRelatedAppointment"),
        content: $("patientFeedbackContent"),
        charCount: $("patientFeedbackCharCount"),
        formMessage: $("patientFeedbackFormMessage"),
        detailContent: $("patientFeedbackDetailContent"),
        toast: $("patientFeedbackToast"),
        toastMessage: $("patientFeedbackToastMessage")
    };

    const pageSize = 6;
    let currentPage = 1;
    let selectedFeedbackId = null;
    let toastTimer;

    const pad = (number) => String(number).padStart(2, "0");

    const todayKey = () => {
        const date = new Date();
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const formatDate = (value) => {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);

    /*
       Dữ liệu hiển thị ban đầu để kiểm tra giao diện.
       Khi tích hợp backend, thay bằng dữ liệu phản hồi của
       tài khoản bệnh nhân đang đăng nhập.
    */
    const feedbacks = [
        {
            id: "PH000125",
            category: "Đặt lịch",
            content: "Tôi muốn được hướng dẫn rõ hơn về cách kiểm tra lịch hẹn sau khi đặt thành công.",
            appointment: "LH000128",
            rating: 4,
            date: "2026-10-18",
            status: "answered",
            reply: "MedCare ghi nhận ý kiến của bạn. Bạn có thể theo dõi trạng thái và thông tin lịch hẹn tại mục Lịch hẹn của tôi."
        },
        {
            id: "PH000124",
            category: "Cơ sở vật chất",
            content: "Khu vực chờ khám cần được bổ sung thêm hướng dẫn chỉ đường đến các phòng khám.",
            appointment: "",
            rating: 4,
            date: "2026-10-16",
            status: "pending",
            reply: ""
        },
        {
            id: "PH000123",
            category: "Dịch vụ khám",
            content: "Tôi mong muốn có thêm thông tin về các bước cần chuẩn bị trước khi đến khám.",
            appointment: "LH000119",
            rating: 5,
            date: "2026-10-12",
            status: "answered",
            reply: "Cảm ơn bạn đã đóng góp ý kiến. Bạn vui lòng mang theo giấy tờ tùy thân, thông tin bảo hiểm (nếu có) và các kết quả khám liên quan."
        },
        {
            id: "PH000122",
            category: "Hệ thống",
            content: "Tôi muốn giao diện hiển thị thông báo rõ ràng hơn sau khi cập nhật thông tin cá nhân.",
            appointment: "",
            rating: 3,
            date: "2026-10-09",
            status: "pending",
            reply: ""
        }
    ];

    function showToast(message) {
        if (!el.toast || !el.toastMessage) return;

        el.toastMessage.textContent = message;
        el.toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.toast.classList.remove("show");
        }, 2700);
    }

    function getStatusInfo(status) {
        if (status === "answered") {
            return {
                label: "Đã phản hồi",
                icon: "bi-check-circle-fill",
                className: "status-answered"
            };
        }

        return {
            label: "Đang xử lý",
            icon: "bi-hourglass-split",
            className: "status-pending"
        };
    }

    function getCategoryIcon(category) {
        const icons = {
            "Dịch vụ khám": "bi-heart-pulse",
            "Đặt lịch": "bi-calendar-check",
            "Cơ sở vật chất": "bi-building",
            "Nhân viên y tế": "bi-person-badge",
            "Hệ thống": "bi-gear",
            "Khác": "bi-chat-square-text"
        };

        return icons[category] || "bi-chat-square-text";
    }

    function getFilteredFeedbacks() {
        const keyword = (el.search?.value || "").trim().toLocaleLowerCase("vi");
        const category = el.categoryFilter?.value || "";
        const status = el.statusFilter?.value || "";

        return feedbacks
            .filter((item) => {
                const matchesKeyword =
                    !keyword ||
                    item.id.toLocaleLowerCase("vi").includes(keyword) ||
                    item.content.toLocaleLowerCase("vi").includes(keyword) ||
                    item.category.toLocaleLowerCase("vi").includes(keyword);

                const matchesCategory = !category || item.category === category;
                const matchesStatus = !status || item.status === status;

                return matchesKeyword && matchesCategory && matchesStatus;
            })
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    }

    function renderStats() {
        if (el.total) el.total.textContent = feedbacks.length;

        if (el.pending) {
            el.pending.textContent = feedbacks.filter(
                (item) => item.status === "pending"
            ).length;
        }

        if (el.answered) {
            el.answered.textContent = feedbacks.filter(
                (item) => item.status === "answered"
            ).length;
        }
    }

    function renderPagination(totalItems) {
        if (!el.pagination) return;

        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        el.pagination.innerHTML = `
            <button type="button" data-page="prev" aria-label="Trang trước"
                ${currentPage <= 1 ? "disabled" : ""}>
                <i class="bi bi-chevron-left"></i>
            </button>

            ${Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return `
                    <button type="button"
                        data-page="${page}"
                        class="${page === currentPage ? "active" : ""}"
                        aria-label="Trang ${page}"
                        ${page === currentPage ? 'aria-current="page"' : ""}>
                        ${page}
                    </button>
                `;
            }).join("")}

            <button type="button" data-page="next" aria-label="Trang tiếp theo"
                ${currentPage >= totalPages ? "disabled" : ""}>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;
    }

    function renderTable() {
        const filtered = getFilteredFeedbacks();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

        currentPage = Math.max(1, Math.min(currentPage, totalPages));

        const start = (currentPage - 1) * pageSize;
        const rows = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = rows.map((item) => {
            const status = getStatusInfo(item.status);

            const shortContent = item.content.length > 100
                ? `${item.content.slice(0, 100)}…`
                : item.content;

            return `
                <tr>
                    <td>
                        <span class="patient-feedback-code">${escapeHTML(item.id)}</span>
                    </td>

                    <td>
                        <span class="patient-feedback-category">
                            <i class="bi ${getCategoryIcon(item.category)}"></i>
                            ${escapeHTML(item.category)}
                        </span>
                    </td>

                    <td>
                        <div class="patient-feedback-content-preview">
                            ${escapeHTML(shortContent)}
                        </div>
                    </td>

                    <td>
                        <span class="patient-feedback-date">
                            ${escapeHTML(formatDate(item.date))}
                        </span>
                    </td>

                    <td>
                        <span class="patient-feedback-status ${status.className}">
                            <i class="bi ${status.icon}"></i>
                            ${status.label}
                        </span>
                    </td>

                    <td>
                        <div class="patient-feedback-actions">
                            <button type="button"
                                class="patient-feedback-action"
                                data-feedback-action="detail"
                                data-id="${escapeHTML(item.id)}">
                                <i class="bi bi-eye"></i> Chi tiết
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        const table = tableBody.closest("table");
        if (table) table.classList.toggle("d-none", filtered.length === 0);

        if (el.empty) {
            el.empty.classList.toggle("d-none", filtered.length > 0);
        }

        if (el.resultCount) {
            el.resultCount.textContent =
                `Hiển thị ${rows.length} / ${filtered.length} phản hồi`;
        }

        renderPagination(filtered.length);
        renderStats();
    }

    function render() {
        currentPage = 1;
        renderTable();
    }

    function showFormMessage(message, type) {
        if (!el.formMessage) return;

        el.formMessage.textContent = message;
        el.formMessage.className =
            `patient-feedback-form-message show ${type}`;
    }

    function clearFormMessage() {
        if (!el.formMessage) return;

        el.formMessage.textContent = "";
        el.formMessage.className = "patient-feedback-form-message";
    }

    function openFeedbackForm(category = "") {
        if (!el.form || !el.formModal) return;

        selectedFeedbackId = null;
        el.form.reset();

        if (el.category) el.category.value = category;
        if (el.charCount) el.charCount.textContent = "0/1500";

        if (el.formTitle) el.formTitle.textContent = "Gửi phản hồi";

        const submitBtn = $("patientFeedbackSubmitBtn");
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-send"></i> Gửi phản hồi';
        }

        clearFormMessage();
        el.form.classList.remove("was-validated");

        if (window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(el.formModal).show();
        }
    }

    function openFeedbackDetail(id) {
        const item = feedbacks.find((feedback) => feedback.id === id);
        if (!item || !el.detailContent || !el.detailModal) return;

        const status = getStatusInfo(item.status);
        const stars = item.rating
            ? "★".repeat(item.rating) + "☆".repeat(5 - item.rating)
            : "Chưa đánh giá";

        el.detailContent.innerHTML = `
            <div class="patient-feedback-detail-grid">
                <div class="patient-feedback-detail-item">
                    <span>Mã phản hồi</span>
                    <strong>${escapeHTML(item.id)}</strong>
                </div>

                <div class="patient-feedback-detail-item">
                    <span>Ngày gửi</span>
                    <strong>${escapeHTML(formatDate(item.date))}</strong>
                </div>

                <div class="patient-feedback-detail-item">
                    <span>Chủ đề</span>
                    <strong>${escapeHTML(item.category)}</strong>
                </div>

                <div class="patient-feedback-detail-item">
                    <span>Trạng thái</span>
                    <strong>
                        <span class="patient-feedback-status ${status.className}">
                            <i class="bi ${status.icon}"></i>
                            ${status.label}
                        </span>
                    </strong>
                </div>

                <div class="patient-feedback-detail-item">
                    <span>Mức độ hài lòng</span>
                    <strong style="color:#d49a2d;letter-spacing:1px">
                        ${escapeHTML(stars)}
                    </strong>
                </div>

                <div class="patient-feedback-detail-item">
                    <span>Mã lịch hẹn</span>
                    <strong>${escapeHTML(item.appointment || "Không có")}</strong>
                </div>

                <div class="patient-feedback-detail-item full">
                    <span>Nội dung phản hồi</span>
                    <p>${escapeHTML(item.content)}</p>
                </div>
            </div>

            ${item.reply ? `
                <div class="patient-feedback-reply">
                    <h4><i class="bi bi-chat-left-text"></i> Phản hồi từ MedCare</h4>
                    <p>${escapeHTML(item.reply)}</p>
                </div>
            ` : `
                <div class="patient-feedback-reply">
                    <h4><i class="bi bi-hourglass-split"></i> Đang tiếp nhận</h4>
                    <p>Ý kiến của bạn đang được tiếp nhận và chờ phản hồi.</p>
                </div>
            `}
        `;

        if (window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(el.detailModal).show();
        }
    }

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-feedback-action]");
        if (!button) return;

        if (button.dataset.feedbackAction === "detail") {
            openFeedbackDetail(button.dataset.id);
        }
    });

    el.newBtn?.addEventListener("click", () => openFeedbackForm());

    el.supportBtn?.addEventListener("click", () => {
        openFeedbackForm("Khác");
    });

    el.content?.addEventListener("input", () => {
        if (el.charCount) {
            el.charCount.textContent = `${el.content.value.length}/1500`;
        }
    });

    el.form?.addEventListener("submit", (event) => {
        event.preventDefault();

        clearFormMessage();
        el.form.classList.add("was-validated");

        if (!el.form.checkValidity()) {
            el.form.reportValidity();
            return;
        }

        const category = el.category?.value || "";
        const content = el.content?.value.trim() || "";
        const appointment = el.appointment?.value.trim() || "";
        const ratingInput = document.querySelector(
            'input[name="feedbackRating"]:checked'
        );

        if (content.length < 10) {
            showFormMessage(
                "Nội dung phản hồi cần có ít nhất 10 ký tự.",
                "error"
            );
            el.content?.focus();
            return;
        }

        const newIdNumber = feedbacks.reduce((max, item) => {
            const number = Number(item.id.replace(/\D/g, ""));
            return Math.max(max, number || 0);
        }, 0) + 1;

        const newFeedback = {
            id: `PH${String(newIdNumber).padStart(6, "0")}`,
            category,
            content,
            appointment,
            rating: ratingInput ? Number(ratingInput.value) : 0,
            date: todayKey(),
            status: "pending",
            reply: ""
        };

        feedbacks.unshift(newFeedback);
        render();

        if (el.formModal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(el.formModal).hide();
        }

        showToast("Phản hồi đã được thêm vào danh sách.");
    });

    function resetFilters() {
        if (el.search) el.search.value = "";
        if (el.categoryFilter) el.categoryFilter.value = "";
        if (el.statusFilter) el.statusFilter.value = "";

        render();
    }

    el.search?.addEventListener("input", render);
    el.categoryFilter?.addEventListener("change", render);
    el.statusFilter?.addEventListener("change", render);
    el.reset?.addEventListener("click", resetFilters);
    el.emptyReset?.addEventListener("click", resetFilters);

    el.pagination?.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredFeedbacks().length / pageSize)
        );

        const value = button.dataset.page;

        if (value === "prev") {
            currentPage--;
        } else if (value === "next") {
            currentPage++;
        } else {
            currentPage = Number(value);
        }

        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        renderTable();
    });

    el.exportBtn?.addEventListener("click", () => {
        const rows = getFilteredFeedbacks();

        if (!rows.length) {
            showToast("Không có phản hồi để xuất.");
            return;
        }

        const csvCell = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvRows = [
            [
                "Mã phản hồi",
                "Chủ đề",
                "Nội dung",
                "Mã lịch hẹn",
                "Mức độ hài lòng",
                "Ngày gửi",
                "Trạng thái",
                "Phản hồi từ MedCare"
            ],
            ...rows.map((item) => [
                item.id,
                item.category,
                item.content,
                item.appointment,
                item.rating || "",
                formatDate(item.date),
                getStatusInfo(item.status).label,
                item.reply
            ])
        ];

        const csv = "\uFEFF" + csvRows
            .map((row) => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `lich-su-phan-hoi-${todayKey()}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showToast("Đã xuất danh sách phản hồi.");
    });

    render();
})();
