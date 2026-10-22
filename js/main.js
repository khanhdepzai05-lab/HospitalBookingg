
document.addEventListener("DOMContentLoaded", function () {
    // Hiển thị năm hiện tại ở footer
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Không cho chọn ngày khám đã qua
    const appointmentDate = document.getElementById("appointmentDate");

    if (appointmentDate) {
        const now = new Date();
        const localDate = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");

        appointmentDate.min = localDate;
    }

    // Thông báo trên giao diện
    const toast = document.getElementById("toastMessage");
    let toastTimeout;

    function showMessage(message) {
        if (!toast) {
            window.alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(toastTimeout);

        toastTimeout = window.setTimeout(function () {
            toast.classList.remove("show");
        }, 3500);
    }

    // Tìm lịch khám nhanh
    const quickBookingForm = document.getElementById("quickBookingForm");

    if (quickBookingForm) {
        quickBookingForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const specialty = document.getElementById("specialty").value;
            const doctor = document.getElementById("doctor").value;
            const date = document.getElementById("appointmentDate").value;

            if (!specialty || !date) {
                showMessage("Vui lòng chọn chuyên khoa và ngày khám.");
                return;
            }

            const params = new URLSearchParams({
                chuyenKhoa: specialty,
                ngayKham: date
            });

            if (doctor) {
                params.set("bacSi", doctor);
            }

            // Chuyển thông tin tìm kiếm sang trang đặt lịch
            window.location.href = "dat-lich.html?" + params.toString();
        });
    }

    // Cuộn mượt tới các khu vực trên cùng trang
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                event.preventDefault();
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});
