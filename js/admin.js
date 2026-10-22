
document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("doctorTableBody");

    // Các trang admin khác không cần chạy chức năng quản lý bác sĩ.
    if (!tableBody) return;

    const STORAGE_KEY = "hospitalBooking_admin_doctors_v1";
    const PAGE_SIZE = 5;

    const initialDoctors = [
        {
            id: "BS001",
            name: "Trần Hoàng Nam",
            specialty: "Tim mạch",
            email: "nam.tran@medcare.vn",
            phone: "0901234238",
            status: "active"
        },
        {
            id: "BS002",
            name: "Nguyễn Ngọc Lan",
            specialty: "Nội tổng quát",
            email: "lan.nguyen@medcare.vn",
            phone: "0912345456",
            status: "active"
        },
        {
            id: "BS003",
            name: "Lê Minh Tuấn",
            specialty: "Nhi khoa",
            email: "tuan.le@medcare.vn",
            phone: "0934567761",
            status: "active"
        },
        {
            id: "BS004",
            name: "Phạm Thu Trang",
            specialty: "Da liễu",
            email: "trang.pham@medcare.vn",
            phone: "0987654324",
            status: "active"
        },
        {
            id: "BS005",
            name: "Võ Thanh Hùng",
            specialty: "Răng hàm mặt",
            email: "hung.vo@medcare.vn",
            phone: "0965123812",
            status: "active"
        },
        {
            id: "BS006",
            name: "Đặng Mai Phương",
            specialty: "Tai mũi họng",
            email: "phuong.dang@medcare.vn",
            phone: "0978123456",
            status: "inactive"
        }
    ];

    const $ = (id) => document.getElementById(id);

    let doctors = loadDoctors();
    let currentPage = 1;
    let editingId = null;

    const doctorModal = bootstrap.Modal.getOrCreateInstance($("doctorModal"));
    const detailModal = bootstrap.Modal.getOrCreateInstance($("doctorDetailModal"));

    function loadDoctors() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.warn("Không thể đọc danh sách bác sĩ:", error);
        }

        return initialDoctors.map(doctor => ({ ...doctor }));
    }

    function saveDoctors() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
        } catch (error) {
            alert("Không thể lưu dữ liệu trên trình duyệt này.");
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };
            return entities[char];
        });
    }

    function getStatusLabel(status) {
        return status === "active" ? "Đang làm việc" : "Tạm nghỉ";
    }

    function getFilteredDoctors() {
        const keyword = $("doctorSearch").value.trim().toLocaleLowerCase("vi");
        const specialty = $("specialtyFilter").value;
        const status = $("doctorStatusFilter").value;

        return doctors.filter(function (doctor) {
            const searchable = [
                doctor.id,
                doctor.name,
                doctor.email,
                doctor.phone,
                doctor.specialty
            ].join(" ").toLocaleLowerCase("vi");

            return (!keyword || searchable.includes(keyword))
                && (!specialty || doctor.specialty === specialty)
                && (!status || doctor.status === status);
        });
    }

    function updateStatistics() {
        $("totalDoctors").textContent = doctors.length;
        $("activeDoctors").textContent =
            doctors.filter(doctor => doctor.status === "active").length;

        $("specialtyCount").textContent =
            new Set(doctors.map(doctor => doctor.specialty)).size;
    }

    function renderPagination(totalPages) {
        const container = $("doctorPagination");
        container.replaceChildren();

        function addButton(label, page, disabled, active) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "doctor-page-btn" + (active ? " active" : "");
            button.textContent = label;
            button.disabled = disabled;
            button.setAttribute("aria-label", label);

            button.addEventListener("click", function () {
                currentPage = page;
                renderDoctors();
            });

            container.appendChild(button);
        }

        addButton("‹", Math.max(1, currentPage - 1), currentPage === 1, false);

        for (let page = 1; page <= totalPages; page++) {
            addButton(String(page), page, false, page === currentPage);
        }

        addButton("›", Math.min(totalPages, currentPage + 1),
            currentPage === totalPages, false);
    }

    function renderDoctors() {
        const filtered = getFilteredDoctors();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageDoctors = filtered.slice(start, start + PAGE_SIZE);

        if (pageDoctors.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="bi bi-search d-block mb-2 fs-3"></i>
                        Không tìm thấy bác sĩ phù hợp.
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = pageDoctors.map(function (doctor) {
                const statusClass = doctor.status === "active" ? "active" : "inactive";

                return `
                    <tr>
                        <td><span class="doctor-code">${escapeHTML(doctor.id)}</span></td>
                        <td>
                            <div class="doctor-person">
                                <div class="doctor-person-avatar">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                                <div>
                                    <div class="doctor-person-name">${escapeHTML(doctor.name)}</div>
                                    <div class="doctor-person-subtitle">Bác sĩ chuyên khoa</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="doctor-specialty-tag">${escapeHTML(doctor.specialty)}</span>
                        </td>
                        <td>
                            <div class="doctor-contact">
                                <div>${escapeHTML(doctor.email)}</div>
                                <div>${escapeHTML(doctor.phone)}</div>
                            </div>
                        </td>
                        <td>
                            <span class="doctor-state ${statusClass}">
                                ${getStatusLabel(doctor.status)}
                            </span>
                        </td>
                        <td>
                            <div class="doctor-actions">
                                <button type="button" class="doctor-action-btn"
                                    data-action="view" data-id="${escapeHTML(doctor.id)}"
                                    title="Xem thông tin" aria-label="Xem thông tin">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="doctor-action-btn"
                                    data-action="edit" data-id="${escapeHTML(doctor.id)}"
                                    title="Chỉnh sửa" aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="doctor-action-btn delete"
                                    data-action="delete" data-id="${escapeHTML(doctor.id)}"
                                    title="Xóa bác sĩ" aria-label="Xóa bác sĩ">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            }).join("");
        }

        const first = filtered.length ? start + 1 : 0;
        const last = Math.min(start + PAGE_SIZE, filtered.length);

        $("doctorResultCount").textContent =
            `Hiển thị ${first}–${last} trong ${filtered.length} bác sĩ`;

        renderPagination(totalPages);
        updateStatistics();
    }

    function resetForm() {
        $("doctorForm").reset();
        $("doctorId").value = "";
        editingId = null;
        $("doctorModalTitle").textContent = "Thêm bác sĩ";
        $("saveDoctorBtn").innerHTML = '<i class="bi bi-check-lg"></i> Lưu thông tin';
    }

    function openAddModal() {
        resetForm();
        doctorModal.show();
    }

    function openEditModal(id) {
        const doctor = doctors.find(item => item.id === id);
        if (!doctor) return;

        resetForm();
        editingId = doctor.id;

        $("doctorId").value = doctor.id;
        $("doctorName").value = doctor.name;
        $("doctorSpecialty").value = doctor.specialty;
        $("doctorEmail").value = doctor.email;
        $("doctorPhone").value = doctor.phone;
        $("doctorStatus").value = doctor.status;

        $("doctorModalTitle").textContent = "Chỉnh sửa thông tin bác sĩ";
        $("saveDoctorBtn").innerHTML = '<i class="bi bi-check-lg"></i> Cập nhật';
        doctorModal.show();
    }

    function openDetailModal(id) {
        const doctor = doctors.find(item => item.id === id);
        if (!doctor) return;

        $("doctorDetailContent").innerHTML = `
            <div class="doctor-person mb-3">
                <div class="doctor-person-avatar">
                    <i class="bi bi-person-fill"></i>
                </div>
                <div>
                    <div class="doctor-person-name">${escapeHTML(doctor.name)}</div>
                    <div class="doctor-person-subtitle">${escapeHTML(doctor.id)}</div>
                </div>
            </div>
            <div class="doctor-detail-list">
                <div class="doctor-detail-item">
                    <span class="doctor-detail-label">Chuyên khoa</span>
                    <span class="doctor-detail-value">${escapeHTML(doctor.specialty)}</span>
                </div>
                <div class="doctor-detail-item">
                    <span class="doctor-detail-label">Email</span>
                    <span class="doctor-detail-value">${escapeHTML(doctor.email)}</span>
                </div>
                <div class="doctor-detail-item">
                    <span class="doctor-detail-label">Điện thoại</span>
                    <span class="doctor-detail-value">${escapeHTML(doctor.phone)}</span>
                </div>
                <div class="doctor-detail-item">
                    <span class="doctor-detail-label">Trạng thái</span>
                    <span class="doctor-detail-value">${getStatusLabel(doctor.status)}</span>
                </div>
            </div>`;

        detailModal.show();
    }

    function deleteDoctor(id) {
        const doctor = doctors.find(item => item.id === id);
        if (!doctor) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa hồ sơ ${doctor.name} (${doctor.id}) khỏi danh sách trên trình duyệt này không?`
        );

        if (!confirmed) return;

        doctors = doctors.filter(item => item.id !== id);
        saveDoctors();
        renderDoctors();
    }

    $("addDoctorBtn").addEventListener("click", openAddModal);

    $("doctorForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = $("doctorName").value.trim();
        const specialty = $("doctorSpecialty").value;
        const email = $("doctorEmail").value.trim();
        const phone = $("doctorPhone").value.trim();
        const status = $("doctorStatus").value;

        if (!name || !specialty || !email || !phone) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
            return;
        }

        const duplicateEmail = doctors.some(function (doctor) {
            return doctor.email.toLocaleLowerCase() === email.toLocaleLowerCase()
                && doctor.id !== editingId;
        });

        if (duplicateEmail) {
            alert("Email này đã được sử dụng trong danh sách.");
            $("doctorEmail").focus();
            return;
        }

        if (editingId) {
            const index = doctors.findIndex(doctor => doctor.id === editingId);
            if (index === -1) return;

            doctors[index] = {
                ...doctors[index],
                name,
                specialty,
                email,
                phone,
                status
            };
        } else {
            let nextNumber = 1;

            while (doctors.some(doctor => doctor.id === "BS" + String(nextNumber).padStart(3, "0"))) {
                nextNumber++;
            }

            doctors.push({
                id: "BS" + String(nextNumber).padStart(3, "0"),
                name,
                specialty,
                email,
                phone,
                status
            });
        }

        saveDoctors();
        currentPage = 1;
        renderDoctors();
        doctorModal.hide();
        resetForm();
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteDoctor(id);
    });

    $("doctorSearch").addEventListener("input", function () {
        currentPage = 1;
        renderDoctors();
    });

    $("specialtyFilter").addEventListener("change", function () {
        currentPage = 1;
        renderDoctors();
    });

    $("doctorStatusFilter").addEventListener("change", function () {
        currentPage = 1;
        renderDoctors();
    });

    $("doctorModal").addEventListener("hidden.bs.modal", resetForm);

    $("exportDoctorsBtn").addEventListener("click", function () {
        const rows = getFilteredDoctors();
        const headers = ["Mã bác sĩ", "Họ tên", "Chuyên khoa", "Email", "Điện thoại", "Trạng thái"];

        function csvCell(value) {
            let text = String(value ?? "");

            // Tránh để phần mềm bảng tính diễn giải nội dung thành công thức.
            if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;

            return '"' + text.replace(/"/g, '""') + '"';
        }

        const csv = "\uFEFF" + [
            headers,
            ...rows.map(doctor => [
                doctor.id,
                doctor.name,
                doctor.specialty,
                doctor.email,
                doctor.phone,
                getStatusLabel(doctor.status)
            ])
        ].map(row => row.map(csvCell).join(",")).join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "danh-sach-bac-si.csv";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    });

    renderDoctors();
});


/* ===== QUAN LY BENH NHAN ===== */
document.addEventListener("DOMContentLoaded", function () {
    const $ = id => document.getElementById(id);
    const tableBody = $("patientTableBody");

    // Khong chay module nay tren trang khong co bang benh nhan.
    if (!tableBody) return;

    const STORAGE_KEY = "hospitalBooking_admin_patients_v1";
    const PAGE_SIZE = 5;

    const patientModal = bootstrap.Modal.getOrCreateInstance($("patientModal"));
    const detailModal = bootstrap.Modal.getOrCreateInstance($("patientDetailModal"));

    let patients = loadPatients();
    let currentPage = 1;
    let editingId = null;

    const searchInput = $("patientSearch");
    const genderFilter = $("patientGenderFilter");
    const statusFilter = $("patientStatusFilter");

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function todayISO() {
        const date = new Date();
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 10);
    }

    function loadPatients() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const data = JSON.parse(saved);
                if (Array.isArray(data)) return data;
            }
        } catch (error) {
            console.warn("Khong doc duoc danh sach benh nhan:", error);
        }

        const today = todayISO();

        const initial = [
            ["BN001", "Nguyễn Minh Anh", "0901234567", "minhanh@example.com", "1998-04-12", "Nữ", "Thành phố Hồ Chí Minh", "Đang hoạt động"],
            ["BN002", "Trần Quốc Bảo", "0912345678", "quocbao@example.com", "1992-09-21", "Nam", "Thành phố Hồ Chí Minh", "Đang hoạt động"],
            ["BN003", "Lê Thu Hà", "0987654321", "thuha@example.com", "2000-01-15", "Nữ", "Bình Dương", "Đang hoạt động"],
            ["BN004", "Phạm Hoàng Nam", "0934567890", "hoangnam@example.com", "1987-06-08", "Nam", "Đồng Nai", "Ngừng hoạt động"],
            ["BN005", "Võ Ngọc Lan", "0976543210", "ngoclan@example.com", "1995-11-30", "Nữ", "Thành phố Hồ Chí Minh", "Đang hoạt động"],
            ["BN006", "Đặng Đức Huy", "0961234567", "duchuy@example.com", "2001-03-19", "Nam", "Long An", "Đang hoạt động"]
        ].map(item => ({
            id: item[0],
            fullName: item[1],
            phone: item[2],
            email: item[3],
            birthDate: item[4],
            gender: item[5],
            address: item[6],
            note: "",
            status: item[7],
            createdAt: today,
            hasAppointment: false
        }));

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        } catch (error) {
            console.warn("Khong the khoi tao du lieu benh nhan:", error);
        }

        return initial;
    }

    function savePatients() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
            return true;
        } catch (error) {
            alert("Không thể lưu dữ liệu bệnh nhân trên trình duyệt.");
            return false;
        }
    }

    function formatDate(value) {
        if (!value) return "—";
        const parts = String(value).slice(0, 10).split("-");
        return parts.length === 3
            ? `${parts[2]}/${parts[1]}/${parts[0]}`
            : escapeHTML(value);
    }

    function getFilteredPatients() {
        const keyword = (searchInput?.value || "").trim().toLocaleLowerCase("vi");
        const gender = genderFilter?.value || "";
        const status = statusFilter?.value || "";

        return patients.filter(patient => {
            const content = [
                patient.id,
                patient.fullName,
                patient.phone,
                patient.email,
                patient.address
            ].join(" ").toLocaleLowerCase("vi");

            return (!keyword || content.includes(keyword))
                && (!gender || patient.gender === gender)
                && (!status || patient.status === status);
        });
    }

    function updateStatistics() {
        if ($("totalPatients")) {
            $("totalPatients").textContent = patients.length;
        }

        if ($("activePatients")) {
            $("activePatients").textContent =
                patients.filter(p => p.status === "Đang hoạt động").length;
        }

        if ($("newPatients")) {
            const month = todayISO().slice(0, 7);
            $("newPatients").textContent =
                patients.filter(p => String(p.createdAt || "").startsWith(month)).length;
        }

        if ($("appointmentPatients")) {
            $("appointmentPatients").textContent =
                patients.filter(p => p.hasAppointment).length;
        }
    }

    function renderPagination(totalPages) {
        const container = $("patientPagination");
        if (!container) return;

        container.replaceChildren();

        function addButton(label, page, disabled, active) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "patient-page-btn" + (active ? " active" : "");
            button.textContent = label;
            button.disabled = disabled;

            button.addEventListener("click", () => {
                currentPage = page;
                renderPatients();
            });

            container.appendChild(button);
        }

        addButton("‹", Math.max(1, currentPage - 1), currentPage === 1, false);

        for (let page = 1; page <= totalPages; page++) {
            addButton(String(page), page, false, page === currentPage);
        }

        addButton("›", Math.min(totalPages, currentPage + 1),
            currentPage === totalPages, false);
    }

    function renderPatients() {
        const filtered = getFilteredPatients();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="bi bi-search d-block mb-2 fs-3"></i>
                        Không tìm thấy bệnh nhân phù hợp.
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = pageItems.map(patient => {
                const inactive = patient.status === "Ngừng hoạt động";

                return `
                    <tr>
                        <td><span class="doctor-code">${escapeHTML(patient.id)}</span></td>
                        <td>
                            <div class="doctor-person">
                                <div class="doctor-person-avatar">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                                <div class="patient-name-cell">
                                    <div class="doctor-person-name">${escapeHTML(patient.fullName)}</div>
                                    <div class="doctor-person-subtitle">${escapeHTML(patient.gender || "—")}</div>
                                </div>
                            </div>
                        </td>
                        <td>${escapeHTML(patient.phone || "—")}</td>
                        <td>${escapeHTML(patient.email || "—")}</td>
                        <td>${formatDate(patient.birthDate)}</td>
                        <td>${escapeHTML(patient.address || "—")}</td>
                        <td>
                            <span class="patient-status ${inactive ? "inactive" : "active"}">
                                ${escapeHTML(patient.status)}
                            </span>
                        </td>
                        <td>
                            <div class="patient-actions">
                                <button type="button" class="patient-action-btn"
                                    data-action="view" data-id="${escapeHTML(patient.id)}"
                                    title="Xem chi tiết" aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="patient-action-btn"
                                    data-action="edit" data-id="${escapeHTML(patient.id)}"
                                    title="Chỉnh sửa" aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="patient-action-btn delete"
                                    data-action="delete" data-id="${escapeHTML(patient.id)}"
                                    title="Xóa bệnh nhân" aria-label="Xóa bệnh nhân">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            }).join("");
        }

        const first = filtered.length ? start + 1 : 0;
        const last = Math.min(start + PAGE_SIZE, filtered.length);

        if ($("patientResultCount")) {
            $("patientResultCount").textContent =
                `Hiển thị ${first}–${last} trong ${filtered.length} bệnh nhân`;
        }

        renderPagination(totalPages);
        updateStatistics();
    }

    function resetForm() {
        $("patientForm").reset();
        $("patientId").value = "";
        editingId = null;

        if ($("patientModalTitle")) {
            $("patientModalTitle").textContent = "Thêm bệnh nhân";
        }

        if ($("savePatientBtn")) {
            $("savePatientBtn").innerHTML =
                '<i class="bi bi-check-lg"></i> Lưu thông tin';
        }
    }

    function openAddModal() {
        resetForm();
        patientModal.show();
    }

    function openEditModal(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        resetForm();
        editingId = patient.id;

        $("patientId").value = patient.id;
        $("patientFullName").value = patient.fullName || "";
        $("patientPhone").value = patient.phone || "";
        $("patientEmail").value = patient.email || "";
        $("patientBirthDate").value = patient.birthDate || "";
        $("patientGender").value = patient.gender || "";
        $("patientAddress").value = patient.address || "";
        $("patientNote").value = patient.note || "";
        $("patientStatus").value = patient.status || "Đang hoạt động";

        $("patientModalTitle").textContent = "Chỉnh sửa thông tin bệnh nhân";
        $("savePatientBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật';

        patientModal.show();
    }

    function openDetailModal(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        $("patientDetailTitle").textContent = patient.fullName;

        $("patientDetailContent").innerHTML = `
            <div class="patient-detail-grid">
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Mã bệnh nhân</div>
                    <div class="patient-detail-value">${escapeHTML(patient.id)}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Họ và tên</div>
                    <div class="patient-detail-value">${escapeHTML(patient.fullName)}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Số điện thoại</div>
                    <div class="patient-detail-value">${escapeHTML(patient.phone || "—")}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Email</div>
                    <div class="patient-detail-value">${escapeHTML(patient.email || "—")}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Ngày sinh</div>
                    <div class="patient-detail-value">${formatDate(patient.birthDate)}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Giới tính</div>
                    <div class="patient-detail-value">${escapeHTML(patient.gender || "—")}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Địa chỉ</div>
                    <div class="patient-detail-value">${escapeHTML(patient.address || "—")}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Trạng thái</div>
                    <div class="patient-detail-value">${escapeHTML(patient.status)}</div>
                </div>
                <div class="patient-detail-item">
                    <div class="patient-detail-label">Ghi chú</div>
                    <div class="patient-detail-value">${escapeHTML(patient.note || "Không có")}</div>
                </div>
            </div>`;

        detailModal.show();
    }

    function deletePatient(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        if (!confirm(`Bạn có chắc muốn xóa hồ sơ ${patient.fullName} (${patient.id}) không?`)) {
            return;
        }

        const previous = patients;
        patients = patients.filter(p => p.id !== id);

        if (!savePatients()) {
            patients = previous;
            return;
        }

        renderPatients();
    }

    function getNextId() {
        let number = 1;

        while (patients.some(p => p.id === "BN" + String(number).padStart(3, "0"))) {
            number++;
        }

        return "BN" + String(number).padStart(3, "0");
    }

    $("btnAddPatient")?.addEventListener("click", openAddModal);

    $("patientForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = $("patientFullName").value.trim();
        const phone = $("patientPhone").value.trim();
        const email = $("patientEmail").value.trim();
        const birthDate = $("patientBirthDate").value;
        const gender = $("patientGender").value;
        const address = $("patientAddress").value.trim();
        const note = $("patientNote").value.trim();
        const status = $("patientStatus").value;

        if (!fullName || !phone || !gender || !status) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
            return;
        }

        const duplicatePhone = patients.some(p =>
            p.phone === phone && p.id !== editingId
        );

        if (duplicatePhone) {
            alert("Số điện thoại này đã tồn tại trong danh sách.");
            $("patientPhone").focus();
            return;
        }

        if (email) {
            const duplicateEmail = patients.some(p =>
                String(p.email || "").toLowerCase() === email.toLowerCase()
                && p.id !== editingId
            );

            if (duplicateEmail) {
                alert("Email này đã tồn tại trong danh sách.");
                $("patientEmail").focus();
                return;
            }
        }

        if (birthDate && birthDate > todayISO()) {
            alert("Ngày sinh không được lớn hơn ngày hiện tại.");
            $("patientBirthDate").focus();
            return;
        }

        const previous = patients.map(p => ({ ...p }));

        if (editingId) {
            const index = patients.findIndex(p => p.id === editingId);
            if (index < 0) return;

            patients[index] = {
                ...patients[index],
                fullName,
                phone,
                email,
                birthDate,
                gender,
                address,
                note,
                status
            };
        } else {
            patients.push({
                id: getNextId(),
                fullName,
                phone,
                email,
                birthDate,
                gender,
                address,
                note,
                status,
                createdAt: todayISO(),
                hasAppointment: false
            });
        }

        if (!savePatients()) {
            patients = previous;
            return;
        }

        currentPage = 1;
        renderPatients();
        patientModal.hide();
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.action === "view") openDetailModal(id);
        if (button.dataset.action === "edit") openEditModal(id);
        if (button.dataset.action === "delete") deletePatient(id);
    });

    searchInput?.addEventListener("input", function () {
        currentPage = 1;
        renderPatients();
    });

    genderFilter?.addEventListener("change", function () {
        currentPage = 1;
        renderPatients();
    });

    statusFilter?.addEventListener("change", function () {
        currentPage = 1;
        renderPatients();
    });

    $("patientModal").addEventListener("hidden.bs.modal", resetForm);

    $("btnExportPatients")?.addEventListener("click", function () {
        const rows = getFilteredPatients();
        const headers = [
            "Mã bệnh nhân", "Họ và tên", "Số điện thoại", "Email",
            "Ngày sinh", "Giới tính", "Địa chỉ", "Trạng thái", "Ghi chú"
        ];

        function csvCell(value) {
            let text = String(value ?? "");

            if (/^[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }

        const csv = "\uFEFF" + [
            headers,
            ...rows.map(p => [
                p.id, p.fullName, p.phone, p.email, p.birthDate,
                p.gender, p.address, p.status, p.note
            ])
        ].map(row => row.map(csvCell).join(",")).join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-benh-nhan.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    renderPatients();
});

/* ==========================================
   QUAN LY CHUYEN KHOA - MEDCARE
   Them vao cuoi file admin.js
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    const $ = id => document.getElementById(id);

    const tableBody = $("specialtyTableBody");
    if (!tableBody) return;

    const STORAGE_KEY = "hospitalBooking_admin_specialties_v1";
    const PAGE_SIZE = 5;

    const specialtyModal = bootstrap.Modal.getOrCreateInstance(
        $("specialtyModal")
    );

    const detailModal = bootstrap.Modal.getOrCreateInstance(
        $("specialtyDetailModal")
    );

    const defaultSpecialties = [
        {
            id: "CK001",
            code: "CK001",
            name: "Tim mạch",
            description: "Khám, chẩn đoán và điều trị các bệnh lý tim mạch.",
            status: "active",
            doctorCount: 5
        },
        {
            id: "CK002",
            code: "CK002",
            name: "Nhi khoa",
            description: "Chăm sóc sức khỏe, khám và điều trị bệnh cho trẻ em.",
            status: "active",
            doctorCount: 4
        },
        {
            id: "CK003",
            code: "CK003",
            name: "Da liễu",
            description: "Khám và điều trị các bệnh về da, tóc và móng.",
            status: "active",
            doctorCount: 3
        },
        {
            id: "CK004",
            code: "CK004",
            name: "Cơ xương khớp",
            description: "Chẩn đoán và điều trị các bệnh lý cơ, xương và khớp.",
            status: "active",
            doctorCount: 4
        },
        {
            id: "CK005",
            code: "CK005",
            name: "Tai Mũi Họng",
            description: "Khám và điều trị các bệnh lý tai, mũi, họng.",
            status: "active",
            doctorCount: 3
        },
        {
            id: "CK006",
            code: "CK006",
            name: "Nội tổng quát",
            description: "Khám sức khỏe tổng quát và điều trị bệnh nội khoa.",
            status: "inactive",
            doctorCount: 2
        },
        {
            id: "CK007",
            code: "CK007",
            name: "Sản phụ khoa",
            description: "Chăm sóc sức khỏe sinh sản và theo dõi thai kỳ.",
            status: "active",
            doctorCount: 3
        }
    ];

    function loadSpecialties() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === null) {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(defaultSpecialties)
                );

                return [...defaultSpecialties];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                throw new Error("Dữ liệu chuyên khoa không hợp lệ.");
            }

            return parsed;
        } catch (error) {
            console.error("Không thể đọc dữ liệu chuyên khoa:", error);
            alert("Không thể đọc dữ liệu chuyên khoa trong trình duyệt.");
            return [];
        }
    }

    let specialties = loadSpecialties();
    let currentPage = 1;

    function saveSpecialties() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(specialties)
            );
            return true;
        } catch (error) {
            console.error("Không thể lưu chuyên khoa:", error);
            alert("Không thể lưu dữ liệu. Vui lòng kiểm tra bộ nhớ trình duyệt.");
            return false;
        }
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

    function normalize(value) {
        return String(value ?? "")
            .normalize("NFC")
            .trim()
            .toLocaleLowerCase("vi");
    }

    function getFilteredSpecialties() {
        const keyword = normalize($("specialtySearch").value);
        const status = $("specialtyStatusFilter").value;

        return specialties.filter(specialty => {
            const matchesKeyword = [
                specialty.code,
                specialty.name,
                specialty.description
            ].some(value => normalize(value).includes(keyword));

            const matchesStatus =
                !status || specialty.status === status;

            return matchesKeyword && matchesStatus;
        });
    }

    function updateStatistics() {
        $("totalSpecialties").textContent = specialties.length;

        $("activeSpecialties").textContent = specialties.filter(
            item => item.status === "active"
        ).length;

        $("inactiveSpecialties").textContent = specialties.filter(
            item => item.status === "inactive"
        ).length;

        $("specialtyDoctorCount").textContent = specialties.reduce(
            (total, item) => total + Math.max(0, Number(item.doctorCount) || 0),
            0
        );
    }

    function renderTable() {
        const filtered = getFilteredSpecialties();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="specialty-empty">
                        <i class="bi bi-search"></i>
                        Không tìm thấy chuyên khoa phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageItems.map(specialty => {
                const statusClass =
                    specialty.status === "active" ? "active" : "inactive";

                const statusText =
                    specialty.status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động";

                return `
                    <tr>
                        <td>
                            <span class="specialty-code">
                                ${escapeHTML(specialty.code)}
                            </span>
                        </td>

                        <td class="specialty-name-cell">
                            <div class="specialty-name">
                                ${escapeHTML(specialty.name)}
                            </div>
                        </td>

                        <td>
                            <div class="specialty-description">
                                ${escapeHTML(specialty.description || "Chưa có mô tả")}
                            </div>
                        </td>

                        <td>
                            <span class="specialty-doctor-count">
                                ${Math.max(0, Number(specialty.doctorCount) || 0)}
                            </span>
                        </td>

                        <td>
                            <span class="specialty-status ${statusClass}">
                                ${statusText}
                            </span>
                        </td>

                        <td>
                            <div class="specialty-actions">
                                <button type="button"
                                    class="specialty-action-btn"
                                    data-action="view"
                                    data-id="${escapeHTML(specialty.id)}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button"
                                    class="specialty-action-btn edit"
                                    data-action="edit"
                                    data-id="${escapeHTML(specialty.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button type="button"
                                    class="specialty-action-btn delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(specialty.id)}"
                                    title="Xóa chuyên khoa"
                                    aria-label="Xóa chuyên khoa">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        $("specialtyResultCount").textContent = filtered.length
            ? `Hiển thị ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} trong ${filtered.length} chuyên khoa`
            : "Hiển thị 0 chuyên khoa";

        renderPagination(totalPages);
        updateStatistics();
    }

    function renderPagination(totalPages) {
        const container = $("specialtyPagination");

        let html = `
            <button type="button"
                class="specialty-page-btn"
                data-page="${currentPage - 1}"
                ${currentPage <= 1 ? "disabled" : ""}
                aria-label="Trang trước">
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button type="button"
                    class="specialty-page-btn ${page === currentPage ? "active" : ""}"
                    data-page="${page}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;
        }

        html += `
            <button type="button"
                class="specialty-page-btn"
                data-page="${currentPage + 1}"
                ${currentPage >= totalPages ? "disabled" : ""}
                aria-label="Trang sau">
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    function resetForm() {
        $("specialtyForm").reset();
        $("specialtyId").value = "";
        $("specialtyStatus").value = "active";
        $("specialtyModalTitle").textContent = "Thêm chuyên khoa";
        $("saveSpecialtyBtn").innerHTML =
            '<i class="bi bi-check-lg me-1"></i> Lưu thông tin';
    }

    function openAddModal() {
        resetForm();
        $("specialtyCode").readOnly = false;
        specialtyModal.show();
    }

    function openEditModal(id) {
        const specialty = specialties.find(item => item.id === id);
        if (!specialty) return;

        resetForm();

        $("specialtyId").value = specialty.id;
        $("specialtyCode").value = specialty.code;
        $("specialtyName").value = specialty.name;
        $("specialtyDescription").value = specialty.description || "";
        $("specialtyStatus").value = specialty.status;

        // Giữ mã chuyên khoa cố định khi chỉnh sửa.
        $("specialtyCode").readOnly = true;
        $("specialtyModalTitle").textContent = "Chỉnh sửa chuyên khoa";

        $("saveSpecialtyBtn").innerHTML =
            '<i class="bi bi-check-lg me-1"></i> Cập nhật';

        specialtyModal.show();
    }

    function openDetailModal(id) {
        const specialty = specialties.find(item => item.id === id);
        if (!specialty) return;

        const statusText = specialty.status === "active"
            ? "Đang hoạt động"
            : "Ngừng hoạt động";

        $("specialtyDetailTitle").textContent = specialty.name;

        $("specialtyDetailContent").innerHTML = `
            <div class="specialty-detail-grid">
                <div class="specialty-detail-item">
                    <div class="specialty-detail-label">Mã chuyên khoa</div>
                    <div class="specialty-detail-value">
                        ${escapeHTML(specialty.code)}
                    </div>
                </div>

                <div class="specialty-detail-item">
                    <div class="specialty-detail-label">Trạng thái</div>
                    <div class="specialty-detail-value">
                        <span class="specialty-status ${specialty.status === "active" ? "active" : "inactive"}">
                            ${statusText}
                        </span>
                    </div>
                </div>

                <div class="specialty-detail-item">
                    <div class="specialty-detail-label">Số bác sĩ</div>
                    <div class="specialty-detail-value">
                        ${Math.max(0, Number(specialty.doctorCount) || 0)} bác sĩ
                    </div>
                </div>

                <div class="specialty-detail-item full">
                    <div class="specialty-detail-label">Mô tả chuyên khoa</div>
                    <div class="specialty-detail-value">
                        ${escapeHTML(specialty.description || "Chưa có mô tả")}
                    </div>
                </div>
            </div>
        `;

        detailModal.show();
    }

    function deleteSpecialty(id) {
        const specialty = specialties.find(item => item.id === id);
        if (!specialty) return;

        if (!confirm(
            `Bạn có chắc muốn xóa chuyên khoa "${specialty.name}" không?`
        )) {
            return;
        }

        const oldSpecialties = [...specialties];
        specialties = specialties.filter(item => item.id !== id);

        if (!saveSpecialties()) {
            specialties = oldSpecialties;
            return;
        }

        renderTable();
    }

    $("specialtyForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const id = $("specialtyId").value.trim();
        const code = $("specialtyCode").value.trim().toUpperCase();
        const name = $("specialtyName").value.trim();
        const description = $("specialtyDescription").value.trim();
        const status = $("specialtyStatus").value;

        if (!code || !name) {
            alert("Vui lòng nhập mã và tên chuyên khoa.");
            return;
        }

        const duplicatedCode = specialties.some(item =>
            item.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi")
            && item.id !== id
        );

        if (duplicatedCode) {
            alert("Mã chuyên khoa đã tồn tại. Vui lòng nhập mã khác.");
            $("specialtyCode").focus();
            return;
        }

        const duplicatedName = specialties.some(item =>
            normalize(item.name) === normalize(name)
            && item.id !== id
        );

        if (duplicatedName) {
            alert("Tên chuyên khoa đã tồn tại. Vui lòng kiểm tra lại.");
            $("specialtyName").focus();
            return;
        }

        const oldSpecialties = [...specialties];

        if (id) {
            const index = specialties.findIndex(item => item.id === id);
            if (index === -1) return;

            specialties[index] = {
                ...specialties[index],
                code,
                name,
                description,
                status
            };
        } else {
            const newId = "CK_" + Date.now();

            specialties.unshift({
                id: newId,
                code,
                name,
                description,
                status,
                doctorCount: 0
            });

            currentPage = 1;
        }

        if (!saveSpecialties()) {
            specialties = oldSpecialties;
            return;
        }

        specialtyModal.hide();
        renderTable();
    });

    $("btnAddSpecialty").addEventListener("click", openAddModal);

    $("specialtySearch").addEventListener("input", function () {
        currentPage = 1;
        renderTable();
    });

    $("specialtyStatusFilter").addEventListener("change", function () {
        currentPage = 1;
        renderTable();
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteSpecialty(id);
    });

    $("specialtyPagination").addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        const page = Number(button.dataset.page);
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredSpecialties().length / PAGE_SIZE)
        );

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderTable();
    });

    $("btnExportSpecialties").addEventListener("click", function () {
        const items = getFilteredSpecialties();

        if (items.length === 0) {
            alert("Không có dữ liệu chuyên khoa để xuất.");
            return;
        }

        const csvCell = value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"';

        const rows = [
            [
                "Mã chuyên khoa",
                "Tên chuyên khoa",
                "Mô tả",
                "Số bác sĩ",
                "Trạng thái"
            ],
            ...items.map(item => [
                item.code,
                item.name,
                item.description || "",
                Math.max(0, Number(item.doctorCount) || 0),
                item.status === "active"
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"
            ])
        ];

        // BOM giúp Excel hiển thị tiếng Việt đúng.
        const csv = "\uFEFF" + rows
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-chuyen-khoa.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    });

    $("specialtyModal").addEventListener("hidden.bs.modal", resetForm);

    renderTable();
});
/* QUAN LY PHONG KHAM - MEDCARE */
document.addEventListener("DOMContentLoaded", function () {
    const $ = id => document.getElementById(id);

    const tableBody = $("clinicTableBody");
    if (!tableBody) return;

    const STORAGE_KEY = "hospitalBooking_admin_clinics_v1";
    const PAGE_SIZE = 5;

    const clinicModal = bootstrap.Modal.getOrCreateInstance($("clinicModal"));
    const detailModal = bootstrap.Modal.getOrCreateInstance($("clinicDetailModal"));

    let currentPage = 1;

    const seedClinics = [
        {
            id: "1",
            code: "PK001",
            name: "Phòng khám Tim mạch",
            specialty: "Tim mạch",
            location: "Tầng 2 - Khu A",
            capacity: 2,
            description: "Phòng khám và tư vấn các bệnh lý tim mạch.",
            status: "active"
        },
        {
            id: "2",
            code: "PK002",
            name: "Phòng khám Nội tổng quát",
            specialty: "Nội tổng quát",
            location: "Tầng 1 - Khu A",
            capacity: 3,
            description: "Khám tổng quát và theo dõi sức khỏe người bệnh.",
            status: "active"
        },
        {
            id: "3",
            code: "PK003",
            name: "Phòng khám Nhi khoa",
            specialty: "Nhi khoa",
            location: "Tầng 1 - Khu B",
            capacity: 2,
            description: "Tiếp nhận khám và tư vấn sức khỏe trẻ em.",
            status: "active"
        },
        {
            id: "4",
            code: "PK004",
            name: "Phòng khám Da liễu",
            specialty: "Da liễu",
            location: "Tầng 2 - Khu B",
            capacity: 2,
            description: "Khám và tư vấn các vấn đề về da.",
            status: "active"
        },
        {
            id: "5",
            code: "PK005",
            name: "Phòng khám Răng hàm mặt",
            specialty: "Răng hàm mặt",
            location: "Tầng 3 - Khu A",
            capacity: 2,
            description: "Khám và tư vấn sức khỏe răng miệng.",
            status: "inactive"
        },
        {
            id: "6",
            code: "PK006",
            name: "Phòng khám Tai mũi họng",
            specialty: "Tai mũi họng",
            location: "Tầng 3 - Khu B",
            capacity: 2,
            description: "Khám các bệnh lý tai, mũi và họng.",
            status: "active"
        }
    ];

    function loadClinics() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(seedClinics));
                return [...seedClinics];
            }

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [...seedClinics];
        } catch (error) {
            console.error("Không thể tải danh sách phòng khám:", error);
            return [...seedClinics];
        }
    }

    let clinics = loadClinics();

    function saveClinics() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function statusHTML(status) {
        if (status === "active") {
            return '<span class="clinic-status active">Đang hoạt động</span>';
        }

        return '<span class="clinic-status inactive">Ngừng hoạt động</span>';
    }

    function getFilteredClinics() {
        const keyword = $("clinicSearch").value.trim().toLocaleLowerCase("vi");
        const specialty = $("clinicSpecialtyFilter").value;
        const status = $("clinicStatusFilter").value;

        return clinics.filter(clinic => {
            const searchable = [
                clinic.code,
                clinic.name,
                clinic.location,
                clinic.specialty
            ].join(" ").toLocaleLowerCase("vi");

            return searchable.includes(keyword)
                && (!specialty || clinic.specialty === specialty)
                && (!status || clinic.status === status);
        });
    }

    function renderStats() {
        $("totalClinics").textContent = clinics.length;
        $("activeClinics").textContent =
            clinics.filter(clinic => clinic.status === "active").length;
        $("inactiveClinics").textContent =
            clinics.filter(clinic => clinic.status === "inactive").length;

        const totalCapacity = clinics.reduce(
            (sum, clinic) => sum + (Number(clinic.capacity) || 0), 0
        );

        $("totalClinicCapacity").textContent = totalCapacity;
    }

    function renderTable() {
        const filtered = getFilteredClinics();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * PAGE_SIZE;
        const visible = filtered.slice(start, start + PAGE_SIZE);

        if (visible.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        Không tìm thấy phòng khám phù hợp.
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = visible.map(clinic => `
                <tr>
                    <td>
                        <span class="clinic-code">${escapeHTML(clinic.code)}</span>
                    </td>
                    <td>
                        <div class="clinic-name">${escapeHTML(clinic.name)}</div>
                    </td>
                    <td>${escapeHTML(clinic.specialty)}</td>
                    <td>
                        <div class="clinic-location">
                            <i class="bi bi-geo-alt"></i>
                            ${escapeHTML(clinic.location)}
                        </div>
                    </td>
                    <td>
                        <span class="clinic-capacity">
                            <i class="bi bi-people"></i>
                            ${Number(clinic.capacity) || 0}
                        </span>
                    </td>
                    <td>${statusHTML(clinic.status)}</td>
                    <td>
                        <div class="clinic-actions">
                            <button type="button"
                                    class="clinic-action-btn view"
                                    data-action="view"
                                    data-id="${escapeHTML(clinic.id)}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button"
                                    class="clinic-action-btn edit"
                                    data-action="edit"
                                    data-id="${escapeHTML(clinic.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button type="button"
                                    class="clinic-action-btn delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(clinic.id)}"
                                    title="Xóa phòng khám"
                                    aria-label="Xóa phòng khám">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        $("clinicResultCount").textContent =
            `Hiển thị ${visible.length} / ${filtered.length} phòng khám`;

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const container = $("clinicPagination");

        if (totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = `
            <button type="button"
                    class="clinic-page-btn"
                    data-page="${currentPage - 1}"
                    ${currentPage === 1 ? "disabled" : ""}
                    aria-label="Trang trước">
                <i class="bi bi-chevron-left"></i>
            </button>`;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button type="button"
                        class="clinic-page-btn ${page === currentPage ? "active" : ""}"
                        data-page="${page}">
                    ${page}
                </button>`;
        }

        html += `
            <button type="button"
                    class="clinic-page-btn"
                    data-page="${currentPage + 1}"
                    ${currentPage === totalPages ? "disabled" : ""}
                    aria-label="Trang sau">
                <i class="bi bi-chevron-right"></i>
            </button>`;

        container.innerHTML = html;
    }

    function renderAll() {
        renderStats();
        renderTable();
    }

    function resetForm() {
        $("clinicForm").reset();
        $("clinicId").value = "";
        $("clinicModalTitle").textContent = "Thêm phòng khám";
        $("saveClinicBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu thông tin';
        $("clinicCapacity").value = 1;
        $("clinicStatus").value = "active";
    }

    function openAddModal() {
        resetForm();
        clinicModal.show();
    }

    function openEditModal(id) {
        const clinic = clinics.find(item => item.id === id);
        if (!clinic) return;

        resetForm();

        $("clinicId").value = clinic.id;
        $("clinicCode").value = clinic.code;
        $("clinicName").value = clinic.name;
        $("clinicSpecialty").value = clinic.specialty;
        $("clinicLocation").value = clinic.location;
        $("clinicCapacity").value = clinic.capacity;
        $("clinicDescription").value = clinic.description || "";
        $("clinicStatus").value = clinic.status;

        $("clinicModalTitle").textContent = "Cập nhật phòng khám";
        $("saveClinicBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật thông tin';

        clinicModal.show();
    }

    function openDetailModal(id) {
        const clinic = clinics.find(item => item.id === id);
        if (!clinic) return;

        $("clinicDetailTitle").textContent = clinic.name;

        $("clinicDetailContent").innerHTML = `
            <div class="clinic-detail-grid">
                <div class="clinic-detail-item">
                    <span>Mã phòng</span>
                    <strong>${escapeHTML(clinic.code)}</strong>
                </div>
                <div class="clinic-detail-item">
                    <span>Tên phòng</span>
                    <strong>${escapeHTML(clinic.name)}</strong>
                </div>
                <div class="clinic-detail-item">
                    <span>Chuyên khoa</span>
                    <strong>${escapeHTML(clinic.specialty)}</strong>
                </div>
                <div class="clinic-detail-item">
                    <span>Vị trí</span>
                    <strong>${escapeHTML(clinic.location)}</strong>
                </div>
                <div class="clinic-detail-item">
                    <span>Sức chứa</span>
                    <strong>${Number(clinic.capacity) || 0} người</strong>
                </div>
                <div class="clinic-detail-item">
                    <span>Trạng thái</span>
                    ${statusHTML(clinic.status)}
                </div>
                <div class="clinic-detail-item clinic-detail-full">
                    <span>Mô tả</span>
                    <p>${escapeHTML(clinic.description || "Chưa có mô tả.")}</p>
                </div>
            </div>`;

        detailModal.show();
    }

    function deleteClinic(id) {
        const clinic = clinics.find(item => item.id === id);
        if (!clinic) return;

        if (!confirm(`Bạn có chắc muốn xóa "${clinic.name}" không?`)) {
            return;
        }

        clinics = clinics.filter(item => item.id !== id);
        saveClinics();
        renderAll();
    }

    $("btnAddClinic").addEventListener("click", openAddModal);

    $("clinicForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const id = $("clinicId").value;
        const code = $("clinicCode").value.trim();
        const name = $("clinicName").value.trim();
        const specialty = $("clinicSpecialty").value;
        const location = $("clinicLocation").value.trim();
        const capacity = Number($("clinicCapacity").value);
        const description = $("clinicDescription").value.trim();
        const status = $("clinicStatus").value;

        if (!code || !name || !specialty || !location || capacity < 1) {
            alert("Vui lòng nhập đầy đủ thông tin hợp lệ.");
            return;
        }

        const duplicateCode = clinics.some(clinic =>
            clinic.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi")
            && clinic.id !== id
        );

        if (duplicateCode) {
            alert("Mã phòng đã tồn tại. Vui lòng nhập mã khác.");
            $("clinicCode").focus();
            return;
        }

        const clinicData = {
            id: id || String(Date.now()),
            code,
            name,
            specialty,
            location,
            capacity,
            description,
            status
        };

        if (id) {
            clinics = clinics.map(clinic =>
                clinic.id === id ? clinicData : clinic
            );
        } else {
            clinics.unshift(clinicData);
        }

        saveClinics();
        currentPage = 1;
        renderAll();
        clinicModal.hide();
        resetForm();
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteClinic(id);
    });

    $("clinicSearch").addEventListener("input", function () {
        currentPage = 1;
        renderTable();
    });

    $("clinicSpecialtyFilter").addEventListener("change", function () {
        currentPage = 1;
        renderTable();
    });

    $("clinicStatusFilter").addEventListener("change", function () {
        currentPage = 1;
        renderTable();
    });

    $("clinicPagination").addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        currentPage = Number(button.dataset.page);
        renderTable();
    });

    $("btnExportClinics").addEventListener("click", function () {
        const rows = getFilteredClinics();

        if (rows.length === 0) {
            alert("Không có dữ liệu để xuất.");
            return;
        }

        const headers = [
            "Mã phòng",
            "Tên phòng",
            "Chuyên khoa",
            "Vị trí",
            "Sức chứa",
            "Trạng thái",
            "Mô tả"
        ];

        const csvCell = value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"';

        const csvRows = rows.map(clinic => [
            clinic.code,
            clinic.name,
            clinic.specialty,
            clinic.location,
            clinic.capacity,
            clinic.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động",
            clinic.description
        ]);

        const csv = "\uFEFF" + [headers, ...csvRows]
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-phong-kham.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    $("clinicModal").addEventListener("hidden.bs.modal", resetForm);

    renderAll();
});

/* ==========================================
   MEDCARE - QUẢN LÝ LỊCH HẸN
   Thêm vào js/admin.js
========================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", initAppointmentManager);

    function initAppointmentManager() {
        const tableBody = document.getElementById("appointmentTableBody");
        const form = document.getElementById("appointmentForm");

        // Không chạy module này ở những trang không có bảng lịch hẹn.
        if (!tableBody || !form) return;

        const $ = (id) => document.getElementById(id);

        const modalElement = $("appointmentModal");
        const detailModalElement = $("appointmentDetailModal");

        if (!modalElement || !detailModalElement || !window.bootstrap) {
            console.error("Không thể khởi tạo module quản lý lịch hẹn.");
            return;
        }

        const appointmentModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            cancelled: "Đã hủy",
            completed: "Đã hoàn thành"
        };

        const statusClasses = {
            pending: "status-pending",
            confirmed: "status-confirmed",
            cancelled: "status-cancelled",
            completed: "status-completed"
        };

        const today = getLocalDateString(new Date());

        // Dữ liệu khởi tạo để giao diện có nội dung hiển thị.
        // Khi kết nối backend, thay nguồn dữ liệu này bằng API/CSDL.
        let appointments = [
            {
                id: 1,
                code: "LH0001",
                patient: "Nguyễn Minh Anh",
                phone: "0901234567",
                doctor: "BS. Trần Hoàng Nam",
                specialty: "Tim mạch",
                clinic: "Phòng khám 101",
                date: today,
                time: "08:00",
                status: "confirmed",
                reason: "Kiểm tra sức khỏe tim mạch"
            },
            {
                id: 2,
                code: "LH0002",
                patient: "Trần Ngọc Hà",
                phone: "0912345678",
                doctor: "BS. Lê Thu Hương",
                specialty: "Nội tổng quát",
                clinic: "Phòng khám 102",
                date: addDays(today, 1),
                time: "09:30",
                status: "pending",
                reason: "Khám sức khỏe định kỳ"
            },
            {
                id: 3,
                code: "LH0003",
                patient: "Phạm Gia Bảo",
                phone: "0934567890",
                doctor: "BS. Nguyễn Thanh Tâm",
                specialty: "Nhi khoa",
                clinic: "Phòng khám 103",
                date: addDays(today, 1),
                time: "10:00",
                status: "confirmed",
                reason: "Tư vấn sức khỏe"
            },
            {
                id: 4,
                code: "LH0004",
                patient: "Lê Thị Mai",
                phone: "0987654321",
                doctor: "BS. Võ Minh Đức",
                specialty: "Da liễu",
                clinic: "Phòng khám 104",
                date: addDays(today, 2),
                time: "14:00",
                status: "cancelled",
                reason: "Khám da liễu"
            },
            {
                id: 5,
                code: "LH0005",
                patient: "Đỗ Hoàng Phúc",
                phone: "0971234567",
                doctor: "BS. Phạm Quốc Huy",
                specialty: "Răng hàm mặt",
                clinic: "Phòng khám 105",
                date: addDays(today, -1),
                time: "15:00",
                status: "completed",
                reason: "Kiểm tra răng định kỳ"
            },
            {
                id: 6,
                code: "LH0006",
                patient: "Vũ Khánh Linh",
                phone: "0961234567",
                doctor: "BS. Nguyễn Thảo Vy",
                specialty: "Tai mũi họng",
                clinic: "Phòng khám 106",
                date: addDays(today, 3),
                time: "08:30",
                status: "pending",
                reason: "Khám tai mũi họng"
            }
        ];

        let currentPage = 1;
        const pageSize = 5;

        const searchInput = $("appointmentSearch");
        const dateFilter = $("appointmentDateFilter");
        const statusFilter = $("appointmentStatusFilter");
        const emptyState = $("appointmentEmpty");
        const tableWrap = tableBody.closest(".appointment-table-wrap")
            || tableBody.closest(".table-responsive");
        const pagination = $("appointmentPagination");
        const resultCount = $("appointmentResultCount");

        function escapeHTML(value) {
            return String(value ?? "").replace(/[&<>"']/g, (char) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char]);
        }

        function getLocalDateString(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        function addDays(dateString, days) {
            const date = new Date(`${dateString}T12:00:00`);
            date.setDate(date.getDate() + days);
            return getLocalDateString(date);
        }

        function formatDate(dateString) {
            if (!dateString) return "—";

            const parts = dateString.split("-");
            if (parts.length !== 3) return escapeHTML(dateString);

            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        function formatStatus(status) {
            return statusLabels[status] || "Không xác định";
        }

        function statusBadge(status) {
            const className = statusClasses[status] || "";
            return `<span class="appointment-status ${className}">
                ${escapeHTML(formatStatus(status))}
            </span>`;
        }

        function getFilteredAppointments() {
            const keyword = (searchInput?.value || "")
                .trim()
                .toLocaleLowerCase("vi");

            const selectedDate = dateFilter?.value || "";
            const selectedStatus = statusFilter?.value || "";

            return appointments
                .filter((item) => {
                    const searchableText = [
                        item.code,
                        item.patient,
                        item.phone,
                        item.doctor,
                        item.specialty,
                        item.clinic
                    ].join(" ").toLocaleLowerCase("vi");

                    const matchesKeyword = !keyword || searchableText.includes(keyword);
                    const matchesDate = !selectedDate || item.date === selectedDate;
                    const matchesStatus = !selectedStatus || item.status === selectedStatus;

                    return matchesKeyword && matchesDate && matchesStatus;
                })
                .sort((a, b) => {
                    const dateComparison = a.date.localeCompare(b.date);
                    return dateComparison || a.time.localeCompare(b.time);
                });
        }

        function renderStats() {
            $("totalAppointments").textContent = appointments.length;
            $("pendingAppointments").textContent =
                appointments.filter((item) => item.status === "pending").length;
            $("confirmedAppointments").textContent =
                appointments.filter((item) => item.status === "confirmed").length;
            $("cancelledAppointments").textContent =
                appointments.filter((item) => item.status === "cancelled").length;
        }

        function renderTable() {
            const filtered = getFilteredAppointments();
            const total = filtered.length;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));

            currentPage = Math.min(currentPage, totalPages);

            const startIndex = (currentPage - 1) * pageSize;
            const visibleAppointments = filtered.slice(
                startIndex,
                startIndex + pageSize
            );

            tableBody.innerHTML = visibleAppointments.map((item) => `
                <tr>
                    <td>
                        <span class="appointment-code">${escapeHTML(item.code)}</span>
                    </td>
                    <td>
                        <div class="appointment-person">${escapeHTML(item.patient)}</div>
                        <div class="appointment-subtext">
                            <i class="bi bi-telephone"></i>
                            ${escapeHTML(item.phone)}
                        </div>
                    </td>
                    <td>
                        <div class="appointment-person">${escapeHTML(item.doctor)}</div>
                        <div class="appointment-subtext">${escapeHTML(item.specialty)}</div>
                    </td>
                    <td class="appointment-date">${formatDate(item.date)}</td>
                    <td class="appointment-time">${escapeHTML(item.time)}</td>
                    <td>${statusBadge(item.status)}</td>
                    <td>
                        <div class="appointment-actions">
                            <button type="button"
                                    class="appointment-action-btn"
                                    data-action="view"
                                    data-id="${item.id}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button"
                                    class="appointment-action-btn"
                                    data-action="edit"
                                    data-id="${item.id}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button type="button"
                                    class="appointment-action-btn danger"
                                    data-action="delete"
                                    data-id="${item.id}"
                                    title="Xóa lịch hẹn"
                                    aria-label="Xóa lịch hẹn">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");

            if (emptyState) {
                emptyState.hidden = total > 0;
            }

            if (tableWrap) {
                tableWrap.hidden = total === 0;
            }

            if (resultCount) {
                resultCount.textContent = total === 0
                    ? "Hiển thị 0 lịch hẹn"
                    : `Hiển thị ${startIndex + 1}–${Math.min(startIndex + pageSize, total)} trong ${total} lịch hẹn`;
            }

            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            if (!pagination) return;

            if (getFilteredAppointments().length === 0) {
                pagination.innerHTML = "";
                return;
            }

            let html = `
                <button type="button"
                        class="appointment-page-btn"
                        data-page="${currentPage - 1}"
                        ${currentPage === 1 ? "disabled" : ""}
                        aria-label="Trang trước">
                    <i class="bi bi-chevron-left"></i>
                </button>
            `;

            for (let page = 1; page <= totalPages; page++) {
                html += `
                    <button type="button"
                            class="appointment-page-btn ${page === currentPage ? "active" : ""}"
                            data-page="${page}"
                            ${page === currentPage ? 'aria-current="page"' : ""}>
                        ${page}
                    </button>
                `;
            }

            html += `
                <button type="button"
                        class="appointment-page-btn"
                        data-page="${currentPage + 1}"
                        ${currentPage === totalPages ? "disabled" : ""}
                        aria-label="Trang sau">
                    <i class="bi bi-chevron-right"></i>
                </button>
            `;

            pagination.innerHTML = html;
        }

        function refresh() {
            renderStats();
            renderTable();
        }

        function generateCode() {
            let nextNumber = appointments.reduce((max, item) => {
                const number = Number(String(item.code).replace(/\D/g, ""));
                return Math.max(max, number || 0);
            }, 0) + 1;

            let code = `LH${String(nextNumber).padStart(4, "0")}`;

            while (appointments.some((item) => item.code === code)) {
                nextNumber++;
                code = `LH${String(nextNumber).padStart(4, "0")}`;
            }

            return code;
        }

        function resetForm() {
            form.reset();
            $("appointmentId").value = "";
            $("appointmentModalTitle").textContent = "Thêm lịch hẹn";
            $("saveAppointmentBtn").innerHTML =
                '<i class="bi bi-check-lg"></i> Lưu lịch hẹn';
            $("appointmentCode").value = "";
            $("appointmentStatus").value = "pending";
        }

        function openAddModal() {
            resetForm();
            $("appointmentModalTitle").textContent = "Thêm lịch hẹn";
            appointmentModal.show();
        }

        function openEditModal(id) {
            const item = appointments.find((appointment) => appointment.id === id);
            if (!item) return;

            resetForm();

            $("appointmentId").value = item.id;
            $("appointmentCode").value = item.code;
            $("appointmentPatient").value = item.patient;
            $("appointmentPhone").value = item.phone;
            $("appointmentDoctor").value = item.doctor;
            $("appointmentSpecialty").value = item.specialty;
            $("appointmentClinic").value = item.clinic;
            $("appointmentDate").value = item.date;
            $("appointmentTime").value = item.time;
            $("appointmentStatus").value = item.status;
            $("appointmentReason").value = item.reason;

            $("appointmentModalTitle").textContent = "Cập nhật lịch hẹn";
            $("saveAppointmentBtn").innerHTML =
                '<i class="bi bi-check-lg"></i> Cập nhật lịch hẹn';

            appointmentModal.show();
        }

        function openDetailModal(id) {
            const item = appointments.find((appointment) => appointment.id === id);
            if (!item) return;

            $("appointmentDetailTitle").textContent =
                `Chi tiết lịch hẹn ${item.code}`;

            $("appointmentDetailContent").innerHTML = `
                <div class="appointment-detail-grid">
                    <div class="appointment-detail-item">
                        <span>Mã lịch hẹn</span>
                        <strong>${escapeHTML(item.code)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Trạng thái</span>
                        <div>${statusBadge(item.status)}</div>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Họ tên bệnh nhân</span>
                        <strong>${escapeHTML(item.patient)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Số điện thoại</span>
                        <strong>${escapeHTML(item.phone)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Bác sĩ phụ trách</span>
                        <strong>${escapeHTML(item.doctor)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Chuyên khoa</span>
                        <strong>${escapeHTML(item.specialty)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Phòng khám</span>
                        <strong>${escapeHTML(item.clinic || "Chưa cập nhật")}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Ngày khám</span>
                        <strong>${formatDate(item.date)}</strong>
                    </div>
                    <div class="appointment-detail-item">
                        <span>Giờ khám</span>
                        <strong>${escapeHTML(item.time)}</strong>
                    </div>
                    <div class="appointment-detail-item full-width">
                        <span>Lý do khám / ghi chú</span>
                        <p class="appointment-detail-note">${
                            escapeHTML(item.reason || "Không có ghi chú")
                        }</p>
                    </div>
                </div>
            `;

            detailModal.show();
        }

        function deleteAppointment(id) {
            const item = appointments.find((appointment) => appointment.id === id);
            if (!item) return;

            const confirmed = window.confirm(
                `Ông có chắc muốn xóa lịch hẹn ${item.code} của ${item.patient} không?`
            );

            if (!confirmed) return;

            appointments = appointments.filter((appointment) => appointment.id !== id);
            refresh();
        }

        function saveAppointment(event) {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const idValue = $("appointmentId").value;
            const existingId = idValue ? Number(idValue) : null;

            const code = $("appointmentCode").value.trim()
                || (existingId
                    ? appointments.find((item) => item.id === existingId)?.code
                    : generateCode());

            const duplicateCode = appointments.some((item) =>
                item.code.toLocaleLowerCase() === code.toLocaleLowerCase()
                && item.id !== existingId
            );

            if (duplicateCode) {
                window.alert("Mã lịch hẹn đã tồn tại. Vui lòng nhập mã khác.");
                $("appointmentCode").focus();
                return;
            }

            const item = {
                id: existingId || Date.now(),
                code,
                patient: $("appointmentPatient").value.trim(),
                phone: $("appointmentPhone").value.trim(),
                doctor: $("appointmentDoctor").value.trim(),
                specialty: $("appointmentSpecialty").value.trim(),
                clinic: $("appointmentClinic").value.trim(),
                date: $("appointmentDate").value,
                time: $("appointmentTime").value,
                status: $("appointmentStatus").value,
                reason: $("appointmentReason").value.trim()
            };

            if (existingId) {
                const index = appointments.findIndex(
                    (appointment) => appointment.id === existingId
                );

                if (index !== -1) {
                    appointments[index] = item;
                }
            } else {
                appointments.push(item);
            }

            currentPage = 1;
            refresh();
            appointmentModal.hide();
        }

        function resetFilters() {
            if (searchInput) searchInput.value = "";
            if (dateFilter) dateFilter.value = "";
            if (statusFilter) statusFilter.value = "";

            currentPage = 1;
            refresh();
        }

        function exportCSV() {
            const rows = getFilteredAppointments();

            if (rows.length === 0) {
                window.alert("Không có lịch hẹn để xuất.");
                return;
            }

            const headers = [
                "Mã lịch hẹn",
                "Bệnh nhân",
                "Số điện thoại",
                "Bác sĩ",
                "Chuyên khoa",
                "Phòng khám",
                "Ngày khám",
                "Giờ khám",
                "Trạng thái",
                "Lý do khám"
            ];

            const csvCell = (value) => {
                let text = String(value ?? "");

                // Ngăn bảng tính diễn giải nội dung bắt đầu bằng ký tự công thức.
                if (/^[\s]*[=+\-@]/.test(text)) {
                    text = "'" + text;
                }

                return `"${text.replace(/"/g, '""')}"`;
            };

            const csvRows = [
                headers,
                ...rows.map((item) => [
                    item.code,
                    item.patient,
                    item.phone,
                    item.doctor,
                    item.specialty,
                    item.clinic,
                    formatDate(item.date),
                    item.time,
                    formatStatus(item.status),
                    item.reason
                ])
            ];

            const csvContent = "\uFEFF" + csvRows
                .map((row) => row.map(csvCell).join(","))
                .join("\r\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `danh-sach-lich-hen-${today}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        // Nút thêm lịch hẹn.
        $("addAppointmentBtn")?.addEventListener("click", openAddModal);

        // Lưu lịch hẹn.
        form.addEventListener("submit", saveAppointment);

        // Xóa dữ liệu cũ trên form khi đóng modal.
        modalElement.addEventListener("hidden.bs.modal", resetForm);

        // Tìm kiếm và lọc.
        searchInput?.addEventListener("input", () => {
            currentPage = 1;
            renderTable();
        });

        dateFilter?.addEventListener("change", () => {
            currentPage = 1;
            renderTable();
        });

        statusFilter?.addEventListener("change", () => {
            currentPage = 1;
            renderTable();
        });

        $("btnResetAppointmentFilters")?.addEventListener("click", resetFilters);
        $("exportAppointmentsBtn")?.addEventListener("click", exportCSV);

        // Các thao tác trong bảng.
        tableBody.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;

            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") openDetailModal(id);
            if (action === "edit") openEditModal(id);
            if (action === "delete") deleteAppointment(id);
        });

        // Phân trang.
        pagination?.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-page]");
            if (!button || button.disabled) return;

            const page = Number(button.dataset.page);
            const totalPages = Math.max(
                1,
                Math.ceil(getFilteredAppointments().length / pageSize)
            );

            if (page < 1 || page > totalPages) return;

            currentPage = page;
            renderTable();
        });

        // Khởi tạo giao diện.
        refresh();
    }
})();

/* =========================================
   MEDCARE - QUẢN LÝ LỊCH LÀM VIỆC
   ========================================= */
(function () {
    "use strict";

    const tableBody = document.getElementById("scheduleTableBody");

    // Không chạy module này trên các trang quản trị khác.
    if (!tableBody) return;

    const STORAGE_KEY = "medcare_work_schedules";
    const PAGE_SIZE = 5;

    const $ = (id) => document.getElementById(id);

    const searchInput = $("scheduleSearch");
    const dayFilter = $("scheduleDayFilter");
    const statusFilter = $("scheduleStatusFilter");
    const resultCount = $("scheduleResultCount");
    const pagination = $("schedulePagination");

    const form = $("scheduleForm");
    const modalElement = $("scheduleModal");
    const detailModalElement = $("scheduleDetailModal");

    const scheduleModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    let currentPage = 1;
    let schedules = loadSchedules();

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function loadSchedules() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error("Không thể đọc lịch làm việc:", error);
        }

        const initialData = [
            {
                id: "LICH001",
                doctor: "Nguyễn Minh Anh",
                specialty: "Tim mạch",
                day: "Thứ 2",
                clinic: "Phòng khám 101",
                startTime: "07:30",
                endTime: "11:30",
                status: "active",
                note: "Khám bệnh buổi sáng."
            },
            {
                id: "LICH002",
                doctor: "Trần Hoàng Nam",
                specialty: "Nội tổng quát",
                day: "Thứ 2",
                clinic: "Phòng khám 102",
                startTime: "13:30",
                endTime: "17:00",
                status: "active",
                note: ""
            },
            {
                id: "LICH003",
                doctor: "Lê Thu Hà",
                specialty: "Nhi khoa",
                day: "Thứ 3",
                clinic: "Phòng khám 201",
                startTime: "07:30",
                endTime: "11:30",
                status: "active",
                note: ""
            },
            {
                id: "LICH004",
                doctor: "Phạm Quốc Bảo",
                specialty: "Da liễu",
                day: "Thứ 4",
                clinic: "Phòng khám 103",
                startTime: "13:30",
                endTime: "17:00",
                status: "inactive",
                note: "Tạm ngưng lịch trong thời gian này."
            },
            {
                id: "LICH005",
                doctor: "Võ Ngọc Mai",
                specialty: "Răng hàm mặt",
                day: "Thứ 5",
                clinic: "Phòng khám 202",
                startTime: "08:00",
                endTime: "12:00",
                status: "active",
                note: ""
            },
            {
                id: "LICH006",
                doctor: "Đặng Thành Đạt",
                specialty: "Tai mũi họng",
                day: "Thứ 6",
                clinic: "Phòng khám 104",
                startTime: "13:30",
                endTime: "17:00",
                status: "active",
                note: ""
            },
            {
                id: "LICH007",
                doctor: "Nguyễn Minh Anh",
                specialty: "Tim mạch",
                day: "Thứ 7",
                clinic: "Phòng khám 101",
                startTime: "07:30",
                endTime: "11:30",
                status: "active",
                note: "Khám bệnh buổi sáng."
            },
            {
                id: "LICH008",
                doctor: "Trần Hoàng Nam",
                specialty: "Nội tổng quát",
                day: "Thứ 4",
                clinic: "Phòng khám 102",
                startTime: "07:30",
                endTime: "11:30",
                status: "inactive",
                note: ""
            }
        ];

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        } catch (error) {
            console.error("Không thể lưu lịch làm việc:", error);
        }

        return initialData;
    }

    function saveSchedules() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
        } catch (error) {
            console.error("Không thể lưu lịch làm việc:", error);
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra bộ nhớ trình duyệt.");
        }
    }

    function statusLabel(status) {
        return status === "active" ? "Đang hoạt động" : "Tạm ngưng";
    }

    function formatTime(time) {
        return escapeHTML(time || "--:--");
    }

    function getFilteredSchedules() {
        const keyword = (searchInput?.value || "").trim().toLocaleLowerCase("vi");
        const selectedDay = dayFilter?.value || "";
        const selectedStatus = statusFilter?.value || "";

        return schedules.filter(function (item) {
            const searchableText = [
                item.id,
                item.doctor,
                item.specialty,
                item.clinic,
                item.day
            ].join(" ").toLocaleLowerCase("vi");

            return (
                (!keyword || searchableText.includes(keyword)) &&
                (!selectedDay || item.day === selectedDay) &&
                (!selectedStatus || item.status === selectedStatus)
            );
        });
    }

    function renderStatistics() {
        const total = schedules.length;
        const active = schedules.filter(item => item.status === "active").length;
        const doctorCount = new Set(
            schedules.map(item => item.doctor.trim().toLocaleLowerCase("vi"))
                .filter(Boolean)
        ).size;

        $("totalSchedules").textContent = total;
        $("activeSchedules").textContent = active;
        $("scheduleDoctorCount").textContent = doctorCount;
    }

    function renderTable() {
        const filtered = getFilteredSchedules();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const visibleSchedules = filtered.slice(startIndex, startIndex + PAGE_SIZE);

        if (visibleSchedules.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="schedule-empty">
                        <i class="bi bi-calendar-x"></i>
                        <div class="schedule-empty-title">Không tìm thấy lịch làm việc</div>
                        <div class="schedule-empty-text">
                            Thử thay đổi từ khóa hoặc điều kiện lọc.
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = visibleSchedules.map(function (item) {
                return `
                    <tr>
                        <td>
                            <span class="schedule-code">${escapeHTML(item.id)}</span>
                        </td>

                        <td>
                            <div class="schedule-person">
                                <div class="schedule-avatar">
                                    <i class="bi bi-person-badge"></i>
                                </div>
                                <div class="schedule-person-info">
                                    <div class="schedule-person-name">
                                        ${escapeHTML(item.doctor)}
                                    </div>
                                    <div class="schedule-person-specialty">
                                        ${escapeHTML(item.specialty)}
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="schedule-day">${escapeHTML(item.day)}</span>
                        </td>

                        <td>
                            <div class="schedule-time">
                                <div>
                                    <i class="bi bi-clock"></i>
                                    ${formatTime(item.startTime)}
                                </div>
                                <div>
                                    <i class="bi bi-clock-history"></i>
                                    ${formatTime(item.endTime)}
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="schedule-clinic">
                                <i class="bi bi-geo-alt"></i>
                                ${escapeHTML(item.clinic)}
                            </span>
                        </td>

                        <td>
                            <span class="schedule-status ${item.status === "active" ? "active" : "inactive"}">
                                ${statusLabel(item.status)}
                            </span>
                        </td>

                        <td>
                            <div class="schedule-actions">
                                <button
                                    type="button"
                                    class="schedule-action-btn view"
                                    data-action="view"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết"
                                >
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="schedule-action-btn edit"
                                    data-action="edit"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa"
                                >
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button
                                    type="button"
                                    class="schedule-action-btn delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Xóa lịch"
                                    aria-label="Xóa lịch"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        const shownFrom = filtered.length ? startIndex + 1 : 0;
        const shownTo = Math.min(startIndex + PAGE_SIZE, filtered.length);

        resultCount.textContent =
            `Hiển thị ${shownFrom}–${shownTo} trong ${filtered.length} lịch làm việc`;

        renderPagination(totalPages);
        renderStatistics();
    }

    function renderPagination(totalPages) {
        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        let html = `
            <button
                type="button"
                data-page="${currentPage - 1}"
                aria-label="Trang trước"
                ${currentPage === 1 ? "disabled" : ""}
            >
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button
                    type="button"
                    data-page="${page}"
                    class="${page === currentPage ? "active" : ""}"
                    ${page === currentPage ? 'aria-current="page"' : ""}
                >
                    ${page}
                </button>
            `;
        }

        html += `
            <button
                type="button"
                data-page="${currentPage + 1}"
                aria-label="Trang sau"
                ${currentPage === totalPages ? "disabled" : ""}
            >
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = html;
    }

    function refreshTable(resetPage = false) {
        if (resetPage) currentPage = 1;
        renderTable();
    }

    function generateId() {
        let number = 1;

        while (schedules.some(item => item.id === `LICH${String(number).padStart(3, "0")}`)) {
            number++;
        }

        return `LICH${String(number).padStart(3, "0")}`;
    }

    function clearForm() {
        form.reset();
        $("scheduleId").value = "";
        $("scheduleStatus").value = "active";
        $("scheduleModalTitle").textContent = "Thêm lịch làm việc";
        $("saveScheduleBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu lịch làm việc';
    }

    function openAddModal() {
        clearForm();
        scheduleModal.show();
    }

    function openEditModal(id) {
        const item = schedules.find(schedule => schedule.id === id);
        if (!item) return;

        clearForm();

        $("scheduleId").value = item.id;
        $("scheduleDoctor").value = item.doctor;
        $("scheduleSpecialty").value = item.specialty;
        $("scheduleDay").value = item.day;
        $("scheduleClinic").value = item.clinic;
        $("scheduleStartTime").value = item.startTime;
        $("scheduleEndTime").value = item.endTime;
        $("scheduleStatus").value = item.status;
        $("scheduleNote").value = item.note || "";

        $("scheduleModalTitle").textContent = "Cập nhật lịch làm việc";
        $("saveScheduleBtn").innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật lịch';

        scheduleModal.show();
    }

    function openDetailModal(id) {
        const item = schedules.find(schedule => schedule.id === id);
        if (!item) return;

        $("scheduleDetailTitle").textContent = `Chi tiết ${item.id}`;

        $("scheduleDetailContent").innerHTML = `
            <div class="schedule-detail-grid">
                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Mã lịch</div>
                    <div class="schedule-detail-value">${escapeHTML(item.id)}</div>
                </div>

                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Trạng thái</div>
                    <div>
                        <span class="schedule-status ${item.status === "active" ? "active" : "inactive"}">
                            ${statusLabel(item.status)}
                        </span>
                    </div>
                </div>

                <div class="schedule-detail-item full">
                    <div class="schedule-detail-label">Bác sĩ</div>
                    <div class="schedule-detail-value">${escapeHTML(item.doctor)}</div>
                </div>

                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Chuyên khoa</div>
                    <div class="schedule-detail-value">${escapeHTML(item.specialty)}</div>
                </div>

                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Ngày làm việc</div>
                    <div class="schedule-detail-value">${escapeHTML(item.day)}</div>
                </div>

                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Giờ bắt đầu</div>
                    <div class="schedule-detail-value">${formatTime(item.startTime)}</div>
                </div>

                <div class="schedule-detail-item">
                    <div class="schedule-detail-label">Giờ kết thúc</div>
                    <div class="schedule-detail-value">${formatTime(item.endTime)}</div>
                </div>

                <div class="schedule-detail-item full">
                    <div class="schedule-detail-label">Phòng khám</div>
                    <div class="schedule-detail-value">${escapeHTML(item.clinic)}</div>
                </div>

                <div class="schedule-detail-item full">
                    <div class="schedule-detail-label">Ghi chú</div>
                    <div class="schedule-detail-value schedule-detail-note">
                        ${escapeHTML(item.note || "Không có ghi chú")}
                    </div>
                </div>
            </div>
        `;

        detailModal.show();
    }

    function deleteSchedule(id) {
        const item = schedules.find(schedule => schedule.id === id);
        if (!item) return;

        const confirmed = confirm(
            `Bạn có chắc muốn xóa lịch làm việc của bác sĩ ${item.doctor} (${item.day})?`
        );

        if (!confirmed) return;

        schedules = schedules.filter(schedule => schedule.id !== id);
        saveSchedules();
        refreshTable();

        alert("Đã xóa lịch làm việc.");
    }

    function validateTime(startTime, endTime) {
        if (!startTime || !endTime) {
            alert("Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc.");
            return false;
        }

        if (startTime >= endTime) {
            alert("Giờ kết thúc phải sau giờ bắt đầu.");
            $("scheduleEndTime").focus();
            return false;
        }

        return true;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const id = $("scheduleId").value.trim();
        const startTime = $("scheduleStartTime").value;
        const endTime = $("scheduleEndTime").value;

        if (!validateTime(startTime, endTime)) return;

        const newItem = {
            id: id || generateId(),
            doctor: $("scheduleDoctor").value.trim(),
            specialty: $("scheduleSpecialty").value.trim(),
            day: $("scheduleDay").value,
            clinic: $("scheduleClinic").value.trim(),
            startTime,
            endTime,
            status: $("scheduleStatus").value,
            note: $("scheduleNote").value.trim()
        };

        if (!newItem.doctor || !newItem.specialty || !newItem.clinic) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        const duplicate = schedules.find(function (item) {
            return item.id !== id &&
                item.doctor.toLocaleLowerCase("vi") === newItem.doctor.toLocaleLowerCase("vi") &&
                item.day === newItem.day &&
                startTime < item.endTime &&
                endTime > item.startTime;
        });

        if (duplicate) {
            const confirmed = confirm(
                `Bác sĩ này đã có lịch ${duplicate.day} từ ${duplicate.startTime} đến ${duplicate.endTime}. Bạn vẫn muốn lưu lịch mới?`
            );

            if (!confirmed) return;
        }

        if (id) {
            const index = schedules.findIndex(item => item.id === id);

            if (index !== -1) {
                schedules[index] = newItem;
            } else {
                schedules.push(newItem);
            }
        } else {
            schedules.push(newItem);
        }

        saveSchedules();
        scheduleModal.hide();
        refreshTable(true);

        alert(id ? "Đã cập nhật lịch làm việc." : "Đã thêm lịch làm việc.");
    }

    function exportCSV() {
        const filtered = getFilteredSchedules();

        if (!filtered.length) {
            alert("Không có lịch làm việc để xuất.");
            return;
        }

        const headers = [
            "Mã lịch",
            "Bác sĩ",
            "Chuyên khoa",
            "Ngày làm việc",
            "Giờ bắt đầu",
            "Giờ kết thúc",
            "Phòng khám",
            "Trạng thái",
            "Ghi chú"
        ];

        function csvCell(value) {
            let text = String(value ?? "");

            // Tránh phần mềm bảng tính hiểu dữ liệu bắt đầu bằng ký tự
            // công thức là công thức thực thi.
            if (/^[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }

        const rows = filtered.map(item => [
            item.id,
            item.doctor,
            item.specialty,
            item.day,
            item.startTime,
            item.endTime,
            item.clinic,
            statusLabel(item.status),
            item.note || ""
        ]);

        const csvContent = "\uFEFF" + [
            headers,
            ...rows
        ].map(row => row.map(csvCell).join(",")).join("\r\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-lich-lam-viec.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    // Nút thêm lịch.
    $("addScheduleBtn")?.addEventListener("click", openAddModal);

    // Lưu lịch.
    form.addEventListener("submit", handleSubmit);

    // Tìm kiếm và lọc.
    searchInput?.addEventListener("input", () => refreshTable(true));
    dayFilter?.addEventListener("change", () => refreshTable(true));
    statusFilter?.addEventListener("change", () => refreshTable(true));

    // Phân trang.
    pagination?.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        const nextPage = Number(button.dataset.page);
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredSchedules().length / PAGE_SIZE)
        );

        if (nextPage < 1 || nextPage > totalPages) return;

        currentPage = nextPage;
        renderTable();
    });

    // Xem, sửa, xóa lịch bằng event delegation.
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteSchedule(id);
    });

    // Xuất CSV.
    $("exportSchedulesBtn")?.addEventListener("click", exportCSV);

    // Đặt lại biểu mẫu khi đóng modal.
    modalElement.addEventListener("hidden.bs.modal", clearForm);

    // Khởi tạo giao diện.
    renderTable();
})();

/* =========================================
   QUẢN LÝ PHIẾU KHÁM - MEDCARE
========================================= */
(function () {
    "use strict";

    const tableBody = document.getElementById("examTableBody");

    // Không chạy module này ở những trang khác.
    if (!tableBody) return;

    const STORAGE_KEY = "medcare_exam_records";
    const PAGE_SIZE = 5;

    const $ = (id) => document.getElementById(id);

    const elements = {
        total: $("totalExams"),
        completed: $("completedExams"),
        inProgress: $("inProgressExams"),
        search: $("examSearch"),
        statusFilter: $("examStatusFilter"),
        dateFilter: $("examDateFilter"),
        resultCount: $("examResultCount"),
        pagination: $("examPagination"),
        addButton: $("addExamBtn"),
        exportButton: $("exportExamsBtn"),
        modal: $("examModal"),
        form: $("examForm"),
        modalTitle: $("examModalTitle"),
        id: $("examId"),
        patient: $("examPatient"),
        doctor: $("examDoctor"),
        date: $("examDate"),
        status: $("examStatus"),
        diagnosis: $("examDiagnosis"),
        treatment: $("examTreatment"),
        note: $("examNote"),
        saveButton: $("saveExamBtn"),
        detailModal: $("examDetailModal"),
        detailTitle: $("examDetailTitle"),
        detailContent: $("examDetailContent")
    };

    const statusLabels = {
        waiting: "Chờ khám",
        in_progress: "Đang khám",
        completed: "Đã hoàn thành"
    };

    const statusClasses = {
        waiting: "status-waiting",
        in_progress: "status-progress",
        completed: "status-completed"
    };

    let currentPage = 1;
    let records = loadRecords();

    function getToday() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function dateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function createInitialRecords() {
        return [
            {
                id: "PK-001",
                patient: "Nguyễn Minh Anh",
                doctor: "Trần Quốc Bảo",
                date: dateOffset(0),
                status: "completed",
                diagnosis: "Viêm họng cấp",
                treatment: "Nghỉ ngơi, uống đủ nước và tuân thủ chỉ định của bác sĩ.",
                note: "Tái khám nếu triệu chứng kéo dài."
            },
            {
                id: "PK-002",
                patient: "Lê Hoàng Nam",
                doctor: "Phạm Thu Hà",
                date: dateOffset(0),
                status: "in_progress",
                diagnosis: "Theo dõi huyết áp",
                treatment: "Theo dõi huyết áp theo hướng dẫn chuyên môn.",
                note: ""
            },
            {
                id: "PK-003",
                patient: "Trần Ngọc Mai",
                doctor: "Nguyễn Thanh Tùng",
                date: dateOffset(-1),
                status: "completed",
                diagnosis: "Viêm mũi dị ứng",
                treatment: "Tránh các tác nhân gây dị ứng và thực hiện theo chỉ định.",
                note: "Theo dõi các triệu chứng."
            },
            {
                id: "PK-004",
                patient: "Phạm Gia Huy",
                doctor: "Trần Quốc Bảo",
                date: dateOffset(0),
                status: "waiting",
                diagnosis: "Chưa có kết quả",
                treatment: "",
                note: "Chờ bác sĩ thăm khám."
            },
            {
                id: "PK-005",
                patient: "Võ Khánh Linh",
                doctor: "Đỗ Minh Phương",
                date: dateOffset(-2),
                status: "completed",
                diagnosis: "Đau dạ dày, cần theo dõi",
                treatment: "Thực hiện chế độ ăn phù hợp theo hướng dẫn của bác sĩ.",
                note: "Theo dõi diễn biến triệu chứng."
            },
            {
                id: "PK-006",
                patient: "Đặng Tuấn Kiệt",
                doctor: "Phạm Thu Hà",
                date: dateOffset(0),
                status: "in_progress",
                diagnosis: "Đang đánh giá tình trạng sức khỏe",
                treatment: "",
                note: ""
            },
            {
                id: "PK-007",
                patient: "Bùi Ngọc Trâm",
                doctor: "Nguyễn Thanh Tùng",
                date: dateOffset(-3),
                status: "completed",
                diagnosis: "Khám sức khỏe tổng quát",
                treatment: "Tiếp tục duy trì thói quen sinh hoạt lành mạnh.",
                note: "Theo dõi kết quả kiểm tra định kỳ."
            },
            {
                id: "PK-008",
                patient: "Huỳnh Đức Anh",
                doctor: "Đỗ Minh Phương",
                date: dateOffset(1),
                status: "waiting",
                diagnosis: "Chưa có kết quả",
                treatment: "",
                note: "Lịch khám dự kiến."
            }
        ];
    }

    function loadRecords() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored !== null) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : createInitialRecords();
            }
        } catch (error) {
            console.error("Không thể đọc dữ liệu phiếu khám:", error);
        }

        return createInitialRecords();
    }

    function saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return true;
        } catch (error) {
            console.error("Không thể lưu dữ liệu phiếu khám:", error);
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra bộ nhớ trình duyệt.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function formatDate(value) {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return escapeHTML(value);

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getStatusLabel(status) {
        return statusLabels[status] || "Chưa xác định";
    }

    function getStatusHTML(status) {
        const label = escapeHTML(getStatusLabel(status));
        const className = statusClasses[status] || "status-waiting";

        return `<span class="exam-status ${className}">${label}</span>`;
    }

    function getFilteredRecords() {
        const keyword = elements.search.value.trim().toLocaleLowerCase("vi");
        const status = elements.statusFilter.value;
        const date = elements.dateFilter.value;

        return records.filter((record) => {
            const searchableText = [
                record.id,
                record.patient,
                record.doctor,
                record.diagnosis
            ].join(" ").toLocaleLowerCase("vi");

            const matchesKeyword = !keyword || searchableText.includes(keyword);
            const matchesStatus = !status || record.status === status;
            const matchesDate = !date || record.date === date;

            return matchesKeyword && matchesStatus && matchesDate;
        }).sort((a, b) => {
            const dateComparison = (b.date || "").localeCompare(a.date || "");
            return dateComparison || a.id.localeCompare(b.id);
        });
    }

    function renderStats() {
        elements.total.textContent = records.length;

        elements.completed.textContent = records.filter(
            (record) => record.status === "completed"
        ).length;

        elements.inProgress.textContent = records.filter(
            (record) => record.status === "in_progress"
        ).length;
    }

    function renderTable() {
        const filteredRecords = getFilteredRecords();
        const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageRecords = filteredRecords.slice(
            startIndex,
            startIndex + PAGE_SIZE
        );

        if (pageRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="exam-empty">
                        <i class="bi bi-clipboard2-x"></i>
                        Không tìm thấy phiếu khám phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageRecords.map((record) => `
                <tr>
                    <td>
                        <span class="exam-code">${escapeHTML(record.id)}</span>
                    </td>

                    <td>
                        <div class="exam-person">
                            <div class="exam-avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div class="exam-person-info">
                                <span class="exam-person-name">
                                    ${escapeHTML(record.patient)}
                                </span>
                                <span class="exam-person-caption">Bệnh nhân</span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="exam-doctor">
                            ${escapeHTML(record.doctor)}
                        </span>
                    </td>

                    <td>
                        <span class="exam-date">
                            ${formatDate(record.date)}
                        </span>
                    </td>

                    <td>
                        <span class="exam-diagnosis">
                            ${escapeHTML(record.diagnosis)}
                        </span>
                    </td>

                    <td>${getStatusHTML(record.status)}</td>

                    <td>
                        <div class="exam-actions">
                            <button type="button"
                                class="exam-action-btn"
                                data-action="view"
                                data-id="${escapeHTML(record.id)}"
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button type="button"
                                class="exam-action-btn"
                                data-action="edit"
                                data-id="${escapeHTML(record.id)}"
                                title="Chỉnh sửa"
                                aria-label="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>

                            <button type="button"
                                class="exam-action-btn exam-delete"
                                data-action="delete"
                                data-id="${escapeHTML(record.id)}"
                                title="Xóa phiếu khám"
                                aria-label="Xóa phiếu khám">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        const from = filteredRecords.length === 0 ? 0 : startIndex + 1;
        const to = Math.min(startIndex + PAGE_SIZE, filteredRecords.length);

        elements.resultCount.textContent =
            `Hiển thị ${from}–${to} trong ${filteredRecords.length} phiếu khám`;

        renderPagination(totalPages);
        renderStats();
    }

    function renderPagination(totalPages) {
        let html = `
            <button type="button" data-page="${currentPage - 1}"
                aria-label="Trang trước" ${currentPage <= 1 ? "disabled" : ""}>
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button type="button"
                    data-page="${page}"
                    class="${page === currentPage ? "active" : ""}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;
        }

        html += `
            <button type="button" data-page="${currentPage + 1}"
                aria-label="Trang sau" ${currentPage >= totalPages ? "disabled" : ""}>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        elements.pagination.innerHTML = html;
    }

    function refreshTable(resetPage = false) {
        if (resetPage) currentPage = 1;
        renderTable();
    }

    function createNextId() {
        const numbers = records.map((record) => {
            const match = String(record.id).match(/^PK-(\d+)$/);
            return match ? Number(match[1]) : 0;
        });

        const nextNumber = Math.max(0, ...numbers) + 1;
        return `PK-${String(nextNumber).padStart(3, "0")}`;
    }

    function resetForm() {
        elements.form.reset();
        elements.id.value = "";
        elements.date.value = getToday();
        elements.status.value = "waiting";
    }

    function openCreateModal() {
        resetForm();
        elements.modalTitle.textContent = "Tạo phiếu khám";
        elements.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu phiếu khám';

        bootstrap.Modal.getOrCreateInstance(elements.modal).show();
    }

    function openEditModal(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        resetForm();

        elements.id.value = record.id;
        elements.patient.value = record.patient;
        elements.doctor.value = record.doctor;
        elements.date.value = record.date;
        elements.status.value = record.status;
        elements.diagnosis.value = record.diagnosis;
        elements.treatment.value = record.treatment || "";
        elements.note.value = record.note || "";

        elements.modalTitle.textContent = `Chỉnh sửa ${record.id}`;
        elements.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật phiếu khám';

        bootstrap.Modal.getOrCreateInstance(elements.modal).show();
    }

    function openDetailModal(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        elements.detailTitle.textContent = `Chi tiết ${record.id}`;

        elements.detailContent.innerHTML = `
            <div class="exam-detail-grid">
                <div class="exam-detail-item">
                    <span class="exam-detail-label">Mã phiếu khám</span>
                    <span class="exam-detail-value">${escapeHTML(record.id)}</span>
                </div>

                <div class="exam-detail-item">
                    <span class="exam-detail-label">Trạng thái</span>
                    <span class="exam-detail-value">${getStatusHTML(record.status)}</span>
                </div>

                <div class="exam-detail-item">
                    <span class="exam-detail-label">Bệnh nhân</span>
                    <span class="exam-detail-value">${escapeHTML(record.patient)}</span>
                </div>

                <div class="exam-detail-item">
                    <span class="exam-detail-label">Bác sĩ phụ trách</span>
                    <span class="exam-detail-value">${escapeHTML(record.doctor)}</span>
                </div>

                <div class="exam-detail-item">
                    <span class="exam-detail-label">Ngày khám</span>
                    <span class="exam-detail-value">${formatDate(record.date)}</span>
                </div>

                <div class="exam-detail-item detail-full">
                    <span class="exam-detail-label">Chẩn đoán</span>
                    <span class="exam-detail-value">${escapeHTML(record.diagnosis)}</span>
                </div>

                <div class="exam-detail-item detail-full">
                    <span class="exam-detail-label">Hướng điều trị</span>
                    <span class="exam-detail-value">${escapeHTML(record.treatment || "Chưa cập nhật")}</span>
                </div>

                <div class="exam-detail-item detail-full">
                    <span class="exam-detail-label">Ghi chú</span>
                    <span class="exam-detail-value">${escapeHTML(record.note || "Không có ghi chú")}</span>
                </div>
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(elements.detailModal).show();
    }

    function deleteRecord(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        if (!confirm(`Bạn có chắc muốn xóa phiếu khám ${record.id} của bệnh nhân ${record.patient}?`)) {
            return;
        }

        const oldRecords = records;
        records = records.filter((item) => item.id !== id);

        if (!saveRecords()) {
            records = oldRecords;
            return;
        }

        refreshTable();
    }

    function exportCSV() {
        const filteredRecords = getFilteredRecords();

        if (filteredRecords.length === 0) {
            alert("Không có phiếu khám để xuất.");
            return;
        }

        const columns = [
            ["Mã phiếu", "id"],
            ["Bệnh nhân", "patient"],
            ["Bác sĩ", "doctor"],
            ["Ngày khám", "date"],
            ["Chẩn đoán", "diagnosis"],
            ["Hướng điều trị", "treatment"],
            ["Trạng thái", "status"],
            ["Ghi chú", "note"]
        ];

        function csvCell(value) {
            return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }

        const rows = [
            columns.map(([label]) => csvCell(label)).join(","),
            ...filteredRecords.map((record) =>
                columns.map(([, key]) => {
                    const value = key === "status"
                        ? getStatusLabel(record[key])
                        : record[key];

                    return csvCell(value);
                }).join(",")
            )
        ];

        const csv = "\uFEFF" + rows.join("\r\n");
        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `danh-sach-phieu-kham-${getToday()}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    elements.addButton.addEventListener("click", openCreateModal);

    elements.search.addEventListener("input", () => {
        refreshTable(true);
    });

    elements.statusFilter.addEventListener("change", () => {
        refreshTable(true);
    });

    elements.dateFilter.addEventListener("change", () => {
        refreshTable(true);
    });

    elements.pagination.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;

        const nextPage = Number(button.dataset.page);
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredRecords().length / PAGE_SIZE)
        );

        if (nextPage < 1 || nextPage > totalPages) return;

        currentPage = nextPage;
        renderTable();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteRecord(id);
    });

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!elements.form.reportValidity()) return;

        const id = elements.id.value;
        const oldRecords = records;

        const record = {
            id: id || createNextId(),
            patient: elements.patient.value.trim(),
            doctor: elements.doctor.value.trim(),
            date: elements.date.value,
            status: elements.status.value,
            diagnosis: elements.diagnosis.value.trim(),
            treatment: elements.treatment.value.trim(),
            note: elements.note.value.trim()
        };

        if (
            !record.patient ||
            !record.doctor ||
            !record.date ||
            !record.diagnosis ||
            !statusLabels[record.status]
        ) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        if (id) {
            records = records.map((item) =>
                item.id === id ? record : item
            );
        } else {
            records = [record, ...records];
        }

        if (!saveRecords()) {
            records = oldRecords;
            return;
        }

        bootstrap.Modal.getOrCreateInstance(elements.modal).hide();

        currentPage = 1;
        refreshTable();

        alert(id ? "Cập nhật phiếu khám thành công." : "Tạo phiếu khám thành công.");
    });

    elements.exportButton.addEventListener("click", exportCSV);

    // Khởi tạo giao diện.
    renderTable();
})();
/* =====================================
   QUẢN LÝ DỊCH VỤ - MEDCARE
===================================== */
(function () {
    "use strict";

    const tableBody = document.getElementById("serviceTableBody");

    // Chỉ chạy trên trang quản lý dịch vụ.
    if (!tableBody) return;

    const STORAGE_KEY = "medcare_service_records";
    const PAGE_SIZE = 5;

    const $ = (id) => document.getElementById(id);

    const el = {
        total: $("totalServices"),
        active: $("activeServices"),
        inactive: $("inactiveServices"),
        search: $("serviceSearch"),
        categoryFilter: $("serviceCategoryFilter"),
        statusFilter: $("serviceStatusFilter"),
        resultCount: $("serviceResultCount"),
        pagination: $("servicePagination"),
        addButton: $("addServiceBtn"),
        exportButton: $("exportServicesBtn"),
        modal: $("serviceModal"),
        form: $("serviceForm"),
        modalTitle: $("serviceModalTitle"),
        id: $("serviceId"),
        name: $("serviceName"),
        category: $("serviceCategory"),
        price: $("servicePrice"),
        duration: $("serviceDuration"),
        description: $("serviceDescription"),
        status: $("serviceStatus"),
        saveButton: $("saveServiceBtn"),
        detailModal: $("serviceDetailModal"),
        detailTitle: $("serviceDetailTitle"),
        detailContent: $("serviceDetailContent")
    };

    const statusLabels = {
        active: "Đang hoạt động",
        inactive: "Tạm ngừng"
    };

    const categoryIcons = {
        "Khám bệnh": "bi-person-heart",
        "Xét nghiệm": "bi-droplet-half",
        "Chẩn đoán hình ảnh": "bi-activity",
        "Thăm dò chức năng": "bi-heart-pulse",
        "Khác": "bi-plus-circle"
    };

    let currentPage = 1;
    let services = loadServices();

    function createInitialServices() {
        return [
            {
                id: "DV-001",
                name: "Khám bệnh tổng quát",
                category: "Khám bệnh",
                price: 200000,
                duration: 30,
                description: "Khám và đánh giá tình trạng sức khỏe tổng quát.",
                status: "active"
            },
            {
                id: "DV-002",
                name: "Khám chuyên khoa",
                category: "Khám bệnh",
                price: 250000,
                duration: 30,
                description: "Khám, tư vấn và đánh giá tình trạng theo chuyên khoa.",
                status: "active"
            },
            {
                id: "DV-003",
                name: "Xét nghiệm công thức máu",
                category: "Xét nghiệm",
                price: 150000,
                duration: 20,
                description: "Xét nghiệm các thành phần tế bào máu theo chỉ định.",
                status: "active"
            },
            {
                id: "DV-004",
                name: "Xét nghiệm đường huyết",
                category: "Xét nghiệm",
                price: 80000,
                duration: 15,
                description: "Kiểm tra chỉ số đường huyết theo chỉ định chuyên môn.",
                status: "active"
            },
            {
                id: "DV-005",
                name: "Siêu âm ổ bụng",
                category: "Chẩn đoán hình ảnh",
                price: 250000,
                duration: 30,
                description: "Khảo sát các cơ quan trong ổ bụng bằng siêu âm.",
                status: "active"
            },
            {
                id: "DV-006",
                name: "Chụp X-quang",
                category: "Chẩn đoán hình ảnh",
                price: 180000,
                duration: 20,
                description: "Chẩn đoán hình ảnh theo chỉ định của bác sĩ.",
                status: "inactive"
            },
            {
                id: "DV-007",
                name: "Điện tâm đồ",
                category: "Thăm dò chức năng",
                price: 120000,
                duration: 15,
                description: "Ghi nhận hoạt động điện của tim theo chỉ định.",
                status: "active"
            },
            {
                id: "DV-008",
                name: "Tư vấn sức khỏe",
                category: "Khác",
                price: 100000,
                duration: 20,
                description: "Tư vấn thông tin chăm sóc sức khỏe và phòng bệnh.",
                status: "inactive"
            }
        ];
    }

    function loadServices() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored !== null) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : createInitialServices();
            }
        } catch (error) {
            console.error("Không thể đọc danh sách dịch vụ:", error);
        }

        return createInitialServices();
    }

    function saveServices() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
            return true;
        } catch (error) {
            console.error("Không thể lưu danh sách dịch vụ:", error);
            alert("Không thể lưu dữ liệu. Vui lòng kiểm tra bộ nhớ trình duyệt.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function formatPrice(value) {
        return Number(value).toLocaleString("vi-VN") + " ₫";
    }

    function getStatusHTML(status) {
        const label = statusLabels[status] || "Chưa xác định";
        const className = status === "active" ? "status-active" : "status-inactive";

        return `
            <span class="service-status ${className}">
                ${escapeHTML(label)}
            </span>
        `;
    }

    function getIcon(category) {
        return categoryIcons[category] || categoryIcons["Khác"];
    }

    function getFilteredServices() {
        const keyword = el.search.value.trim().toLocaleLowerCase("vi");
        const category = el.categoryFilter.value;
        const status = el.statusFilter.value;

        return services.filter((service) => {
            const searchText = [
                service.id,
                service.name,
                service.category,
                service.description
            ].join(" ").toLocaleLowerCase("vi");

            return (
                (!keyword || searchText.includes(keyword)) &&
                (!category || service.category === category) &&
                (!status || service.status === status)
            );
        }).sort((a, b) => a.id.localeCompare(b.id));
    }

    function renderStats() {
        el.total.textContent = services.length;

        el.active.textContent = services.filter(
            (service) => service.status === "active"
        ).length;

        el.inactive.textContent = services.filter(
            (service) => service.status === "inactive"
        ).length;
    }

    function renderTable() {
        const filtered = getFilteredServices();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageServices = filtered.slice(startIndex, startIndex + PAGE_SIZE);

        if (pageServices.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="service-empty">
                        <i class="bi bi-search"></i>
                        Không tìm thấy dịch vụ phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageServices.map((service) => `
                <tr>
                    <td>
                        <span class="service-code">
                            ${escapeHTML(service.id)}
                        </span>
                    </td>

                    <td>
                        <div class="service-name-cell">
                            <div class="service-icon">
                                <i class="bi ${getIcon(service.category)}"></i>
                            </div>
                            <div class="service-name-info">
                                <span class="service-name">
                                    ${escapeHTML(service.name)}
                                </span>
                                <span class="service-description-short">
                                    ${escapeHTML(service.description || "Chưa có mô tả")}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="service-category">
                            ${escapeHTML(service.category)}
                        </span>
                    </td>

                    <td>
                        <span class="service-price">
                            ${formatPrice(service.price)}
                        </span>
                    </td>

                    <td>
                        <span class="service-duration">
                            ${Number(service.duration)} phút
                        </span>
                    </td>

                    <td>${getStatusHTML(service.status)}</td>

                    <td>
                        <div class="service-actions">
                            <button type="button"
                                class="service-action-btn"
                                data-action="view"
                                data-id="${escapeHTML(service.id)}"
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button type="button"
                                class="service-action-btn"
                                data-action="edit"
                                data-id="${escapeHTML(service.id)}"
                                title="Chỉnh sửa"
                                aria-label="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>

                            <button type="button"
                                class="service-action-btn service-delete"
                                data-action="delete"
                                data-id="${escapeHTML(service.id)}"
                                title="Xóa dịch vụ"
                                aria-label="Xóa dịch vụ">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        const from = filtered.length ? startIndex + 1 : 0;
        const to = Math.min(startIndex + PAGE_SIZE, filtered.length);

        el.resultCount.textContent =
            `Hiển thị ${from}–${to} trong ${filtered.length} dịch vụ`;

        renderPagination(totalPages);
        renderStats();
    }

    function renderPagination(totalPages) {
        let html = `
            <button type="button"
                data-page="${currentPage - 1}"
                aria-label="Trang trước"
                ${currentPage <= 1 ? "disabled" : ""}>
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button type="button"
                    data-page="${page}"
                    class="${page === currentPage ? "active" : ""}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;
        }

        html += `
            <button type="button"
                data-page="${currentPage + 1}"
                aria-label="Trang sau"
                ${currentPage >= totalPages ? "disabled" : ""}>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        el.pagination.innerHTML = html;
    }

    function refreshTable(resetPage = false) {
        if (resetPage) currentPage = 1;
        renderTable();
    }

    function createNextId() {
        const numbers = services.map((service) => {
            const match = String(service.id).match(/^DV-(\d+)$/);
            return match ? Number(match[1]) : 0;
        });

        return `DV-${String(Math.max(0, ...numbers) + 1).padStart(3, "0")}`;
    }

    function resetForm() {
        el.form.reset();
        el.id.value = "";
        el.status.value = "active";
    }

    function openCreateModal() {
        resetForm();

        el.modalTitle.textContent = "Thêm dịch vụ";
        el.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu dịch vụ';

        bootstrap.Modal.getOrCreateInstance(el.modal).show();
    }

    function openEditModal(id) {
        const service = services.find((item) => item.id === id);
        if (!service) return;

        resetForm();

        el.id.value = service.id;
        el.name.value = service.name;
        el.category.value = service.category;
        el.price.value = service.price;
        el.duration.value = service.duration;
        el.description.value = service.description || "";
        el.status.value = service.status;

        el.modalTitle.textContent = `Chỉnh sửa ${service.id}`;
        el.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Cập nhật dịch vụ';

        bootstrap.Modal.getOrCreateInstance(el.modal).show();
    }

    function openDetailModal(id) {
        const service = services.find((item) => item.id === id);
        if (!service) return;

        el.detailTitle.textContent = `Chi tiết ${service.id}`;

        el.detailContent.innerHTML = `
            <div class="service-detail-grid">
                <div class="service-detail-item">
                    <span class="service-detail-label">Mã dịch vụ</span>
                    <span class="service-detail-value">${escapeHTML(service.id)}</span>
                </div>

                <div class="service-detail-item">
                    <span class="service-detail-label">Trạng thái</span>
                    <span class="service-detail-value">${getStatusHTML(service.status)}</span>
                </div>

                <div class="service-detail-item detail-full">
                    <span class="service-detail-label">Tên dịch vụ</span>
                    <span class="service-detail-value">${escapeHTML(service.name)}</span>
                </div>

                <div class="service-detail-item">
                    <span class="service-detail-label">Loại dịch vụ</span>
                    <span class="service-detail-value">${escapeHTML(service.category)}</span>
                </div>

                <div class="service-detail-item">
                    <span class="service-detail-label">Đơn giá</span>
                    <span class="service-detail-value">${formatPrice(service.price)}</span>
                </div>

                <div class="service-detail-item">
                    <span class="service-detail-label">Thời lượng</span>
                    <span class="service-detail-value">${Number(service.duration)} phút</span>
                </div>

                <div class="service-detail-item detail-full">
                    <span class="service-detail-label">Mô tả dịch vụ</span>
                    <span class="service-detail-value">${escapeHTML(service.description || "Chưa có mô tả")}</span>
                </div>
            </div>
        `;

        bootstrap.Modal.getOrCreateInstance(el.detailModal).show();
    }

    function deleteService(id) {
        const service = services.find((item) => item.id === id);
        if (!service) return;

        const confirmed = confirm(
            `Bạn có chắc muốn xóa dịch vụ "${service.name}" (${service.id})?`
        );

        if (!confirmed) return;

        const previousServices = services;
        services = services.filter((item) => item.id !== id);

        if (!saveServices()) {
            services = previousServices;
            return;
        }

        refreshTable();
    }

    function exportCSV() {
        const filtered = getFilteredServices();

        if (filtered.length === 0) {
            alert("Không có dịch vụ để xuất.");
            return;
        }

        const columns = [
            ["Mã dịch vụ", "id"],
            ["Tên dịch vụ", "name"],
            ["Loại dịch vụ", "category"],
            ["Đơn giá", "price"],
            ["Thời lượng (phút)", "duration"],
            ["Mô tả", "description"],
            ["Trạng thái", "status"]
        ];

        function csvCell(value) {
            return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }

        const rows = [
            columns.map(([label]) => csvCell(label)).join(","),
            ...filtered.map((service) =>
                columns.map(([, key]) => {
                    const value = key === "status"
                        ? statusLabels[service[key]]
                        : service[key];

                    return csvCell(value);
                }).join(",")
            )
        ];

        const blob = new Blob(
            ["\uFEFF" + rows.join("\r\n")],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-dich-vu.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    // Sự kiện nút và bộ lọc.
    el.addButton.addEventListener("click", openCreateModal);

    el.search.addEventListener("input", () => refreshTable(true));

    el.categoryFilter.addEventListener("change", () => refreshTable(true));

    el.statusFilter.addEventListener("change", () => refreshTable(true));

    el.exportButton.addEventListener("click", exportCSV);

    el.pagination.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");

        if (!button || button.disabled) return;

        const page = Number(button.dataset.page);
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredServices().length / PAGE_SIZE)
        );

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderTable();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === "view") openDetailModal(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") deleteService(id);
    });

    el.form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!el.form.reportValidity()) return;

        const price = Number(el.price.value);
        const duration = Number(el.duration.value);

        if (
            !Number.isFinite(price) ||
            price < 0 ||
            price > 1000000000 ||
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 1440
        ) {
            alert("Vui lòng kiểm tra lại đơn giá và thời lượng dịch vụ.");
            return;
        }

        const id = el.id.value;

        const service = {
            id: id || createNextId(),
            name: el.name.value.trim(),
            category: el.category.value,
            price,
            duration,
            description: el.description.value.trim(),
            status: el.status.value
        };

        if (
            !service.name ||
            !service.category ||
            !statusLabels[service.status]
        ) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        const previousServices = services;

        if (id) {
            services = services.map((item) =>
                item.id === id ? service : item
            );
        } else {
            services = [...services, service];
        }

        if (!saveServices()) {
            services = previousServices;
            return;
        }

        bootstrap.Modal.getOrCreateInstance(el.modal).hide();

        currentPage = 1;
        refreshTable();

        alert(id
            ? "Cập nhật dịch vụ thành công."
            : "Thêm dịch vụ thành công."
        );
    });

    // Khởi tạo trang.
    renderTable();
})();

/* ==================== hóa đơn ==================== */
(() => {
    const tableBody = document.getElementById("invoiceTableBody");
    if (!tableBody) return;

    const STORAGE_KEY = "medcare_invoice_records";
    const PAGE_SIZE = 5;

    const $ = (id) => document.getElementById(id);

    const statusLabels = {
        paid: "Đã thanh toán",
        unpaid: "Chưa thanh toán",
        cancelled: "Đã hủy"
    };

    const methodLabels = {
        cash: "Tiền mặt",
        transfer: "Chuyển khoản",
        card: "Thẻ ngân hàng"
    };

    const methodIcons = {
        cash: "bi-cash",
        transfer: "bi-bank",
        card: "bi-credit-card"
    };

    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const initialInvoices = [
        {
            id: "HD-001",
            patient: "Nguyễn Minh Anh",
            date: "2026-10-15",
            amount: 450000,
            method: "cash",
            status: "paid",
            note: "Khám tổng quát và xét nghiệm"
        },
        {
            id: "HD-002",
            patient: "Trần Quốc Bảo",
            date: "2026-10-16",
            amount: 650000,
            method: "transfer",
            status: "paid",
            note: "Khám chuyên khoa"
        },
        {
            id: "HD-003",
            patient: "Lê Thu Hà",
            date: "2026-10-17",
            amount: 320000,
            method: "card",
            status: "unpaid",
            note: ""
        },
        {
            id: "HD-004",
            patient: "Phạm Hoàng Nam",
            date: "2026-10-18",
            amount: 850000,
            method: "transfer",
            status: "paid",
            note: "Khám và chẩn đoán hình ảnh"
        },
        {
            id: "HD-005",
            patient: "Võ Ngọc Linh",
            date: "2026-10-19",
            amount: 250000,
            method: "cash",
            status: "unpaid",
            note: "Khám chuyên khoa"
        },
        {
            id: "HD-006",
            patient: "Đỗ Thành Công",
            date: "2026-10-19",
            amount: 180000,
            method: "card",
            status: "cancelled",
            note: "Hóa đơn đã hủy"
        },
        {
            id: "HD-007",
            patient: "Nguyễn Thảo Vy",
            date: "2026-10-20",
            amount: 520000,
            method: "transfer",
            status: "paid",
            note: "Khám tổng quát"
        },
        {
            id: "HD-008",
            patient: "Bùi Đức Huy",
            date: "2026-10-20",
            amount: 300000,
            method: "cash",
            status: "unpaid",
            note: ""
        }
    ];

    let invoices = loadInvoices();
    let currentPage = 1;
    let selectedInvoiceId = null;
    let detailModalInstance = null;
    let formModalInstance = null;

    function loadInvoices() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored !== null) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.error("Không thể đọc dữ liệu hóa đơn:", error);
        }

        return initialInvoices.map(invoice => ({ ...invoice }));
    }

    function saveInvoices() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
            return true;
        } catch (error) {
            console.error("Không thể lưu dữ liệu hóa đơn:", error);
            alert("Không thể lưu dữ liệu. Vui lòng kiểm tra bộ nhớ trình duyệt.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatMoney(amount) {
        return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
    }

    function formatDate(date) {
        if (!date) return "—";

        const parts = date.split("-");
        if (parts.length !== 3) return escapeHTML(date);

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getStatusBadge(status) {
        const label = statusLabels[status] || "Không xác định";
        const className = {
            paid: "status-paid",
            unpaid: "status-unpaid",
            cancelled: "status-cancelled"
        }[status] || "status-unpaid";

        const icon = {
            paid: "bi-check-circle-fill",
            unpaid: "bi-clock-fill",
            cancelled: "bi-x-circle-fill"
        }[status] || "bi-question-circle";

        return `
            <span class="invoice-status ${className}">
                <i class="bi ${icon}"></i>
                ${label}
            </span>
        `;
    }

    function getMethodHTML(method) {
        return `
            <span class="invoice-method">
                <i class="bi ${methodIcons[method] || "bi-wallet2"}"></i>
                ${escapeHTML(methodLabels[method] || method || "—")}
            </span>
        `;
    }

    function getFilteredInvoices() {
        const keyword = $("invoiceSearch").value.trim().toLocaleLowerCase("vi");
        const status = $("invoiceStatusFilter").value;
        const method = $("invoiceMethodFilter").value;

        return invoices
            .filter(invoice => {
                const searchText = [
                    invoice.id,
                    invoice.patient,
                    invoice.note
                ].join(" ").toLocaleLowerCase("vi");

                return (
                    (!keyword || searchText.includes(keyword)) &&
                    (!status || invoice.status === status) &&
                    (!method || invoice.method === method)
                );
            })
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    }

    function renderStats() {
        const paid = invoices.filter(invoice => invoice.status === "paid");
        const unpaid = invoices.filter(invoice => invoice.status === "unpaid");
        const revenue = paid.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

        $("invoiceTotalCount").textContent = invoices.length;
        $("invoicePaidCount").textContent = paid.length;
        $("invoiceUnpaidCount").textContent = unpaid.length;
        $("invoiceRevenue").textContent = formatMoney(revenue);
    }

    function renderTable() {
        const filtered = getFilteredInvoices();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const visible = filtered.slice(start, start + PAGE_SIZE);

        if (!visible.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="invoice-empty">
                        <i class="bi bi-receipt"></i>
                        <div>Không tìm thấy hóa đơn phù hợp.</div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = visible.map(invoice => `
                <tr>
                    <td>
                        <span class="invoice-code">${escapeHTML(invoice.id)}</span>
                    </td>
                    <td>
                        <div class="invoice-patient">
                            <div class="invoice-patient-avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div class="invoice-patient-info">
                                <span class="invoice-patient-name">${escapeHTML(invoice.patient)}</span>
                                <span class="invoice-patient-note">${escapeHTML(invoice.note || "Hóa đơn khám bệnh")}</span>
                            </div>
                        </div>
                    </td>
                    <td>${formatDate(invoice.date)}</td>
                    <td><span class="invoice-amount">${formatMoney(invoice.amount)}</span></td>
                    <td>${getMethodHTML(invoice.method)}</td>
                    <td>${getStatusBadge(invoice.status)}</td>
                    <td>
                        <div class="invoice-actions">
                            <button type="button" class="invoice-action-btn"
                                data-action="view" data-id="${escapeHTML(invoice.id)}"
                                title="Xem chi tiết" aria-label="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="invoice-action-btn"
                                data-action="edit" data-id="${escapeHTML(invoice.id)}"
                                title="Chỉnh sửa" aria-label="Chỉnh sửa">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button type="button" class="invoice-action-btn invoice-delete"
                                data-action="delete" data-id="${escapeHTML(invoice.id)}"
                                title="Xóa hóa đơn" aria-label="Xóa hóa đơn">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        const from = filtered.length ? start + 1 : 0;
        const to = Math.min(start + PAGE_SIZE, filtered.length);

        $("invoiceResultCount").textContent =
            `Hiển thị ${from}–${to} trong ${filtered.length} hóa đơn`;

        renderPagination(totalPages);
        renderStats();
    }

    function renderPagination(totalPages) {
        const pagination = $("invoicePagination");
        let html = `
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                <button type="button" class="page-link" data-page="${currentPage - 1}"
                    aria-label="Trang trước" ${currentPage === 1 ? "disabled" : ""}>
                    <i class="bi bi-chevron-left"></i>
                </button>
            </li>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <li class="page-item ${page === currentPage ? "active" : ""}">
                    <button type="button" class="page-link" data-page="${page}"
                        ${page === currentPage ? 'aria-current="page"' : ""}>
                        ${page}
                    </button>
                </li>
            `;
        }

        html += `
            <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
                <button type="button" class="page-link" data-page="${currentPage + 1}"
                    aria-label="Trang sau" ${currentPage === totalPages ? "disabled" : ""}>
                    <i class="bi bi-chevron-right"></i>
                </button>
            </li>
        `;

        pagination.innerHTML = html;
    }

    function refresh() {
        renderTable();
    }

    function generateInvoiceId() {
        let maxNumber = 0;

        invoices.forEach(invoice => {
            const match = String(invoice.id).match(/^HD-(\d+)$/);
            if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
        });

        return `HD-${String(maxNumber + 1).padStart(3, "0")}`;
    }

    function openForm(invoice = null) {
        $("invoiceForm").reset();
        $("invoiceId").value = invoice ? invoice.id : "";
        $("invoiceModalTitle").textContent = invoice ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn";
        $("saveInvoiceBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i> Lưu hóa đơn';

        $("invoicePatientName").value = invoice?.patient || "";
        $("invoiceDate").value = invoice?.date || localToday;
        $("invoiceAmount").value = invoice?.amount ?? "";
        $("invoiceMethod").value = invoice?.method || "cash";
        $("invoiceStatus").value = invoice?.status || "unpaid";
        $("invoiceNote").value = invoice?.note || "";

        formModalInstance.show();
    }

    function openDetail(id) {
        const invoice = invoices.find(item => item.id === id);
        if (!invoice) return;

        selectedInvoiceId = id;
        $("invoiceDetailTitle").textContent = `Chi tiết ${invoice.id}`;

        $("invoiceDetailContent").innerHTML = `
            <div class="invoice-detail-grid">
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Mã hóa đơn</span>
                    <span class="invoice-detail-value">${escapeHTML(invoice.id)}</span>
                </div>
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Ngày lập</span>
                    <span class="invoice-detail-value">${formatDate(invoice.date)}</span>
                </div>
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Bệnh nhân</span>
                    <span class="invoice-detail-value">${escapeHTML(invoice.patient)}</span>
                </div>
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Phương thức thanh toán</span>
                    <span class="invoice-detail-value">${escapeHTML(methodLabels[invoice.method] || invoice.method)}</span>
                </div>
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Trạng thái thanh toán</span>
                    <span class="invoice-detail-value">${getStatusBadge(invoice.status)}</span>
                </div>
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">Ghi chú</span>
                    <span class="invoice-detail-value">${escapeHTML(invoice.note || "Không có ghi chú")}</span>
                </div>
            </div>
            <div class="invoice-detail-total d-flex justify-content-between align-items-center gap-3">
                <span>Tổng thanh toán</span>
                <strong>${formatMoney(invoice.amount)}</strong>
            </div>
        `;

        detailModalInstance.show();
    }

    function exportCSV() {
        const rows = getFilteredInvoices();

        if (!rows.length) {
            alert("Không có hóa đơn để xuất.");
            return;
        }

        const headers = [
            "Mã hóa đơn",
            "Bệnh nhân",
            "Ngày lập",
            "Tổng tiền",
            "Phương thức",
            "Trạng thái",
            "Ghi chú"
        ];

        const csvCell = value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"';

        const data = [
            headers,
            ...rows.map(invoice => [
                invoice.id,
                invoice.patient,
                invoice.date,
                invoice.amount,
                methodLabels[invoice.method] || invoice.method,
                statusLabels[invoice.status] || invoice.status,
                invoice.note || ""
            ])
        ];

        const csv = "\uFEFF" + data.map(row => row.map(csvCell).join(",")).join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-hoa-don.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    $("addInvoiceBtn").addEventListener("click", () => openForm());

    $("invoiceSearch").addEventListener("input", () => {
        currentPage = 1;
        refresh();
    });

    $("invoiceStatusFilter").addEventListener("change", () => {
        currentPage = 1;
        refresh();
    });

    $("invoiceMethodFilter").addEventListener("change", () => {
        currentPage = 1;
        refresh();
    });

    $("invoicePagination").addEventListener("click", event => {
        const button = event.target.closest("[data-page]");
        if (!button || button.disabled) return;

        const page = Number(button.dataset.page);
        const totalPages = Math.max(1, Math.ceil(getFilteredInvoices().length / PAGE_SIZE));

        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderTable();
        }
    });

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;
        const invoice = invoices.find(item => item.id === id);
        if (!invoice) return;

        if (action === "view") {
            openDetail(id);
        } else if (action === "edit") {
            openForm(invoice);
        } else if (action === "delete") {
            const confirmed = confirm(`Bạn có chắc muốn xóa hóa đơn ${id} không?`);
            if (!confirmed) return;

            const oldInvoices = invoices;
            invoices = invoices.filter(item => item.id !== id);

            if (!saveInvoices()) {
                invoices = oldInvoices;
                return;
            }

            refresh();
        }
    });

    $("invoiceForm").addEventListener("submit", event => {
        event.preventDefault();

        const id = $("invoiceId").value;
        const patient = $("invoicePatientName").value.trim();
        const date = $("invoiceDate").value;
        const amount = Number($("invoiceAmount").value);
        const method = $("invoiceMethod").value;
        const status = $("invoiceStatus").value;
        const note = $("invoiceNote").value.trim();

        if (!patient || !date || !Number.isFinite(amount) || amount < 0) {
            alert("Vui lòng kiểm tra lại thông tin hóa đơn.");
            return;
        }

        if (!Object.hasOwn(methodLabels, method) || !Object.hasOwn(statusLabels, status)) {
            alert("Phương thức hoặc trạng thái thanh toán không hợp lệ.");
            return;
        }

        const duplicate = invoices.some(invoice =>
            invoice.id === id && invoice.id !== $("invoiceId").value
        );

        if (duplicate) {
            alert("Mã hóa đơn đã tồn tại.");
            return;
        }

        const oldInvoices = invoices.map(invoice => ({ ...invoice }));

        if (id) {
            const index = invoices.findIndex(invoice => invoice.id === id);
            if (index === -1) return;

            invoices[index] = {
                ...invoices[index],
                patient,
                date,
                amount,
                method,
                status,
                note
            };
        } else {
            invoices.push({
                id: generateInvoiceId(),
                patient,
                date,
                amount,
                method,
                status,
                note
            });
        }

        if (!saveInvoices()) {
            invoices = oldInvoices;
            return;
        }

        currentPage = 1;
        refresh();
        formModalInstance.hide();
    });

    $("editInvoiceFromDetail").addEventListener("click", () => {
        const invoice = invoices.find(item => item.id === selectedInvoiceId);
        if (!invoice) return;

        detailModalInstance.hide();
        openForm(invoice);
    });

    $("exportInvoicesBtn").addEventListener("click", exportCSV);

    formModalInstance = bootstrap.Modal.getOrCreateInstance($("invoiceModal"));
    detailModalInstance = bootstrap.Modal.getOrCreateInstance($("invoiceDetailModal"));

    refresh();
})();

/* =====================================================
   ACCOUNT MANAGEMENT - TAI-KHOAN.HTML
   Dữ liệu thử nghiệm, chưa kết nối backend.
   Không lưu mật khẩu vào localStorage.
   ===================================================== */

(() => {
    "use strict";

    const tableBody = document.getElementById("accountTableBody");

    // Chỉ chạy trên trang quản lý tài khoản.
    if (!tableBody) return;

    const STORAGE_KEY = "medcare_account_records";
    const PAGE_SIZE = 5;

    const $ = (id) => document.getElementById(id);

    const elements = {
        total: $("accountTotalCount"),
        active: $("accountActiveCount"),
        locked: $("accountLockedCount"),

        search: $("accountSearch"),
        roleFilter: $("accountRoleFilter"),
        statusFilter: $("accountStatusFilter"),

        resultCount: $("accountResultCount"),
        pagination: $("accountPagination"),

        addBtn: $("addAccountBtn"),
        exportBtn: $("exportAccountsBtn"),

        modal: $("accountModal"),
        modalTitle: $("accountModalTitle"),
        form: $("accountForm"),
        id: $("accountId"),
        username: $("accountUsername"),
        fullName: $("accountFullName"),
        password: $("accountPassword"),
        passwordRequired: $("accountPasswordRequired"),
        passwordHint: $("accountPasswordHint"),
        role: $("accountRole"),
        status: $("accountStatus"),
        saveBtn: $("saveAccountBtn"),

        detailModal: $("accountDetailModal"),
        detailTitle: $("accountDetailTitle"),
        detailContent: $("accountDetailContent"),
        editFromDetail: $("editAccountFromDetail")
    };

    const accountModal = bootstrap.Modal.getOrCreateInstance(elements.modal);
    const detailModal = bootstrap.Modal.getOrCreateInstance(elements.detailModal);

    let currentPage = 1;
    let selectedAccountId = null;
    let accounts = loadAccounts();

    const roleNames = {
        admin: "Quản trị viên",
        doctor: "Bác sĩ",
        staff: "Nhân viên"
    };

    const statusNames = {
        active: "Đang hoạt động",
        locked: "Đã khóa"
    };

    function createSeedAccounts() {
        return [
            {
                id: "TK001",
                username: "admin",
                fullName: "Quản trị viên",
                role: "admin",
                createdAt: "2026-10-01",
                status: "active"
            },
            {
                id: "TK002",
                username: "nguyenvana",
                fullName: "Nguyễn Văn An",
                role: "doctor",
                createdAt: "2026-10-03",
                status: "active"
            },
            {
                id: "TK003",
                username: "tranthibinh",
                fullName: "Trần Thị Bình",
                role: "staff",
                createdAt: "2026-10-05",
                status: "active"
            },
            {
                id: "TK004",
                username: "levancuong",
                fullName: "Lê Văn Cường",
                role: "doctor",
                createdAt: "2026-10-08",
                status: "locked"
            },
            {
                id: "TK005",
                username: "phamthilan",
                fullName: "Phạm Thị Lan",
                role: "staff",
                createdAt: "2026-10-10",
                status: "active"
            },
            {
                id: "TK006",
                username: "hoangminh",
                fullName: "Hoàng Minh",
                role: "staff",
                createdAt: "2026-10-12",
                status: "locked"
            },
            {
                id: "TK007",
                username: "bacsitue",
                fullName: "Nguyễn Minh Tuệ",
                role: "doctor",
                createdAt: "2026-10-15",
                status: "active"
            }
        ];
    }

    function loadAccounts() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.error("Không thể đọc dữ liệu tài khoản:", error);
        }

        const initial = createSeedAccounts();
        saveAccounts(initial);
        return initial;
    }

    function saveAccounts(data = accounts) {
        try {
            // Chỉ lưu thông tin hiển thị, tuyệt đối không lưu mật khẩu.
            const safeData = data.map(({ id, username, fullName, role, createdAt, status }) => ({
                id,
                username,
                fullName,
                role,
                createdAt,
                status
            }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
        } catch (error) {
            console.error("Không thể lưu dữ liệu tài khoản:", error);
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra dung lượng lưu trữ.");
        }
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

    function formatDate(value) {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return escapeHTML(value);

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getRoleClass(role) {
        return {
            admin: "account-role-admin",
            doctor: "account-role-doctor",
            staff: "account-role-staff"
        }[role] || "account-role-staff";
    }

    function getFilteredAccounts() {
        const keyword = elements.search.value.trim().toLocaleLowerCase("vi");
        const role = elements.roleFilter.value;
        const status = elements.statusFilter.value;

        return accounts.filter((account) => {
            const searchableText =
                `${account.username} ${account.fullName} ${account.id}`
                    .toLocaleLowerCase("vi");

            return (
                (!keyword || searchableText.includes(keyword)) &&
                (!role || account.role === role) &&
                (!status || account.status === status)
            );
        });
    }

    function renderStats() {
        elements.total.textContent = accounts.length;
        elements.active.textContent =
            accounts.filter((account) => account.status === "active").length;
        elements.locked.textContent =
            accounts.filter((account) => account.status === "locked").length;
    }

    function renderTable() {
        const filtered = getFilteredAccounts();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageAccounts = filtered.slice(startIndex, startIndex + PAGE_SIZE);

        if (pageAccounts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="account-empty-state">
                        <i class="bi bi-person-exclamation"></i>
                        Không tìm thấy tài khoản phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageAccounts.map((account) => {
                const statusClass = account.status === "active"
                    ? "account-status-active"
                    : "account-status-locked";

                const statusIcon = account.status === "active"
                    ? "bi-check-circle-fill"
                    : "bi-lock-fill";

                const toggleTitle = account.status === "active"
                    ? "Khóa tài khoản"
                    : "Mở khóa tài khoản";

                const toggleIcon = account.status === "active"
                    ? "bi-lock"
                    : "bi-unlock";

                const toggleClass = account.status === "active"
                    ? "account-lock-action"
                    : "account-unlock-action";

                return `
                    <tr>
                        <td>
                            <div class="account-user-cell">
                                <div class="account-user-avatar">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                                <div class="account-user-info">
                                    <span class="account-username">
                                        ${escapeHTML(account.username)}
                                    </span>
                                    <span class="account-secondary">
                                        ${escapeHTML(account.id)}
                                    </span>
                                </div>
                            </div>
                        </td>

                        <td>${escapeHTML(account.fullName)}</td>

                        <td>
                            <span class="account-role-badge ${getRoleClass(account.role)}">
                                ${escapeHTML(roleNames[account.role] || account.role)}
                            </span>
                        </td>

                        <td>${formatDate(account.createdAt)}</td>

                        <td>
                            <span class="account-status-badge ${statusClass}">
                                <i class="bi ${statusIcon}"></i>
                                ${escapeHTML(statusNames[account.status] || account.status)}
                            </span>
                        </td>

                        <td>
                            <div class="account-action-group">
                                <button
                                    type="button"
                                    class="account-action-btn"
                                    data-account-action="view"
                                    data-account-id="${escapeHTML(account.id)}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="account-action-btn"
                                    data-account-action="edit"
                                    data-account-id="${escapeHTML(account.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button
                                    type="button"
                                    class="account-action-btn ${toggleClass}"
                                    data-account-action="toggle"
                                    data-account-id="${escapeHTML(account.id)}"
                                    title="${toggleTitle}"
                                    aria-label="${toggleTitle}">
                                    <i class="bi ${toggleIcon}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        const first = filtered.length ? startIndex + 1 : 0;
        const last = Math.min(startIndex + PAGE_SIZE, filtered.length);

        elements.resultCount.textContent =
            `Hiển thị ${first}–${last} trong tổng số ${filtered.length} tài khoản`;

        renderPagination(totalPages);
        renderStats();
    }

    function renderPagination(totalPages) {
        let html = `
            <button
                type="button"
                class="account-page-btn"
                data-account-page="${currentPage - 1}"
                aria-label="Trang trước"
                ${currentPage === 1 ? "disabled" : ""}>
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button
                    type="button"
                    class="account-page-btn ${page === currentPage ? "active" : ""}"
                    data-account-page="${page}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;
        }

        html += `
            <button
                type="button"
                class="account-page-btn"
                data-account-page="${currentPage + 1}"
                aria-label="Trang sau"
                ${currentPage === totalPages ? "disabled" : ""}>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        elements.pagination.innerHTML = html;
    }

    function openAddForm() {
        elements.form.reset();
        elements.id.value = "";
        elements.modalTitle.textContent = "Thêm tài khoản";
        elements.saveBtn.innerHTML = '<i class="bi bi-check-lg"></i> Lưu thông tin';

        elements.password.required = true;
        elements.passwordRequired.style.display = "";
        elements.passwordHint.textContent =
            "Mật khẩu cần có ít nhất 6 ký tự. Mật khẩu không được lưu trong bản demo.";

        accountModal.show();
    }

    function openEditForm(id) {
        const account = accounts.find((item) => item.id === id);
        if (!account) return;

        elements.form.reset();
        elements.id.value = account.id;
        elements.username.value = account.username;
        elements.fullName.value = account.fullName;
        elements.role.value = account.role;
        elements.status.value = account.status;
        elements.password.value = "";

        elements.modalTitle.textContent = "Chỉnh sửa tài khoản";
        elements.saveBtn.innerHTML = '<i class="bi bi-check-lg"></i> Lưu thay đổi';

        // Bản demo không lưu hoặc thay đổi mật khẩu thật.
        elements.password.required = false;
        elements.passwordRequired.style.display = "none";
        elements.passwordHint.textContent =
            "Bản demo không xử lý thay đổi mật khẩu. Để trống trường này.";

        accountModal.show();
    }

    function openDetail(id) {
        const account = accounts.find((item) => item.id === id);
        if (!account) return;

        selectedAccountId = id;
        elements.detailTitle.textContent = `Tài khoản ${account.username}`;

        const statusClass = account.status === "active"
            ? "account-status-active"
            : "account-status-locked";

        elements.detailContent.innerHTML = `
            <div class="account-detail-list">
                <div class="account-detail-row">
                    <span class="account-detail-label">Mã tài khoản</span>
                    <span class="account-detail-value">${escapeHTML(account.id)}</span>
                </div>
                <div class="account-detail-row">
                    <span class="account-detail-label">Tên đăng nhập</span>
                    <span class="account-detail-value">${escapeHTML(account.username)}</span>
                </div>
                <div class="account-detail-row">
                    <span class="account-detail-label">Họ và tên</span>
                    <span class="account-detail-value">${escapeHTML(account.fullName)}</span>
                </div>
                <div class="account-detail-row">
                    <span class="account-detail-label">Vai trò</span>
                    <span class="account-detail-value">
                        ${escapeHTML(roleNames[account.role] || account.role)}
                    </span>
                </div>
                <div class="account-detail-row">
                    <span class="account-detail-label">Ngày tạo</span>
                    <span class="account-detail-value">${formatDate(account.createdAt)}</span>
                </div>
                <div class="account-detail-row">
                    <span class="account-detail-label">Trạng thái</span>
                    <span class="account-status-badge ${statusClass}">
                        ${escapeHTML(statusNames[account.status] || account.status)}
                    </span>
                </div>
            </div>
        `;

        detailModal.show();
    }

    function generateId() {
        let id;

        do {
            id = `TK${String(Date.now()).slice(-6)}`;
        } while (accounts.some((account) => account.id === id));

        return id;
    }

    elements.addBtn.addEventListener("click", openAddForm);

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();

        const id = elements.id.value;
        const username = elements.username.value.trim();
        const fullName = elements.fullName.value.trim();
        const password = elements.password.value;
        const role = elements.role.value;
        const status = elements.status.value;

        if (!username || !fullName) {
            alert("Vui lòng nhập tên đăng nhập và họ tên.");
            return;
        }

        if (!id && password.length < 6) {
            alert("Vui lòng nhập mật khẩu có ít nhất 6 ký tự cho tài khoản mới.");
            elements.password.focus();
            return;
        }

        const duplicate = accounts.some((account) =>
            account.username.toLocaleLowerCase("vi") === username.toLocaleLowerCase("vi") &&
            account.id !== id
        );

        if (duplicate) {
            alert("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
            elements.username.focus();
            return;
        }

        if (!Object.hasOwn(roleNames, role) || !Object.hasOwn(statusNames, status)) {
            alert("Vai trò hoặc trạng thái không hợp lệ.");
            return;
        }

        if (id) {
            const index = accounts.findIndex((account) => account.id === id);
            if (index === -1) return;

            accounts[index] = {
                ...accounts[index],
                username,
                fullName,
                role,
                status
            };
        } else {
            accounts.unshift({
                id: generateId(),
                username,
                fullName,
                role,
                status,
                createdAt: new Date().toLocaleDateString("en-CA")
            });
        }

        saveAccounts();
        currentPage = 1;
        renderTable();
        accountModal.hide();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-account-action]");
        if (!button) return;

        const id = button.dataset.accountId;
        const action = button.dataset.accountAction;
        const account = accounts.find((item) => item.id === id);

        if (!account) return;

        if (action === "view") {
            openDetail(id);
        } else if (action === "edit") {
            openEditForm(id);
        } else if (action === "toggle") {
            const nextStatus = account.status === "active" ? "locked" : "active";
            const actionText = nextStatus === "locked" ? "khóa" : "mở khóa";

            if (!confirm(`Bro có chắc muốn ${actionText} tài khoản "${account.username}" không?`)) {
                return;
            }

            account.status = nextStatus;
            saveAccounts();
            renderTable();
        }
    });

    elements.pagination.addEventListener("click", (event) => {
        const button = event.target.closest("[data-account-page]");
        if (!button || button.disabled) return;

        const page = Number(button.dataset.accountPage);
        const totalPages = Math.max(1, Math.ceil(getFilteredAccounts().length / PAGE_SIZE));

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderTable();
    });

    elements.search.addEventListener("input", () => {
        currentPage = 1;
        renderTable();
    });

    elements.roleFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    elements.statusFilter.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    elements.editFromDetail.addEventListener("click", () => {
        if (!selectedAccountId) return;

        const id = selectedAccountId;
        detailModal.hide();

        // Chờ modal chi tiết đóng xong rồi mới mở modal chỉnh sửa.
        elements.detailModal.addEventListener("hidden.bs.modal", function handler() {
            elements.detailModal.removeEventListener("hidden.bs.modal", handler);
            openEditForm(id);
        }, { once: true });
    });

    elements.exportBtn.addEventListener("click", () => {
        const data = getFilteredAccounts();

        if (!data.length) {
            alert("Không có tài khoản để xuất.");
            return;
        }

        const headers = [
            "Mã tài khoản",
            "Tên đăng nhập",
            "Họ và tên",
            "Vai trò",
            "Ngày tạo",
            "Trạng thái"
        ];

        const rows = data.map((account) => [
            account.id,
            account.username,
            account.fullName,
            roleNames[account.role] || account.role,
            formatDate(account.createdAt),
            statusNames[account.status] || account.status
        ]);

        const csvCell = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csv = "\uFEFF" + [headers, ...rows]
            .map((row) => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-tai-khoan.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    renderTable();
})();

/* =====================================
   MEDCARE - BÁO CÁO THỐNG KÊ
===================================== */
(() => {
    const reportTableBody = document.getElementById("reportTableBody");

    // Chỉ chạy trên trang báo cáo.
    if (!reportTableBody) return;

    const $ = (id) => document.getElementById(id);

    const periodFilter = $("reportPeriodFilter");
    const typeFilter = $("reportTypeFilter");
    const startInput = $("reportStartDate");
    const endInput = $("reportEndDate");
    const applyButton = $("applyReportFilterBtn");
    const exportButton = $("exportReportBtn");
    const errorElement = $("reportFilterError");

    const appointmentCount = $("reportAppointmentCount");
    const patientCount = $("reportPatientCount");
    const revenueElement = $("reportRevenue");

    const chartElement = $("reportChart");
    const chartTitle = $("reportChartTitle");
    const chartSubtitle = $("reportChartSubtitle");
    const legendLabel = $("reportLegendLabel");

    const tableTitle = $("reportTableTitle");
    const tableSubtitle = $("reportTableSubtitle");
    const tableHead = $("reportTableHead");
    const periodLabel = $("reportPeriodLabel");
    const resultCount = $("reportResultCount");
    const todayElement = $("reportToday");

    const moneyFormatter = new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0
    });

    const numberFormatter = new Intl.NumberFormat("vi-VN");

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function parseDate(value) {
        if (!value) return null;

        const parts = value.split("-").map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function displayDate(value) {
        const date = parseDate(value);
        if (!date) return value;

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function formatMoney(value) {
        return moneyFormatter.format(value) + " ₫";
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getPeriodLabel(value) {
        const labels = {
            "7days": "7 ngày gần nhất",
            "30days": "30 ngày gần nhất",
            "90days": "90 ngày gần nhất",
            "year": "Trong năm nay",
            "custom": "Khoảng thời gian tùy chỉnh"
        };

        return labels[value] || "Khoảng thời gian đã chọn";
    }

    // Tạo dữ liệu trình diễn tại trình duyệt cho giao diện báo cáo.
    // Khi tích hợp backend, thay phần này bằng dữ liệu trả về từ hệ thống.
    function createReportRecords() {
        const records = [];
        const today = startOfDay(new Date());

        for (let offset = 364; offset >= 0; offset--) {
            const date = new Date(today);
            date.setDate(today.getDate() - offset);

            const dayNumber = date.getDate();
            const monthNumber = date.getMonth() + 1;
            const seed = dayNumber * 7 + monthNumber * 13 + offset * 3;

            const appointments = (seed % 17) + 8;
            const patients = Math.max(3, Math.round(appointments * 0.78));
            const completedAppointments = Math.max(
                1,
                Math.round(appointments * 0.72)
            );
            const revenue = completedAppointments * (180000 + (seed % 7) * 35000);

            records.push({
                date: formatDate(date),
                appointments,
                patients,
                revenue
            });
        }

        return records;
    }

    const allRecords = createReportRecords();
    let visibleRecords = [];

    function setDefaultDates() {
        const today = startOfDay(new Date());
        const start = new Date(today);

        start.setDate(today.getDate() - 29);

        startInput.value = formatDate(start);
        endInput.value = formatDate(today);
    }

    function setDatesFromPeriod() {
        const today = startOfDay(new Date());
        const start = new Date(today);

        switch (periodFilter.value) {
            case "7days":
                start.setDate(today.getDate() - 6);
                break;
            case "30days":
                start.setDate(today.getDate() - 29);
                break;
            case "90days":
                start.setDate(today.getDate() - 89);
                break;
            case "year":
                start.setMonth(0, 1);
                break;
            case "custom":
                return;
            default:
                start.setDate(today.getDate() - 29);
        }

        startInput.value = formatDate(start);
        endInput.value = formatDate(today);
    }

    function getSelectedRecords() {
        const start = parseDate(startInput.value);
        const end = parseDate(endInput.value);

        if (!start || !end) {
            throw new Error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
        }

        if (start > end) {
            throw new Error("Ngày bắt đầu không được sau ngày kết thúc.");
        }

        const startValue = formatDate(start);
        const endValue = formatDate(end);

        return allRecords
            .filter((record) => record.date >= startValue && record.date <= endValue)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function getTotals(records) {
        return records.reduce((totals, record) => {
            totals.appointments += record.appointments;
            totals.patients += record.patients;
            totals.revenue += record.revenue;
            return totals;
        }, {
            appointments: 0,
            patients: 0,
            revenue: 0
        });
    }

    function updateStats(records) {
        const totals = getTotals(records);

        appointmentCount.textContent = numberFormatter.format(totals.appointments);
        patientCount.textContent = numberFormatter.format(totals.patients);
        revenueElement.textContent = formatMoney(totals.revenue);
    }

    function getChartConfig() {
        switch (typeFilter.value) {
            case "appointments":
                return {
                    key: "appointments",
                    title: "Thống kê lịch hẹn",
                    subtitle: "Số lịch hẹn được ghi nhận theo ngày.",
                    legend: "Lịch hẹn",
                    value: (record) => numberFormatter.format(record.appointments)
                };

            case "patients":
                return {
                    key: "patients",
                    title: "Thống kê bệnh nhân",
                    subtitle: "Lượt bệnh nhân được ghi nhận theo ngày.",
                    legend: "Bệnh nhân",
                    value: (record) => numberFormatter.format(record.patients)
                };

            case "revenue":
                return {
                    key: "revenue",
                    title: "Thống kê doanh thu",
                    subtitle: "Doanh thu ghi nhận theo ngày.",
                    legend: "Doanh thu",
                    value: (record) => formatMoney(record.revenue)
                };

            default:
                return {
                    key: "appointments",
                    title: "Tổng quan hoạt động",
                    subtitle: "Số lịch hẹn được ghi nhận theo ngày.",
                    legend: "Lịch hẹn",
                    value: (record) => numberFormatter.format(record.appointments)
                };
        }
    }

    function renderChart(records) {
        const config = getChartConfig();

        chartTitle.textContent = config.title;
        chartSubtitle.textContent = config.subtitle;
        legendLabel.textContent = config.legend;

        if (!records.length) {
            chartElement.innerHTML = `
                <div class="report-chart-empty">
                    Không có dữ liệu trong khoảng thời gian đã chọn.
                </div>
            `;
            return;
        }

        // Hiển thị tối đa 14 cột để biểu đồ dễ đọc.
        const chronologicalRecords = [...records].reverse();
        let chartRecords = chronologicalRecords;

        if (chronologicalRecords.length > 14) {
            const step = Math.ceil(chronologicalRecords.length / 14);
            chartRecords = chronologicalRecords.filter((record, index) =>
                index % step === 0
            );

            if (
                chartRecords[chartRecords.length - 1] !==
                chronologicalRecords[chronologicalRecords.length - 1]
            ) {
                chartRecords.push(chronologicalRecords[chronologicalRecords.length - 1]);
            }
        }

        const values = chartRecords.map((record) => record[config.key]);
        const maxValue = Math.max(...values, 1);

        chartElement.innerHTML = chartRecords.map((record) => {
            const value = record[config.key];
            const height = Math.max(3, (value / maxValue) * 100);

            let shortDate = displayDate(record.date);
            if (shortDate.length > 5) {
                const date = parseDate(record.date);
                shortDate = date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit"
                });
            }

            return `
                <div class="report-chart-column"
                     title="${escapeHTML(displayDate(record.date))}: ${escapeHTML(config.value(record))}">
                    <span class="report-chart-value">${escapeHTML(
                        config.key === "revenue"
                            ? moneyFormatter.format(value)
                            : numberFormatter.format(value)
                    )}</span>
                    <div class="report-chart-track">
                        <div class="report-chart-bar" style="height: ${height}%"></div>
                    </div>
                    <span class="report-chart-date">${escapeHTML(shortDate)}</span>
                </div>
            `;
        }).join("");
    }

    function renderTable(records) {
        const type = typeFilter.value;

        if (type === "revenue") {
            tableTitle.textContent = "Chi tiết doanh thu";
            tableSubtitle.textContent = "Doanh thu theo từng ngày.";
            tableHead.innerHTML = `
                <tr>
                    <th>Ngày</th>
                    <th>Lịch hẹn</th>
                    <th>Bệnh nhân</th>
                    <th>Doanh thu</th>
                </tr>
            `;
        } else if (type === "appointments") {
            tableTitle.textContent = "Chi tiết lịch hẹn";
            tableSubtitle.textContent = "Số lượng lịch hẹn theo từng ngày.";
            tableHead.innerHTML = `
                <tr>
                    <th>Ngày</th>
                    <th>Lịch hẹn</th>
                    <th>Bệnh nhân</th>
                    <th>Doanh thu</th>
                </tr>
            `;
        } else if (type === "patients") {
            tableTitle.textContent = "Chi tiết bệnh nhân";
            tableSubtitle.textContent = "Lượt bệnh nhân ghi nhận theo từng ngày.";
            tableHead.innerHTML = `
                <tr>
                    <th>Ngày</th>
                    <th>Bệnh nhân</th>
                    <th>Lịch hẹn</th>
                    <th>Doanh thu</th>
                </tr>
            `;
        } else {
            tableTitle.textContent = "Chi tiết báo cáo";
            tableSubtitle.textContent = "Tổng hợp hoạt động theo ngày.";
            tableHead.innerHTML = `
                <tr>
                    <th>Ngày</th>
                    <th>Lịch hẹn</th>
                    <th>Bệnh nhân</th>
                    <th>Doanh thu</th>
                </tr>
            `;
        }

        if (!records.length) {
            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="report-table-empty">
                        <i class="bi bi-inbox me-2"></i>
                        Không có dữ liệu trong khoảng thời gian này.
                    </td>
                </tr>
            `;
            resultCount.textContent = "0 bản ghi";
            return;
        }

        reportTableBody.innerHTML = records.map((record) => {
            if (type === "patients") {
                return `
                    <tr>
                        <td>${escapeHTML(displayDate(record.date))}</td>
                        <td class="report-number">${numberFormatter.format(record.patients)}</td>
                        <td>${numberFormatter.format(record.appointments)}</td>
                        <td class="report-money">${formatMoney(record.revenue)}</td>
                    </tr>
                `;
            }

            return `
                <tr>
                    <td>${escapeHTML(displayDate(record.date))}</td>
                    <td class="report-number">${numberFormatter.format(record.appointments)}</td>
                    <td>${numberFormatter.format(record.patients)}</td>
                    <td class="report-money">${formatMoney(record.revenue)}</td>
                </tr>
            `;
        }).join("");

        resultCount.textContent = `${numberFormatter.format(records.length)} bản ghi`;
    }

    function renderReport() {
        errorElement.hidden = true;
        errorElement.textContent = "";

        try {
            visibleRecords = getSelectedRecords();
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.hidden = false;
            return;
        }

        updateStats(visibleRecords);
        renderChart(visibleRecords);
        renderTable(visibleRecords);

        periodLabel.textContent =
            `${displayDate(startInput.value)} – ${displayDate(endInput.value)}`;
    }

    function exportCSV() {
        if (!visibleRecords.length) {
            errorElement.textContent = "Không có dữ liệu để xuất báo cáo.";
            errorElement.hidden = false;
            return;
        }

        const rows = [
            ["Ngày", "Lịch hẹn", "Bệnh nhân", "Doanh thu (VND)"],
            ...visibleRecords.map((record) => [
                displayDate(record.date),
                record.appointments,
                record.patients,
                record.revenue
            ])
        ];

        const csv = "\uFEFF" + rows.map((row) =>
            row.map((value) => {
                const text = String(value).replace(/"/g, '""');
                return `"${text}"`;
            }).join(",")
        ).join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `bao-cao-medcare-${startInput.value}-${endInput.value}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    periodFilter.addEventListener("change", () => {
        if (periodFilter.value !== "custom") {
            setDatesFromPeriod();
            renderReport();
        }
    });

    applyButton.addEventListener("click", renderReport);
    exportButton.addEventListener("click", exportCSV);

    startInput.addEventListener("change", () => {
        periodFilter.value = "custom";
    });

    endInput.addEventListener("change", () => {
        periodFilter.value = "custom";
    });

    typeFilter.addEventListener("change", renderReport);

    if (todayElement) {
        todayElement.textContent = new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    setDefaultDates();
    renderReport();
})();

/* =====================================
   MEDCARE - QUẢN LÝ KÊNH ĐĂNG KÝ
===================================== */
(() => {
    const tableBody = document.getElementById("channelTableBody");
    if (!tableBody) return;

    const $ = (id) => document.getElementById(id);
    const STORAGE_KEY = "medcare_registration_channels";
    const PAGE_SIZE = 5;

    const form = $("channelForm");
    const modalElement = $("channelModal");
    const detailModalElement = $("channelDetailModal");

    if (
        !form ||
        !modalElement ||
        !detailModalElement ||
        typeof bootstrap === "undefined"
    ) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const typeLabels = {
        website: "Website",
        direct: "Trực tiếp",
        phone: "Điện thoại",
        social: "Mạng xã hội",
        other: "Khác"
    };

    const typeIcons = {
        website: "bi-globe",
        direct: "bi-person-walking",
        phone: "bi-telephone",
        social: "bi-share",
        other: "bi-three-dots"
    };

    const initialRecords = [
        {
            id: "KENH001",
            name: "Website MedCare",
            type: "website",
            description: "Tiếp nhận đăng ký và đặt lịch thông qua website.",
            status: "active",
            registrations: 1250,
            createdAt: "2026-01-05"
        },
        {
            id: "KENH002",
            name: "Đăng ký trực tiếp",
            type: "direct",
            description: "Tiếp nhận bệnh nhân đăng ký tại quầy lễ tân.",
            status: "active",
            registrations: 685,
            createdAt: "2026-01-08"
        },
        {
            id: "KENH003",
            name: "Tổng đài điện thoại",
            type: "phone",
            description: "Tiếp nhận yêu cầu đặt lịch qua điện thoại.",
            status: "active",
            registrations: 472,
            createdAt: "2026-01-12"
        },
        {
            id: "KENH004",
            name: "Facebook MedCare",
            type: "social",
            description: "Tiếp nhận yêu cầu tư vấn và đăng ký qua mạng xã hội.",
            status: "active",
            registrations: 318,
            createdAt: "2026-02-01"
        },
        {
            id: "KENH005",
            name: "Kênh đối tác",
            type: "other",
            description: "Tiếp nhận bệnh nhân thông qua các đơn vị đối tác.",
            status: "inactive",
            registrations: 96,
            createdAt: "2026-02-15"
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getToday() {
        const date = new Date();
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function formatDate(value) {
        if (!value) return "—";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    }

    function loadRecords() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn("Không thể đọc dữ liệu kênh đăng ký:", error);
        }

        return initialRecords.map((record) => ({ ...record }));
    }

    let records = loadRecords();
    let currentPage = 1;
    let viewingId = null;

    function saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return true;
        } catch (error) {
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra bộ nhớ trình duyệt.");
            console.error(error);
            return false;
        }
    }

    function updateStats() {
        $("totalChannels").textContent = formatNumber(records.length);

        $("activeChannels").textContent = formatNumber(
            records.filter((record) => record.status === "active").length
        );

        $("totalChannelRegistrations").textContent = formatNumber(
            records.reduce((sum, record) => sum + (Number(record.registrations) || 0), 0)
        );
    }

    function getFilteredRecords() {
        const keyword = $("channelSearch").value.trim().toLocaleLowerCase("vi");
        const type = $("channelTypeFilter").value;
        const status = $("channelStatusFilter").value;

        return records.filter((record) => {
            const searchText = [
                record.id,
                record.name,
                record.description,
                typeLabels[record.type] || record.type
            ].join(" ").toLocaleLowerCase("vi");

            return (
                (!keyword || searchText.includes(keyword)) &&
                (!type || record.type === type) &&
                (!status || record.status === status)
            );
        }).sort((a, b) => a.id.localeCompare(b.id));
    }

    function renderPagination(totalPages) {
        const container = $("channelPagination");

        if (totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = `
            <button type="button" class="channel-page-btn"
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? "disabled" : ""}
                aria-label="Trang trước">
                <i class="bi bi-chevron-left"></i>
            </button>
        `;

        for (let page = 1; page <= totalPages; page++) {
            html += `
                <button type="button"
                    class="channel-page-btn ${page === currentPage ? "active" : ""}"
                    data-page="${page}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;
        }

        html += `
            <button type="button" class="channel-page-btn"
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? "disabled" : ""}
                aria-label="Trang sau">
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    function renderTable() {
        updateStats();

        const filtered = getFilteredRecords();
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

        currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageRecords = filtered.slice(startIndex, startIndex + PAGE_SIZE);

        if (!pageRecords.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="channel-empty">
                        <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                        Không tìm thấy kênh đăng ký phù hợp.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageRecords.map((record) => {
                const statusLabel = record.status === "active"
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động";

                return `
                    <tr>
                        <td>
                            <span class="channel-code">${escapeHTML(record.id)}</span>
                        </td>

                        <td>
                            <div class="channel-info">
                                <div class="channel-avatar">
                                    <i class="bi ${typeIcons[record.type] || typeIcons.other}"></i>
                                </div>
                                <div>
                                    <div class="channel-name">${escapeHTML(record.name)}</div>
                                    <div class="channel-description"
                                         title="${escapeHTML(record.description)}">
                                        ${escapeHTML(record.description || "Chưa có mô tả")}
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="channel-type-badge">
                                ${escapeHTML(typeLabels[record.type] || "Khác")}
                            </span>
                        </td>

                        <td>
                            <div class="channel-count">
                                ${formatNumber(record.registrations)}
                            </div>
                            <div class="channel-count-label">lượt đăng ký</div>
                        </td>

                        <td>
                            <span class="channel-status-badge ${record.status}">
                                <i class="bi ${record.status === "active"
                                    ? "bi-check-circle-fill"
                                    : "bi-pause-circle-fill"}"></i>
                                ${statusLabel}
                            </span>
                        </td>

                        <td>
                            <div class="channel-actions">
                                <button type="button" class="channel-action-btn"
                                    data-action="view" data-id="${escapeHTML(record.id)}"
                                    title="Xem chi tiết" aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button" class="channel-action-btn"
                                    data-action="edit" data-id="${escapeHTML(record.id)}"
                                    title="Chỉnh sửa" aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button type="button"
                                    class="channel-action-btn ${record.status === "active" ? "danger" : ""}"
                                    data-action="toggle" data-id="${escapeHTML(record.id)}"
                                    title="${record.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"}"
                                    aria-label="${record.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"}">
                                    <i class="bi ${record.status === "active"
                                        ? "bi-pause-circle"
                                        : "bi-play-circle"}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        $("channelResultCount").textContent = filtered.length
            ? `Hiển thị ${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filtered.length)} trong ${filtered.length} kênh`
            : "Hiển thị 0 kênh";

        renderPagination(totalPages);
    }

    function resetForm() {
        form.reset();
        $("channelId").value = "";
        $("channelStatus").value = "active";
        $("channelModalTitle").textContent = "Thêm kênh đăng ký";
    }

    function openAddModal() {
        resetForm();
        modal.show();
    }

    function openEditModal(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        resetForm();

        $("channelId").value = record.id;
        $("channelName").value = record.name;
        $("channelType").value = record.type;
        $("channelDescription").value = record.description || "";
        $("channelStatus").value = record.status;

        $("channelModalTitle").textContent = "Cập nhật kênh đăng ký";
        modal.show();
    }

    function openDetailModal(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        viewingId = id;

        $("channelDetailTitle").textContent = record.name;

        $("channelDetailContent").innerHTML = `
            <div class="channel-detail-list">
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Mã kênh</span>
                    <span class="channel-detail-value">${escapeHTML(record.id)}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Tên kênh</span>
                    <span class="channel-detail-value">${escapeHTML(record.name)}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Loại kênh</span>
                    <span class="channel-detail-value">${escapeHTML(typeLabels[record.type] || "Khác")}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Mô tả</span>
                    <span class="channel-detail-value">${escapeHTML(record.description || "Chưa có mô tả")}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Lượt đăng ký</span>
                    <span class="channel-detail-value">${formatNumber(record.registrations)}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Ngày tạo</span>
                    <span class="channel-detail-value">${formatDate(record.createdAt)}</span>
                </div>
                <div class="channel-detail-row">
                    <span class="channel-detail-label">Trạng thái</span>
                    <span class="channel-detail-value">
                        ${record.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
                <button type="button" class="btn btn-primary" id="editChannelFromDetail">
                    <i class="bi bi-pencil-square me-1"></i> Chỉnh sửa
                </button>
            </div>
        `;

        detailModal.show();
    }

    function createChannelId() {
        let nextNumber = 1;

        records.forEach((record) => {
            const match = record.id.match(/^KENH(\d+)$/i);

            if (match) {
                nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
            }
        });

        return `KENH${String(nextNumber).padStart(3, "0")}`;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const id = $("channelId").value;
        const name = $("channelName").value.trim();
        const type = $("channelType").value;
        const description = $("channelDescription").value.trim();
        const status = $("channelStatus").value;

        if (!name || !type) {
            form.reportValidity();
            return;
        }

        const duplicated = records.some((record) =>
            record.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi") &&
            record.id !== id
        );

        if (duplicated) {
            alert("Tên kênh đăng ký này đã tồn tại. Vui lòng nhập tên khác.");
            $("channelName").focus();
            return;
        }

        if (id) {
            const index = records.findIndex((record) => record.id === id);
            if (index < 0) return;

            records[index] = {
                ...records[index],
                name,
                type,
                description,
                status
            };
        } else {
            records.push({
                id: createChannelId(),
                name,
                type,
                description,
                status,
                registrations: 0,
                createdAt: getToday()
            });
        }

        if (!saveRecords()) return;

        currentPage = 1;
        renderTable();
        modal.hide();
        resetForm();
    }

    function toggleStatus(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;

        const isActive = record.status === "active";
        const action = isActive ? "ngừng hoạt động" : "kích hoạt";

        if (!confirm(`Bạn có chắc muốn ${action} kênh "${record.name}"?`)) {
            return;
        }

        record.status = isActive ? "inactive" : "active";

        if (!saveRecords()) {
            record.status = isActive ? "active" : "inactive";
            return;
        }

        renderTable();
    }

    function exportCSV() {
        const filtered = getFilteredRecords();

        if (!filtered.length) {
            alert("Không có dữ liệu để xuất.");
            return;
        }

        const rows = [
            [
                "Mã kênh",
                "Tên kênh",
                "Loại kênh",
                "Mô tả",
                "Lượt đăng ký",
                "Trạng thái",
                "Ngày tạo"
            ],
            ...filtered.map((record) => [
                record.id,
                record.name,
                typeLabels[record.type] || "Khác",
                record.description || "",
                record.registrations,
                record.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động",
                record.createdAt || ""
            ])
        ];

        const csv = "\uFEFF" + rows.map((row) =>
            row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        ).join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "danh-sach-kenh-dang-ky.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    $("addChannelBtn").addEventListener("click", openAddModal);
    $("exportChannelsBtn").addEventListener("click", exportCSV);
    form.addEventListener("submit", handleSubmit);

    $("channelSearch").addEventListener("input", () => {
        currentPage = 1;
        renderTable();
    });

    $("channelTypeFilter").addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    $("channelStatusFilter").addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    $("channelPagination").addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");
        if (!button || button.disabled) return;

        currentPage = Number(button.dataset.page) || 1;
        renderTable();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const id = button.dataset.id;

        switch (button.dataset.action) {
            case "view":
                openDetailModal(id);
                break;
            case "edit":
                openEditModal(id);
                break;
            case "toggle":
                toggleStatus(id);
                break;
        }
    });

    $("channelDetailContent").addEventListener("click", (event) => {
        if (!event.target.closest("#editChannelFromDetail")) return;

        const id = viewingId;
        detailModal.hide();

        if (id) {
            openEditModal(id);
        }
    });

    modalElement.addEventListener("hidden.bs.modal", resetForm);

    renderTable();
})();
