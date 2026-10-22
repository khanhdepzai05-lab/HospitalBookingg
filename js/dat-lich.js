
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("appointmentForm");
    const notice = document.getElementById("bookingNotice");
    const dateInput = document.getElementById("bookingDate");
    const birthInput = document.getElementById("patientBirth");
    const specialtySelect = document.getElementById("bookingSpecialty");
    const doctorSelect = document.getElementById("bookingDoctor");

    if (!form || !notice || !dateInput) {
        return;
    }

    function getLocalDate() {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
    }

    const todayString = getLocalDate();

    dateInput.min = todayString;
    birthInput.max = todayString;

    // Nhận dữ liệu tìm kiếm từ trang chủ qua URL
    const params = new URLSearchParams(window.location.search);
    const specialtyFromUrl = params.get("chuyenKhoa");
    const doctorFromUrl = params.get("bacSi");
    const dateFromUrl = params.get("ngayKham");

    if (specialtyFromUrl) {
        const specialtyOption = Array.from(specialtySelect.options).find(
            option => option.value === specialtyFromUrl ||
                option.textContent.trim() === specialtyFromUrl
        );

        if (specialtyOption) {
            specialtySelect.value = specialtyOption.value;
        }
    }

    if (doctorFromUrl) {
        const doctorOption = Array.from(doctorSelect.options).find(
            option => option.value === doctorFromUrl ||
                option.textContent.trim() === doctorFromUrl
        );

        if (doctorOption) {
            doctorSelect.value = doctorOption.value;
        }
    }

    if (dateFromUrl && dateFromUrl >= todayString) {
        dateInput.value = dateFromUrl;
    }

    function showNotice(message, isError) {
        notice.textContent = message;
        notice.hidden = false;
        notice.classList.toggle("error", Boolean(isError));

        notice.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("patientName").value.trim();
        const phone = document.getElementById("patientPhone").value.trim();
        const email = document.getElementById("patientEmail").value.trim();
        const birth = birthInput.value;
        const specialty = specialtySelect.value;
        const doctor = doctorSelect.value;
        const date = dateInput.value;
        const time = document.getElementById("bookingTime").value;

        if (!name || !phone || !specialty || !date || !time) {
            showNotice("Vui lòng điền đầy đủ các trường bắt buộc có dấu *.", true);
            return;
        }

        if (!/^[0-9+\s().-]{9,15}$/.test(phone)) {
            showNotice("Vui lòng kiểm tra lại số điện thoại.", true);
            return;
        }

        if (date < getLocalDate()) {
            showNotice("Ngày khám không được ở trong quá khứ.", true);
            return;
        }

        if (birth && birth > getLocalDate()) {
            showNotice("Ngày sinh không được lớn hơn ngày hiện tại.", true);
            return;
        }

        // Chỉ minh họa kết quả trên trình duyệt, chưa lưu lên máy chủ.
        const result = {
            hoTen: name,
            soDienThoai: phone,
            email: email,
            ngaySinh: birth,
            chuyenKhoa: specialty,
            bacSi: doctor || "Chưa chọn bác sĩ",
            ngayKham: date,
            buoiKham: time
        };

        showNotice(
            "Thông tin đã được kiểm tra trên giao diện. " +
            "Đây chưa phải lịch hẹn đã xác nhận vì website chưa kết nối máy chủ.",
            false
        );

        console.log("Thông tin đặt lịch minh họa:", result);
    });
});
