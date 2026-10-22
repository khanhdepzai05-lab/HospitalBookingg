
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ========================================
    // 1. CẬP NHẬT NĂM HIỆN TẠI
    // ========================================
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // ========================================
    // 2. NÚT CUỘN LÊN ĐẦU TRANG
    // Chỉ hoạt động nếu HTML có nút
    // id="backToTop"
    // ========================================
    const backToTop = document.getElementById("backToTop");

    if (backToTop) {
        function updateBackToTop() {
            backToTop.hidden = window.scrollY < 300;
        }

        window.addEventListener("scroll", updateBackToTop, {
            passive: true
        });

        backToTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        updateBackToTop();
    }

    // ========================================
    // 3. XỬ LÝ BIỂU MẪU LIÊN HỆ
    // ========================================
    const contactForm = document.getElementById("contactForm");
    const contactNotice = document.getElementById("contactNotice");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add("was-validated");
                contactForm.reportValidity();
                return;
            }

            const name = document
                .getElementById("contactName")
                ?.value.trim();

            const phone = document
                .getElementById("contactPhone")
                ?.value.trim();

            const email = document
                .getElementById("contactEmail")
                ?.value.trim();

            const topic = document
                .getElementById("contactTopic")
                ?.value.trim();

            const message = document
                .getElementById("contactMessage")
                ?.value.trim();

            if (!name || !phone || !email || !topic || !message) {
                contactForm.classList.add("was-validated");
                return;
            }

            const phonePattern = /^[0-9+\s().-]{9,15}$/;

            if (!phonePattern.test(phone)) {
                const phoneInput = document.getElementById("contactPhone");

                if (phoneInput) {
                    phoneInput.setCustomValidity(
                        "Vui lòng nhập số điện thoại hợp lệ."
                    );
                    phoneInput.reportValidity();
                    phoneInput.addEventListener(
                        "input",
                        function () {
                            phoneInput.setCustomValidity("");
                        },
                        { once: true }
                    );
                }

                return;
            }

            if (contactNotice) {
                contactNotice.textContent =
                    "Thông tin đã được kiểm tra. Vui lòng liên hệ MedCare qua hotline để được hỗ trợ gửi yêu cầu.";

                contactNotice.classList.remove("d-none");
                contactNotice.classList.add("alert", "alert-info");
                contactNotice.setAttribute("role", "status");

                contactNotice.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }

            // Chưa gửi hoặc lưu dữ liệu lên máy chủ.
            // Không xóa nội dung người dùng vừa nhập.
        });
    }
});

/* =========================================
   TRA CỨU LỊCH HẸN - MEDCARE
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("appointmentLookupForm");
    const codeInput = document.getElementById("appointmentCode");
    const phoneInput = document.getElementById("appointmentPhone");
    const notice = document.getElementById("appointmentLookupNotice");

    if (!form || !codeInput || !phoneInput || !notice) {
        return;
    }

    function showNotice(message, type) {
        notice.textContent = message;
        notice.className = "alert alert-" + type + " mt-3 mb-0";
        notice.setAttribute("role", "status");
    }

    function clearNotice() {
        notice.textContent = "";
        notice.className = "alert d-none mt-3 mb-0";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearNotice();

        const code = codeInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!code || !phone) {
            showNotice(
                "Vui lòng nhập đầy đủ mã lịch hẹn và số điện thoại.",
                "warning"
            );
            return;
        }

        if (!/^[a-zA-Z0-9-]{5,30}$/.test(code)) {
            showNotice(
                "Mã lịch hẹn không đúng định dạng. Vui lòng kiểm tra lại.",
                "warning"
            );
            codeInput.focus();
            return;
        }

        if (!/^[0-9+().\s-]{9,15}$/.test(phone)) {
            showNotice(
                "Số điện thoại chưa hợp lệ. Vui lòng kiểm tra lại.",
                "warning"
            );
            phoneInput.focus();
            return;
        }

        showNotice(
            "Thông tin đã được nhập đầy đủ. Vui lòng liên hệ bộ phận chăm sóc khách hàng để xác nhận lịch hẹn.",
            "info"
        );
    });

    codeInput.addEventListener("input", clearNotice);
    phoneInput.addEventListener("input", clearNotice);
});
// ================================
// TRANG CHUYÊN KHOA
// ================================
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("specialtySearch");
    const filterSelect = document.getElementById("specialtyFilter");
    const items = document.querySelectorAll(".specialty-item");
    const noResult = document.getElementById("noSpecialtyResult");

    // Chỉ chạy khi đang ở trang có danh sách chuyên khoa
    if (!searchInput || !filterSelect || !items.length || !noResult) {
        return;
    }

    function normalizeText(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    }

    function filterSpecialties() {
        const keyword = normalizeText(searchInput.value);
        const category = filterSelect.value;
        let visibleCount = 0;

        items.forEach(function (item) {
            const name = normalizeText(item.dataset.name || "");
            const content = normalizeText(item.innerText);

            const matchesKeyword =
                name.includes(keyword) || content.includes(keyword);

            const matchesCategory =
                category === "all" || item.dataset.category === category;

            const visible = matchesKeyword && matchesCategory;

            item.classList.toggle("d-none", !visible);

            if (visible) {
                visibleCount++;
            }
        });

        noResult.classList.toggle("d-none", visibleCount > 0);
    }

    searchInput.addEventListener("input", filterSpecialties);
    filterSelect.addEventListener("change", filterSpecialties);

    filterSpecialties();
});

/* =========================================
   CHI TIẾT CHUYÊN KHOA
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const title = document.getElementById("specialtyTitle");

    // Chỉ chạy trên trang chi tiết chuyên khoa
    if (!title) {
        return;
    }

    const specialties = {
        "tim-mach": {
            name: "Tim mạch",
            image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=1000&q=85",
            description: "Tư vấn và thăm khám sức khỏe tim mạch, hỗ trợ theo dõi các yếu tố nguy cơ và định hướng chăm sóc sức khỏe phù hợp.",
            intro: "Chuyên khoa Tim mạch tập trung vào việc thăm khám, tư vấn và theo dõi các vấn đề liên quan đến tim và hệ tuần hoàn. Bác sĩ sẽ trao đổi về triệu chứng, tiền sử sức khỏe và các yếu tố nguy cơ để định hướng thăm khám phù hợp.",
            symptoms: [
                "Có biểu hiện như hồi hộp hoặc khó thở cần được đánh giá y tế.",
                "Cần theo dõi huyết áp hoặc các yếu tố nguy cơ tim mạch.",
                "Muốn trao đổi với bác sĩ về kết quả kiểm tra sức khỏe tim mạch."
            ]
        },
        "nhi-khoa": {
            name: "Nhi khoa",
            image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=85",
            description: "Chăm sóc sức khỏe trẻ em, tư vấn theo dõi tăng trưởng và hỗ trợ phụ huynh trong quá trình chăm sóc trẻ.",
            intro: "Chuyên khoa Nhi khoa hỗ trợ thăm khám và theo dõi sức khỏe của trẻ theo từng giai đoạn phát triển. Phụ huynh có thể trao đổi với bác sĩ về tình trạng sức khỏe, dinh dưỡng và các vấn đề cần được đánh giá.",
            symptoms: [
                "Trẻ cần được khám sức khỏe định kỳ.",
                "Trẻ có biểu hiện bất thường khiến phụ huynh lo lắng.",
                "Phụ huynh cần tư vấn về dinh dưỡng và chăm sóc sức khỏe trẻ."
            ]
        },
        "da-lieu": {
            name: "Da liễu",
            image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1000&q=85",
            description: "Thăm khám và tư vấn các vấn đề về da, tóc và móng.",
            intro: "Chuyên khoa Da liễu tiếp nhận thăm khám các vấn đề liên quan đến da, tóc và móng. Bác sĩ sẽ xem xét biểu hiện, thời gian xuất hiện và tiền sử liên quan trước khi tư vấn hướng chăm sóc phù hợp.",
            symptoms: [
                "Da xuất hiện tình trạng ngứa, đỏ hoặc kích ứng kéo dài.",
                "Có thay đổi bất thường ở da, tóc hoặc móng.",
                "Cần tư vấn chăm sóc da khi có vấn đề da liễu."
            ]
        },
        "co-xuong-khop": {
            name: "Cơ xương khớp",
            image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=85",
            description: "Tư vấn các vấn đề về xương, khớp, cơ và khả năng vận động.",
            intro: "Chuyên khoa Cơ xương khớp hỗ trợ đánh giá những vấn đề ảnh hưởng đến xương, khớp, cơ và vận động. Bác sĩ sẽ tìm hiểu vị trí đau, thời gian xuất hiện và mức độ ảnh hưởng đến sinh hoạt.",
            symptoms: [
                "Đau hoặc cứng khớp kéo dài.",
                "Khó vận động hoặc gặp khó khăn trong sinh hoạt.",
                "Cần tư vấn theo dõi tình trạng cơ xương khớp."
            ]
        },
        "tai-mui-hong": {
            name: "Tai Mũi Họng",
            image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=85",
            description: "Thăm khám các vấn đề liên quan đến tai, mũi và họng.",
            intro: "Chuyên khoa Tai Mũi Họng hỗ trợ đánh giá các vấn đề liên quan đến tai, mũi, họng. Người bệnh nên cung cấp thông tin về thời gian xuất hiện triệu chứng và các lần điều trị trước đó.",
            symptoms: [
                "Đau tai, ù tai hoặc thay đổi khả năng nghe.",
                "Nghẹt mũi hoặc chảy mũi kéo dài.",
                "Đau họng hoặc khàn tiếng kéo dài cần được đánh giá."
            ]
        },
        "tieu-hoa": {
            name: "Tiêu hóa",
            image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1000&q=85",
            description: "Tư vấn và thăm khám các vấn đề liên quan đến hệ tiêu hóa.",
            intro: "Chuyên khoa Tiêu hóa tập trung vào việc đánh giá các triệu chứng liên quan đến đường tiêu hóa. Bác sĩ sẽ trao đổi về biểu hiện, thói quen sinh hoạt và tiền sử sức khỏe.",
            symptoms: [
                "Đau bụng, đầy bụng hoặc khó tiêu kéo dài.",
                "Thay đổi thói quen tiêu hóa khiến bạn lo lắng.",
                "Cần trao đổi về kết quả kiểm tra hệ tiêu hóa."
            ]
        },
        "mat": {
            name: "Mắt",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=85",
            description: "Kiểm tra thị lực và tư vấn chăm sóc sức khỏe mắt.",
            intro: "Chuyên khoa Mắt hỗ trợ kiểm tra thị lực và đánh giá các vấn đề liên quan đến mắt. Người bệnh nên chia sẻ những thay đổi về thị lực và tiền sử sức khỏe mắt.",
            symptoms: [
                "Thị lực thay đổi hoặc mắt thường xuyên mỏi.",
                "Mắt đỏ hoặc khó chịu kéo dài.",
                "Cần kiểm tra thị lực định kỳ."
            ]
        },
        "rang-ham-mat": {
            name: "Răng Hàm Mặt",
            image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1000&q=85",
            description: "Tư vấn và thăm khám các vấn đề về răng, nướu và sức khỏe răng miệng.",
            intro: "Chuyên khoa Răng Hàm Mặt hỗ trợ đánh giá sức khỏe răng miệng và tư vấn chăm sóc răng, nướu. Bác sĩ sẽ tìm hiểu triệu chứng và nhu cầu thăm khám của người bệnh.",
            symptoms: [
                "Đau răng hoặc ê buốt.",
                "Có dấu hiệu bất thường ở răng hoặc khoang miệng.",
                "Cần kiểm tra và tư vấn chăm sóc răng miệng định kỳ."
            ]
        }
    };

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("chuyen-khoa") || "tim-mach";
    const specialty = specialties[slug] || specialties["tim-mach"];

    const description = document.getElementById("specialtyDescription");
    const image = document.getElementById("specialtyImage");
    const breadcrumb = document.getElementById("breadcrumbSpecialty");
    const introHeading = document.getElementById("introHeading");
    const intro = document.getElementById("specialtyIntro");
    const symptoms = document.getElementById("specialtySymptoms");

    title.textContent = specialty.name;

    if (description) {
        description.textContent = specialty.description;
    }

    if (breadcrumb) {
        breadcrumb.textContent = specialty.name;
    }

    if (introHeading) {
        introHeading.textContent = "Tìm hiểu về chuyên khoa " + specialty.name;
    }

    if (intro) {
        intro.textContent = specialty.intro;
    }

    if (image) {
        image.src = specialty.image;
        image.alt = "Chuyên khoa " + specialty.name;
    }

    if (symptoms) {
        symptoms.replaceChildren();

        specialty.symptoms.forEach(function (text) {
            const li = document.createElement("li");
            li.textContent = text;
            symptoms.appendChild(li);
        });
    }

    // Giữ chuyên khoa đã chọn khi chuyển sang trang đặt lịch
    const bookingUrl =
        "dat-lich.html?chuyen-khoa=" + encodeURIComponent(slug);

    [
        "bookSpecialtyButton",
        "sideBookButton",
        "bottomBookButton"
    ].forEach(function (id) {
        const button = document.getElementById(id);

        if (button) {
            button.href = bookingUrl;
        }
    });

    // Cập nhật năm ở chân trang
    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
});

/* =========================================
   DANH SÁCH BÁC SĨ - MEDCARE
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const doctorList = document.getElementById("doctorList");

    // Chỉ chạy chức năng lọc trên trang danh sách bác sĩ
    if (!doctorList) {
        return;
    }

    const searchInput = document.getElementById("doctorSearch");
    const specialtyFilter = document.getElementById("specialtyFilter");
    const doctorItems = Array.from(
        doctorList.querySelectorAll(".doctor-item")
    );
    const doctorCount = document.getElementById("doctorCount");
    const emptyState = document.getElementById("doctorEmpty");
    const resetButton = document.getElementById("resetDoctorFilter");
    const resetEmptyButton = document.getElementById(
        "resetDoctorFilterEmpty"
    );
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Chuẩn hóa tiếng Việt để tìm kiếm không phân biệt dấu
    function normalizeText(value) {
        return value
            .toLocaleLowerCase("vi")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .trim();
    }

    // Tìm kiếm bác sĩ và lọc theo chuyên khoa
    function filterDoctors() {
        const keyword = normalizeText(
            searchInput ? searchInput.value : ""
        );

        const selectedSpecialty = specialtyFilter
            ? specialtyFilter.value
            : "";

        let visibleCount = 0;

        doctorItems.forEach(function (item) {
            const name = normalizeText(item.dataset.name || "");
            const keywords = normalizeText(item.dataset.keywords || "");
            const specialty = item.dataset.specialty || "";

            const matchesKeyword =
                !keyword ||
                name.includes(keyword) ||
                keywords.includes(keyword);

            const matchesSpecialty =
                !selectedSpecialty ||
                specialty === selectedSpecialty;

            const isVisible = matchesKeyword && matchesSpecialty;

            item.hidden = !isVisible;

            if (isVisible) {
                visibleCount++;
            }
        });

        if (doctorCount) {
            doctorCount.textContent = visibleCount;
        }

        if (emptyState) {
            emptyState.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }

    // Đưa bộ lọc về trạng thái ban đầu
    function resetFilters() {
        if (searchInput) {
            searchInput.value = "";
        }

        if (specialtyFilter) {
            specialtyFilter.value = "";
        }

        filterDoctors();
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterDoctors);
    }

    if (specialtyFilter) {
        specialtyFilter.addEventListener("change", filterDoctors);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    if (resetEmptyButton) {
        resetEmptyButton.addEventListener("click", resetFilters);
    }

    // Hiển thị danh sách ban đầu
    filterDoctors();
});

/* =========================================
   CHI TIẾT BÁC SĨ - MEDCARE
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const detailContent = document.getElementById("doctorDetailContent");

    // Chỉ chạy trên trang chi tiết bác sĩ
    if (!detailContent) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const doctorSlug = params.get("bac-si");

    const doctors = {
        "nguyen-minh-anh": {
            name: "BS. Nguyễn Minh Anh",
            specialty: "Tim mạch",
            specialtySlug: "tim-mach",
            degree: "Bác sĩ chuyên khoa Tim mạch",
            experience: "Hơn 10 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85",
            description: "Tập trung thăm khám, tư vấn và theo dõi sức khỏe tim mạch, hỗ trợ người bệnh xây dựng kế hoạch chăm sóc sức khỏe phù hợp.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực tim mạch.",
                "Thường xuyên cập nhật kiến thức và phương pháp chăm sóc sức khỏe tim mạch."
            ],
            expertise: [
                "Tư vấn và theo dõi sức khỏe tim mạch.",
                "Đánh giá các yếu tố nguy cơ tim mạch.",
                "Tư vấn lối sống và chăm sóc sức khỏe dự phòng."
            ]
        },
        "tran-thu-ha": {
            name: "BS. Trần Thu Hà",
            specialty: "Nhi khoa",
            specialtySlug: "nhi-khoa",
            degree: "Bác sĩ chuyên khoa Nhi",
            experience: "Hơn 8 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=85",
            description: "Định hướng chăm sóc sức khỏe trẻ em, tư vấn theo dõi sự phát triển và hỗ trợ phụ huynh trong quá trình chăm sóc trẻ.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực nhi khoa.",
                "Cập nhật kiến thức về chăm sóc sức khỏe và sự phát triển của trẻ."
            ],
            expertise: [
                "Tư vấn chăm sóc sức khỏe trẻ em.",
                "Theo dõi tăng trưởng và phát triển của trẻ.",
                "Hướng dẫn phụ huynh về dinh dưỡng và chăm sóc trẻ."
            ]
        },
        "le-hoang-yen": {
            name: "BS. Lê Hoàng Yến",
            specialty: "Da liễu",
            specialtySlug: "da-lieu",
            degree: "Bác sĩ chuyên khoa Da liễu",
            experience: "Hơn 7 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=85",
            description: "Tư vấn chăm sóc da và hỗ trợ thăm khám các vấn đề da liễu thường gặp, hướng đến kế hoạch chăm sóc phù hợp với từng người.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực da liễu.",
                "Thường xuyên cập nhật kiến thức về chăm sóc và bảo vệ sức khỏe làn da."
            ],
            expertise: [
                "Tư vấn chăm sóc và bảo vệ da.",
                "Hỗ trợ thăm khám các vấn đề da liễu thường gặp.",
                "Hướng dẫn xây dựng thói quen chăm sóc da phù hợp."
            ]
        },
        "pham-quoc-bao": {
            name: "BS. Phạm Quốc Bảo",
            specialty: "Cơ xương khớp",
            specialtySlug: "co-xuong-khop",
            degree: "Bác sĩ chuyên khoa Cơ xương khớp",
            experience: "Hơn 9 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=85",
            description: "Tư vấn chăm sóc hệ vận động, hỗ trợ đánh giá các vấn đề cơ xương khớp và hướng dẫn người bệnh duy trì vận động phù hợp.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực cơ xương khớp.",
                "Cập nhật kiến thức về vận động và chăm sóc hệ cơ xương khớp."
            ],
            expertise: [
                "Tư vấn sức khỏe cơ xương khớp.",
                "Hỗ trợ đánh giá các vấn đề về vận động.",
                "Hướng dẫn vận động và chăm sóc hệ cơ xương khớp."
            ]
        },
        "vo-thanh-tung": {
            name: "BS. Võ Thanh Tùng",
            specialty: "Tai Mũi Họng",
            specialtySlug: "tai-mui-hong",
            degree: "Bác sĩ chuyên khoa Tai Mũi Họng",
            experience: "Hơn 8 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=85",
            description: "Tư vấn và thăm khám các vấn đề thường gặp liên quan đến tai, mũi, họng, đồng thời hướng dẫn chăm sóc sức khỏe đường hô hấp trên.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực tai mũi họng.",
                "Cập nhật kiến thức về chăm sóc sức khỏe tai, mũi và họng."
            ],
            expertise: [
                "Tư vấn các vấn đề sức khỏe tai mũi họng.",
                "Hướng dẫn chăm sóc sức khỏe đường hô hấp trên.",
                "Tư vấn biện pháp phòng ngừa phù hợp."
            ]
        },
        "dang-minh-khoi": {
            name: "BS. Đặng Minh Khôi",
            specialty: "Tiêu hóa",
            specialtySlug: "tieu-hoa",
            degree: "Bác sĩ chuyên khoa Tiêu hóa",
            experience: "Hơn 10 năm kinh nghiệm",
            schedule: "Khám theo lịch hẹn",
            image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=85",
            description: "Tư vấn chăm sóc sức khỏe tiêu hóa, hỗ trợ người bệnh tìm hiểu các vấn đề thường gặp và xây dựng thói quen ăn uống, sinh hoạt phù hợp.",
            education: [
                "Được đào tạo chuyên môn trong lĩnh vực tiêu hóa.",
                "Cập nhật kiến thức về dinh dưỡng và chăm sóc sức khỏe đường tiêu hóa."
            ],
            expertise: [
                "Tư vấn chăm sóc sức khỏe tiêu hóa.",
                "Hướng dẫn thói quen ăn uống và sinh hoạt phù hợp.",
                "Tư vấn theo dõi sức khỏe đường tiêu hóa."
            ]
        }
    };

    const doctor = doctors[doctorSlug];
    const notFound = document.getElementById("doctorDetailNotFound");

    if (!doctor) {
        detailContent.hidden = true;

        if (notFound) {
            notFound.hidden = false;
        }

        return;
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    setText("detailDoctorName", doctor.name);
    setText("detailDoctorDegree", doctor.degree);
    setText("detailDoctorSpecialty", doctor.specialty);
    setText("detailDoctorDescription", doctor.description);
    setText("detailDoctorExperience", doctor.experience);
    setText("detailDoctorSchedule", doctor.schedule);

    const doctorImage = document.getElementById("detailDoctorImage");

    if (doctorImage) {
        doctorImage.src = doctor.image;
        doctorImage.alt = "Ảnh " + doctor.name;
    }

    const bookingButton = document.getElementById("detailDoctorBooking");

    if (bookingButton) {
        bookingButton.href =
            "dat-lich.html?chuyen-khoa=" +
            encodeURIComponent(doctor.specialtySlug) +
            "&bac-si=" +
            encodeURIComponent(doctorSlug);
    }

    const educationContainer = document.getElementById("detailDoctorEducation");

    if (educationContainer) {
        educationContainer.replaceChildren();

        doctor.education.forEach(function (item) {
            const paragraph = document.createElement("p");
            paragraph.textContent = item;
            educationContainer.appendChild(paragraph);
        });
    }

    const expertiseContainer = document.getElementById("detailDoctorExpertise");

    if (expertiseContainer) {
        expertiseContainer.replaceChildren();

        doctor.expertise.forEach(function (item) {
            const listItem = document.createElement("li");
            const icon = document.createElement("i");
            const text = document.createElement("span");

            icon.className = "bi bi-check-circle-fill";
            text.textContent = item;

            listItem.appendChild(icon);
            listItem.appendChild(text);
            expertiseContainer.appendChild(listItem);
        });
    }

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    document.title = doctor.name + " | MedCare";
});

/* =========================================
   DANH SÁCH DỊCH VỤ - MEDCARE
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const serviceGrid = document.getElementById("serviceGrid");

    // Chỉ chạy trên trang dịch vụ
    if (!serviceGrid) {
        return;
    }

    const searchInput = document.getElementById("serviceSearch");
    const categoryFilter = document.getElementById("serviceCategory");
    const resetButton = document.getElementById("resetServiceFilter");
    const resetEmptyButton = document.getElementById("resetServiceFilterEmpty");
    const serviceCount = document.getElementById("serviceCount");
    const emptyState = document.getElementById("serviceEmpty");
    const serviceItems = Array.from(
        serviceGrid.querySelectorAll(".service-item")
    );

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function normalizeText(value) {
        return value
            .toLocaleLowerCase("vi")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .trim();
    }

    function filterServices() {
        const keyword = normalizeText(
            searchInput ? searchInput.value : ""
        );

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "";

        let visibleCount = 0;

        serviceItems.forEach(function (item) {
            const name = normalizeText(item.dataset.name || "");
            const keywords = normalizeText(item.dataset.keywords || "");
            const category = item.dataset.category || "";

            const matchesKeyword =
                !keyword ||
                name.includes(keyword) ||
                keywords.includes(keyword);

            const matchesCategory =
                !selectedCategory ||
                category === selectedCategory;

            const isVisible = matchesKeyword && matchesCategory;

            item.hidden = !isVisible;

            if (isVisible) {
                visibleCount++;
            }
        });

        if (serviceCount) {
            serviceCount.textContent = visibleCount;
        }

        if (emptyState) {
            emptyState.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }

    function resetFilters() {
        if (searchInput) {
            searchInput.value = "";
        }

        if (categoryFilter) {
            categoryFilter.value = "";
        }

        filterServices();
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterServices);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterServices);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    if (resetEmptyButton) {
        resetEmptyButton.addEventListener("click", resetFilters);
    }

    filterServices();
});

/* =========================================
   ĐĂNG NHẬP - MEDCARE
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    // Chỉ chạy trên trang đăng nhập
    if (!loginForm) {
        return;
    }

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const rememberCheckbox = document.getElementById("rememberLogin");
    const togglePassword = document.getElementById("toggleLoginPassword");
    const messageBox = document.getElementById("loginMessage");

    const usernameError = document.getElementById("loginUsernameError");
    const passwordError = document.getElementById("loginPasswordError");
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Chỉ lưu tên đăng nhập, không lưu mật khẩu
    try {
        const savedUsername = localStorage.getItem("medcare_remembered_username");

        if (savedUsername && usernameInput) {
            usernameInput.value = savedUsername;

            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    } catch (error) {
        // Tiếp tục cho phép sử dụng form nếu trình duyệt chặn bộ nhớ.
    }

    function showMessage(message, isSuccess) {
        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;
        messageBox.hidden = false;
        messageBox.classList.toggle("auth-message-success", Boolean(isSuccess));
    }

    function clearMessage() {
        if (messageBox) {
            messageBox.hidden = true;
            messageBox.textContent = "";
            messageBox.classList.remove("auth-message-success");
        }
    }

    function setFieldError(input, errorElement, message) {
        if (input) {
            input.classList.toggle("is-invalid", Boolean(message));
            input.setAttribute("aria-invalid", message ? "true" : "false");
        }

        if (errorElement) {
            errorElement.textContent = message || "";
        }
    }

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const shouldShow = passwordInput.type === "password";

            passwordInput.type = shouldShow ? "text" : "password";

            const icon = togglePassword.querySelector("i");

            if (icon) {
                icon.classList.toggle("bi-eye", !shouldShow);
                icon.classList.toggle("bi-eye-slash", shouldShow);
            }

            togglePassword.setAttribute("aria-pressed", String(shouldShow));
            togglePassword.setAttribute(
                "aria-label",
                shouldShow ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            );
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener("input", function () {
            setFieldError(usernameInput, usernameError, "");
            clearMessage();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            setFieldError(passwordInput, passwordError, "");
            clearMessage();
        });
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearMessage();

        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        let isValid = true;

        if (!username) {
            setFieldError(
                usernameInput,
                usernameError,
                "Vui lòng nhập tên đăng nhập hoặc email."
            );
            isValid = false;
        } else {
            setFieldError(usernameInput, usernameError, "");
        }

        if (!password.trim()) {
            setFieldError(
                passwordInput,
                passwordError,
                "Vui lòng nhập mật khẩu."
            );
            isValid = false;
        } else {
            setFieldError(passwordInput, passwordError, "");
        }

        if (!isValid) {
            showMessage("Vui lòng kiểm tra lại thông tin đăng nhập.", false);

            const firstInvalid = loginForm.querySelector(".is-invalid");

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        try {
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem("medcare_remembered_username", username);
            } else {
                localStorage.removeItem("medcare_remembered_username");
            }
        } catch (error) {
            // Không lưu thông tin nếu trình duyệt không cho phép.
        }

        showMessage(
            "Thông tin đã được kiểm tra. Chức năng xác thực tài khoản cần được kết nối với hệ thống máy chủ.",
            false
        );
    });
});
/* ========================================
   QUÊN MẬT KHẨU - MEDCARE
======================================== */

document.addEventListener("DOMContentLoaded", function () {
    const forgotForm = document.getElementById("forgotPasswordForm");

    // Chỉ chạy trên trang quên mật khẩu.
    if (!forgotForm) {
        return;
    }

    const emailInput = document.getElementById("forgotEmail");
    const emailError = document.getElementById("forgotEmailError");
    const messageBox = document.getElementById("forgotMessage");
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    function hideMessage() {
        messageBox.textContent = "";
        messageBox.className = "forgot-message";
    }

    function clearEmailError() {
        emailError.textContent = "";
        emailInput.classList.remove("is-invalid");
        emailInput.removeAttribute("aria-invalid");
    }

    function showEmailError(message) {
        emailError.textContent = message;
        emailInput.classList.add("is-invalid");
        emailInput.setAttribute("aria-invalid", "true");
    }

    emailInput.addEventListener("input", function () {
        clearEmailError();
        hideMessage();
    });

    forgotForm.addEventListener("submit", function (event) {
        event.preventDefault();

        clearEmailError();
        hideMessage();

        const email = emailInput.value.trim();

        if (email === "") {
            showEmailError("Vui lòng nhập địa chỉ email.");
            emailInput.focus();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showEmailError("Vui lòng nhập địa chỉ email hợp lệ.");
            emailInput.focus();
            return;
        }

        messageBox.textContent =
            "Email đã đúng định dạng. Để gửi liên kết đặt lại mật khẩu, hệ thống cần xác minh tài khoản và kết nối dịch vụ gửi email.";

        messageBox.className = "forgot-message is-visible is-info";
    });
});
/* ========================================
   ĐĂNG KÝ TÀI KHOẢN - MEDCARE
======================================== */

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    // Chỉ chạy trên trang đăng ký.
    if (!registerForm) {
        return;
    }

    const fullNameInput = document.getElementById("registerFullName");
    const emailInput = document.getElementById("registerEmail");
    const phoneInput = document.getElementById("registerPhone");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("registerConfirmPassword");
    const agreeInput = document.getElementById("registerAgree");
    const messageBox = document.getElementById("registerMessage");
    const yearElement = document.getElementById("currentYear");

    const fields = [
        {
            input: fullNameInput,
            error: document.getElementById("registerFullNameError")
        },
        {
            input: emailInput,
            error: document.getElementById("registerEmailError")
        },
        {
            input: phoneInput,
            error: document.getElementById("registerPhoneError")
        },
        {
            input: passwordInput,
            error: document.getElementById("registerPasswordError")
        },
        {
            input: confirmPasswordInput,
            error: document.getElementById("registerConfirmPasswordError")
        }
    ];

    const agreeError = document.getElementById("registerAgreeError");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Hiện hoặc ẩn mật khẩu.
    document.querySelectorAll(".register-toggle-password").forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.dataset.passwordTarget;
            const targetInput = document.getElementById(targetId);

            if (!targetInput) {
                return;
            }

            const isPassword = targetInput.type === "password";
            targetInput.type = isPassword ? "text" : "password";

            const icon = button.querySelector("i");

            if (icon) {
                icon.classList.toggle("bi-eye", !isPassword);
                icon.classList.toggle("bi-eye-slash", isPassword);
            }

            button.setAttribute(
                "aria-label",
                isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            );
        });
    });

    function hideMessage() {
        messageBox.textContent = "";
        messageBox.className = "register-message";
    }

    function clearFieldError(field) {
        field.error.textContent = "";
        field.input.classList.remove("is-invalid", "is-valid");
        field.input.removeAttribute("aria-invalid");
    }

    function showFieldError(field, message) {
        field.error.textContent = message;
        field.input.classList.add("is-invalid");
        field.input.classList.remove("is-valid");
        field.input.setAttribute("aria-invalid", "true");
    }

    function showFieldValid(field) {
        field.error.textContent = "";
        field.input.classList.remove("is-invalid");
        field.input.classList.add("is-valid");
        field.input.removeAttribute("aria-invalid");
    }

    function clearAllErrors() {
        fields.forEach(clearFieldError);
        agreeError.textContent = "";
    }

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "register-message is-visible is-" + type;
    }

    function validateFullName() {
        const value = fullNameInput.value.trim();
        const field = fields[0];

        clearFieldError(field);

        if (!value) {
            showFieldError(field, "Vui lòng nhập họ và tên.");
            return false;
        }

        if (value.length < 2) {
            showFieldError(field, "Họ và tên phải có ít nhất 2 ký tự.");
            return false;
        }

        if (/\d/.test(value)) {
            showFieldError(field, "Họ và tên không được chứa chữ số.");
            return false;
        }

        showFieldValid(field);
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const field = fields[1];
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        clearFieldError(field);

        if (!value) {
            showFieldError(field, "Vui lòng nhập địa chỉ email.");
            return false;
        }

        if (!emailPattern.test(value)) {
            showFieldError(field, "Địa chỉ email chưa hợp lệ.");
            return false;
        }

        showFieldValid(field);
        return true;
    }

    function validatePhone() {
        const value = phoneInput.value.trim();
        const field = fields[2];
        const digits = value.replace(/[\s().-]/g, "");

        clearFieldError(field);

        if (!value) {
            showFieldError(field, "Vui lòng nhập số điện thoại.");
            return false;
        }

        if (!/^\+?\d{9,15}$/.test(digits)) {
            showFieldError(field, "Số điện thoại phải có từ 9 đến 15 chữ số.");
            return false;
        }

        showFieldValid(field);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        const field = fields[3];

        clearFieldError(field);

        if (!value) {
            showFieldError(field, "Vui lòng nhập mật khẩu.");
            return false;
        }

        if (value.length < 8) {
            showFieldError(field, "Mật khẩu phải có ít nhất 8 ký tự.");
            return false;
        }

        showFieldValid(field);
        return true;
    }

    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        const field = fields[4];

        clearFieldError(field);

        if (!value) {
            showFieldError(field, "Vui lòng xác nhận mật khẩu.");
            return false;
        }

        if (value !== passwordInput.value) {
            showFieldError(field, "Mật khẩu xác nhận không khớp.");
            return false;
        }

        showFieldValid(field);
        return true;
    }

    function validateAgreement() {
        agreeError.textContent = "";

        if (!agreeInput.checked) {
            agreeError.textContent = "Vui lòng đồng ý với điều khoản để tiếp tục.";
            return false;
        }

        return true;
    }

    fullNameInput.addEventListener("input", function () {
        validateFullName();
        hideMessage();
    });

    emailInput.addEventListener("input", function () {
        validateEmail();
        hideMessage();
    });

    phoneInput.addEventListener("input", function () {
        validatePhone();
        hideMessage();
    });

    passwordInput.addEventListener("input", function () {
        validatePassword();

        if (confirmPasswordInput.value !== "") {
            validateConfirmPassword();
        }

        hideMessage();
    });

    confirmPasswordInput.addEventListener("input", function () {
        validateConfirmPassword();
        hideMessage();
    });

    agreeInput.addEventListener("change", function () {
        validateAgreement();
        hideMessage();
    });

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        hideMessage();

        const fullNameValid = validateFullName();
        const emailValid = validateEmail();
        const phoneValid = validatePhone();
        const passwordValid = validatePassword();
        const confirmPasswordValid = validateConfirmPassword();
        const agreementValid = validateAgreement();

        if (
            !fullNameValid ||
            !emailValid ||
            !phoneValid ||
            !passwordValid ||
            !confirmPasswordValid ||
            !agreementValid
        ) {
            showMessage(
                "Vui lòng kiểm tra lại thông tin được đánh dấu trước khi tiếp tục.",
                "error"
            );

            const firstInvalid = registerForm.querySelector(".is-invalid");

            if (firstInvalid) {
                firstInvalid.focus();
            } else if (!agreementValid) {
                agreeInput.focus();
            }

            return;
        }

        showMessage(
            "Thông tin đã hợp lệ. Để tạo tài khoản, hệ thống cần kết nối máy chủ để lưu thông tin và xác minh tài khoản.",
            "info"
        );
    });
});
