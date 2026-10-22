
/* =========================================
   MEDCARE - CUSTOMER SERVICE
   File: js/cskh.js
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Xác định trang hiện tại.
    const currentPage = window.location.pathname
        .split("/")
        .filter(Boolean)
        .pop() || "tong-quan.html";

    // Chỉ cập nhật menu trong sidebar CSKH.
    document.querySelectorAll(".sidebar .side-link").forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("http")) {
            return;
        }

        // Không xử lý liên kết đi ra ngoài thư mục CSKH.
        if (href.startsWith("../")) {
            link.classList.remove("active");
            return;
        }

        const linkPage = href.split("/").pop();

        link.classList.toggle("active", linkPage === currentPage);
    });

    // Hiển thị ngày hiện tại nếu trang có phần tử #currentDate.
    const currentDateElement = document.getElementById("currentDate");

    if (currentDateElement) {
        currentDateElement.textContent = new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(new Date());
    }

    // Đánh dấu các liên kết đang được chọn để hỗ trợ điều hướng.
    document.querySelectorAll(".cskh-conversation-item").forEach(function (item) {
        item.addEventListener("click", function () {
            const href = item.getAttribute("href");

            if (!href) {
                return;
            }

            // Giữ nguyên điều hướng theo href hiện có.
            // Trang hội thoại sẽ được triển khai riêng.
        });
    });
});

/* =========================================
   MEDCARE - CUSTOMER SERVICE
   File: js/cskh.js
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Đánh dấu trang hiện tại trên sidebar CSKH.
    const currentPage = window.location.pathname
        .split("/")
        .filter(Boolean)
        .pop() || "tong-quan.html";

    document.querySelectorAll(".sidebar .side-link").forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("../")) {
            return;
        }

        link.classList.toggle("active", href.split("/").pop() === currentPage);
    });

    // Hiển thị ngày hiện tại nếu trang có phần tử tương ứng.
    const currentDateElement = document.getElementById("currentDate");

    if (currentDateElement) {
        currentDateElement.textContent = new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(new Date());
    }

    // Các chức năng hội thoại chỉ chạy trên trang có khung chat.
    const chatMessages = document.getElementById("chatMessages");
    const chatForm = document.getElementById("chatForm");

    if (!chatMessages || !chatForm) {
        return;
    }

    const contacts = Array.from(document.querySelectorAll(".chat-contact"));
    const searchInput = document.getElementById("chatSearch");
    const messageInput = document.getElementById("messageInput");
    const toast = document.getElementById("chatToast");

    const conversations = {
        "1": [
            { type: "received", text: "Xin chào, tôi muốn hỏi về lịch khám tại phòng khám.", time: "10:38" },
            { type: "sent", text: "MedCare xin chào anh/chị. Em có thể hỗ trợ mình thông tin gì ạ?", time: "10:40 · Nhân viên CSKH" },
            { type: "received", text: "Tôi muốn đặt lịch khám vào ngày mai.", time: "10:42" }
        ],
        "2": [
            { type: "received", text: "Xin chào, phòng khám có làm việc vào cuối tuần không?", time: "10:12" },
            { type: "sent", text: "MedCare xin chào anh Bảo. Em sẽ hỗ trợ anh thông tin lịch làm việc của phòng khám.", time: "10:14 · Nhân viên CSKH" },
            { type: "received", text: "Phòng khám có làm việc vào cuối tuần không?", time: "10:15" }
        ],
        "3": [
            { type: "received", text: "Tôi đã nhận được thông tin lịch khám. Cảm ơn bạn đã hỗ trợ tôi.", time: "09:54" },
            { type: "sent", text: "Dạ, MedCare cảm ơn chị đã liên hệ. Chúc chị một ngày tốt lành!", time: "09:56 · Nhân viên CSKH" }
        ],
        "4": [
            { type: "received", text: "Tôi cần hỏi về chi phí khám tổng quát.", time: "09:30" }
        ],
        "5": [
            { type: "received", text: "Tôi đã nhận được kết quả khám.", time: "Hôm qua" },
            { type: "sent", text: "Dạ, cảm ơn chị đã xác nhận. Nếu cần hỗ trợ thêm, chị vui lòng liên hệ MedCare nhé.", time: "Hôm qua · Nhân viên CSKH" }
        ]
    };

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.style.display = "block";

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () {
            toast.style.display = "none";
        }, 2600);
    }

    function renderMessages(id) {
        chatMessages.replaceChildren();

        const divider = document.createElement("div");
        divider.className = "chat-date-divider";
        divider.textContent = "Lịch sử hội thoại";
        chatMessages.appendChild(divider);

        (conversations[id] || []).forEach(function (message) {
            const wrapper = document.createElement("div");
            wrapper.className = "chat-message";

            if (message.type === "sent") {
                wrapper.classList.add("sent");
            }

            const bubble = document.createElement("div");
            bubble.className = "chat-message-bubble";
            bubble.textContent = message.text;

            const time = document.createElement("span");
            time.className = "chat-message-time";
            time.textContent = message.time;

            wrapper.append(bubble, time);
            chatMessages.appendChild(wrapper);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function selectContact(contact) {
        contacts.forEach(function (item) {
            item.classList.toggle("active", item === contact);
        });

        document.getElementById("activeName").textContent = contact.dataset.name;
        document.getElementById("activeAvatar").textContent =
            contact.querySelector(".chat-avatar").textContent.trim();

        document.getElementById("activePhone").textContent = contact.dataset.phone;
        document.getElementById("activeEmail").textContent = contact.dataset.email;
        document.getElementById("activeCode").textContent = contact.dataset.code;

        const activeAvatar = document.getElementById("activeAvatar");
        activeAvatar.classList.toggle("online", contact.dataset.online === "true");

        const activeStatus = document.getElementById("activeStatus");
        activeStatus.replaceChildren();

        const statusText = document.createElement("span");
        statusText.className = contact.dataset.online === "true"
            ? "chat-online-label"
            : "";
        statusText.textContent = contact.dataset.online === "true"
            ? "● Đang trực tuyến"
            : "● Ngoại tuyến";

        activeStatus.appendChild(statusText);

        const unread = contact.querySelector(".chat-unread");
        if (unread) unread.remove();

        if (contact.dataset.status === "unread") {
            contact.dataset.status = "answered";
        }

        renderMessages(contact.dataset.id);
    }

    function updateEmptyState(count) {
        let empty = document.getElementById("chatEmptyState");

        if (count === 0 && !empty) {
            empty = document.createElement("div");
            empty.id = "chatEmptyState";
            empty.className = "chat-empty-state";
            empty.textContent = "Không tìm thấy hội thoại phù hợp.";
            document.getElementById("chatContactList").appendChild(empty);
        }

        if (count > 0 && empty) {
            empty.remove();
        }
    }

    function applyFilters() {
        const activeFilter = document.querySelector(".chat-filter.active");
        const filterType = activeFilter ? activeFilter.dataset.filter : "all";
        const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
        let visibleCount = 0;

        contacts.forEach(function (contact) {
            const status = contact.dataset.status;

            const matchesFilter =
                filterType === "all" ||
                (filterType === "unread" && status === "unread") ||
                (filterType === "waiting" && status === "waiting");

            const searchText = (
                contact.dataset.name + " " +
                contact.dataset.phone + " " +
                contact.dataset.email
            ).toLocaleLowerCase("vi");

            const visible = matchesFilter && searchText.includes(keyword);
            contact.style.display = visible ? "flex" : "none";

            if (visible) visibleCount++;
        });

        updateEmptyState(visibleCount);
    }

    contacts.forEach(function (contact) {
        contact.addEventListener("click", function () {
            selectContact(contact);
            applyFilters();
        });
    });

    document.querySelectorAll(".chat-filter").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".chat-filter").forEach(function (filter) {
                filter.classList.toggle("active", filter === button);
            });

            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const messageText = messageInput.value.trim();

        if (!messageText) {
            showToast("Vui lòng nhập nội dung tin nhắn.");
            messageInput.focus();
            return;
        }

        const activeContact = document.querySelector(".chat-contact.active");

        if (!activeContact) {
            showToast("Vui lòng chọn một hội thoại.");
            return;
        }

        const id = activeContact.dataset.id;
        const time = new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });

        if (!conversations[id]) {
            conversations[id] = [];
        }

        conversations[id].push({
            type: "sent",
            text: messageText,
            time: time + " · Nhân viên CSKH"
        });

        renderMessages(id);

        const preview = activeContact.querySelector(".chat-contact-message");
        if (preview) preview.textContent = messageText;

        const timeLabel = activeContact.querySelector(".chat-contact-time");
        if (timeLabel) timeLabel.textContent = time;

        messageInput.value = "";
        showToast("Tin nhắn đã được thêm vào hội thoại.");
    });

    document.getElementById("clearMessageButton").addEventListener("click", function () {
        messageInput.value = "";
        messageInput.focus();
    });

    document.getElementById("templateButton").addEventListener("click", function () {
        const templates = [
            "MedCare xin chào anh/chị. Em có thể hỗ trợ mình thông tin gì ạ?",
            "Dạ, anh/chị vui lòng cung cấp thời gian mong muốn để em kiểm tra lịch hẹn phù hợp.",
            "MedCare đã tiếp nhận yêu cầu của anh/chị. Bộ phận phụ trách sẽ hỗ trợ trong thời gian sớm nhất."
        ];

        const choice = window.prompt(
            "Chọn mẫu tin nhắn:\n1. Lời chào\n2. Hỗ trợ đặt lịch\n3. Xác nhận tiếp nhận\n\nNhập 1, 2 hoặc 3:"
        );

        if (["1", "2", "3"].includes(choice)) {
            messageInput.value = templates[Number(choice) - 1];
            messageInput.focus();
        }
    });

    document.getElementById("callButton").addEventListener("click", function () {
        const active = document.querySelector(".chat-contact.active");

        if (active) {
            showToast("Số điện thoại: " + active.dataset.phone);
        }
    });

    document.getElementById("customerInfoButton").addEventListener("click", function () {
        const active = document.querySelector(".chat-contact.active");

        if (active) {
            showToast(
                active.dataset.name + " · " +
                active.dataset.code + " · " +
                active.dataset.phone
            );
        }
    });

    if (contacts.length > 0) {
        selectContact(contacts[0]);
    }
});


/* =========================================
   MEDCARE - QUAN LY HOI THOAI CSKH
   Them vao trong DOMContentLoaded cua js/cskh.js
========================================= */

const conversationList = document.getElementById("conversationList");

if (conversationList) {
    const conversationItems = Array.from(
        conversationList.querySelectorAll(".cskh-chat-item")
    );

    const searchInput = document.getElementById("conversationSearch");
    const statusFilter = document.getElementById("conversationStatusFilter");
    const channelFilter = document.getElementById("conversationChannelFilter");

    const customerName = document.getElementById("chatCustomerName");
    const customerPhone = document.getElementById("chatCustomerPhone");
    const customerAvatar = document.getElementById("chatCustomerAvatar");
    const chatChannel = document.getElementById("chatChannel");
    const chatStatusBadge = document.getElementById("chatStatusBadge");
    const initialMessage = document.getElementById("initialCustomerMessage");
    const additionalMessages = document.getElementById("additionalMessages");

    const replyForm = document.getElementById("conversationReplyForm");
    const replyInput = document.getElementById("conversationReply");
    const characterCount = document.getElementById("replyCharacterCount");

    const toastElement = document.getElementById("conversationToast");
    const toastMessage = document.getElementById("conversationToastMessage");

    let selectedConversation = conversationItems[0] || null;

    const statusInformation = {
        unread: {
            text: "Chưa phản hồi",
            className: "status-pending"
        },
        processing: {
            text: "Đang xử lý",
            className: "status-processing"
        },
        resolved: {
            text: "Đã giải quyết",
            className: "status-completed"
        }
    };

    function showConversationToast(message) {
        if (!toastElement || !toastMessage || !window.bootstrap) {
            return;
        }

        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        }).show();
    }

    function getCurrentTime() {
        return new Intl.DateTimeFormat("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date());
    }

    function updateConversationStatus(item, status) {
        if (!item || !statusInformation[status]) {
            return;
        }

        item.dataset.status = status;

        const badge = item.querySelector(".status-badge");
        const information = statusInformation[status];

        if (badge) {
            badge.className = "status-badge " + information.className;
            badge.textContent = information.text;
        }

        if (item === selectedConversation && chatStatusBadge) {
            chatStatusBadge.className =
                "status-badge " + information.className;
            chatStatusBadge.textContent = information.text;
        }

        updateConversationStatistics();
        filterConversations();
    }

    function updateConversationStatistics() {
        const visibleItems = conversationItems.filter(function (item) {
            return !item.hidden;
        });

        const unreadCount = conversationItems.filter(function (item) {
            return item.dataset.status === "unread";
        }).length;

        const processingCount = conversationItems.filter(function (item) {
            return item.dataset.status === "processing";
        }).length;

        const resolvedCount = conversationItems.filter(function (item) {
            return item.dataset.status === "resolved";
        }).length;

        const totalElement = document.getElementById("totalConversations");
        const unreadElement = document.getElementById("unreadConversations");
        const processingElement = document.getElementById("processingConversations");
        const resolvedElement = document.getElementById("resolvedConversations");
        const listCountElement = document.getElementById("conversationListCount");
        const resultCountElement = document.getElementById("conversationResultCount");

        if (totalElement) {
            totalElement.textContent = conversationItems.length;
        }

        if (unreadElement) {
            unreadElement.textContent = unreadCount;
        }

        if (processingElement) {
            processingElement.textContent = processingCount;
        }

        if (resolvedElement) {
            resolvedElement.textContent = resolvedCount;
        }

        if (listCountElement) {
            listCountElement.textContent =
                conversationItems.length + " cuộc hội thoại";
        }

        if (resultCountElement) {
            resultCountElement.textContent =
                "Hiển thị " + visibleItems.length + " hội thoại";
        }
    }

    function filterConversations() {
        const keyword = (searchInput?.value || "")
            .trim()
            .toLocaleLowerCase("vi");

        const selectedStatus = statusFilter?.value || "";
        const selectedChannel = channelFilter?.value || "";

        conversationItems.forEach(function (item) {
            const name = item.dataset.name || "";
            const phone = item.dataset.phone || "";
            const message = item.dataset.message || "";

            const searchableText =
                (name + " " + phone + " " + message)
                    .toLocaleLowerCase("vi");

            const matchesKeyword = searchableText.includes(keyword);
            const matchesStatus =
                !selectedStatus || item.dataset.status === selectedStatus;
            const matchesChannel =
                !selectedChannel || item.dataset.channel === selectedChannel;

            item.hidden = !(
                matchesKeyword &&
                matchesStatus &&
                matchesChannel
            );
        });

        const visibleItems = conversationItems.filter(function (item) {
            return !item.hidden;
        });

        const resultCountElement =
            document.getElementById("conversationResultCount");

        if (resultCountElement) {
            resultCountElement.textContent =
                "Hiển thị " + visibleItems.length + " hội thoại";
        }

        const listCountElement =
            document.getElementById("conversationListCount");

        if (listCountElement) {
            listCountElement.textContent =
                visibleItems.length + " cuộc hội thoại";
        }

        if (selectedConversation && selectedConversation.hidden) {
            const nextConversation = visibleItems[0];

            if (nextConversation) {
                selectConversation(nextConversation);
            } else {
                selectedConversation = null;

                if (customerName) {
                    customerName.textContent = "Không tìm thấy hội thoại";
                }

                if (customerPhone) {
                    customerPhone.textContent =
                        "Hãy thay đổi điều kiện tìm kiếm.";
                }

                if (customerAvatar) {
                    customerAvatar.textContent = "?";
                }

                if (initialMessage) {
                    initialMessage.textContent =
                        "Không có hội thoại phù hợp với điều kiện lọc.";
                }

                if (additionalMessages) {
                    additionalMessages.replaceChildren();
                }

                if (chatStatusBadge) {
                    chatStatusBadge.textContent = "Không có dữ liệu";
                    chatStatusBadge.className = "status-badge";
                }

                if (chatChannel) {
                    chatChannel.textContent = "—";
                }

                if (replyInput) {
                    replyInput.disabled = true;
                    replyInput.value = "";
                }

                const sendButton = replyForm?.querySelector(
                    'button[type="submit"]'
                );

                if (sendButton) {
                    sendButton.disabled = true;
                }
            }
        } else if (!selectedConversation && visibleItems.length > 0) {
            selectConversation(visibleItems[0]);
        }
    }

    function selectConversation(item) {
        if (!item) {
            return;
        }

        selectedConversation = item;

        conversationItems.forEach(function (conversation) {
            conversation.classList.toggle("active", conversation === item);
        });

        const name = item.dataset.name || "Khách hàng";
        const phone = item.dataset.phone || "Chưa có số điện thoại";
        const avatar = item.dataset.avatar || "?";
        const message = item.dataset.message || "Chưa có nội dung tin nhắn.";

        if (customerName) {
            customerName.textContent = name;
        }

        if (customerPhone) {
            customerPhone.replaceChildren();

            const icon = document.createElement("i");
            icon.className = "bi bi-telephone";

            customerPhone.append(
                icon,
                document.createTextNode(" " + phone)
            );
        }

        if (customerAvatar) {
            customerAvatar.textContent = avatar;
            customerAvatar.className =
                "cskh-chat-avatar " +
                (item.querySelector(".cskh-chat-avatar")?.classList.contains("avatar-green")
                    ? "avatar-green"
                    : item.querySelector(".cskh-chat-avatar")?.classList.contains("avatar-purple")
                    ? "avatar-purple"
                    : item.querySelector(".cskh-chat-avatar")?.classList.contains("avatar-orange")
                    ? "avatar-orange"
                    : item.querySelector(".cskh-chat-avatar")?.classList.contains("avatar-pink")
                    ? "avatar-pink"
                    : "avatar-blue");
        }

        if (chatChannel) {
            const channelNames = {
                website: "Website",
                phone: "Điện thoại",
                direct: "Trực tiếp"
            };

            chatChannel.textContent =
                channelNames[item.dataset.channel] || "Khác";
        }

        if (initialMessage) {
            initialMessage.textContent = message;
        }

        if (additionalMessages) {
            additionalMessages.replaceChildren();
        }

        if (replyInput) {
            replyInput.disabled = false;
            replyInput.value = "";
        }

        const sendButton = replyForm?.querySelector(
            'button[type="submit"]'
        );

        if (sendButton) {
            sendButton.disabled = false;
        }

        if (characterCount) {
            characterCount.textContent = "0/1000 ký tự";
        }

        const status = item.dataset.status || "unread";
        const information = statusInformation[status];

        if (chatStatusBadge && information) {
            chatStatusBadge.className =
                "status-badge " + information.className;
            chatStatusBadge.textContent = information.text;
        }

        /*
         * Khi nhân viên mở hội thoại chưa phản hồi,
         * chuyển sang trạng thái đang xử lý.
         */
        if (status === "unread") {
            updateConversationStatus(item, "processing");
        }

        if (additionalMessages) {
            additionalMessages.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            });
        }
    }

    function appendMessage(message, direction, time) {
        const row = document.createElement("div");
        row.className = "cskh-message-row " + direction;

        const avatar = document.createElement("div");
        avatar.className =
            "cskh-message-avatar " +
            (direction === "outgoing" ? "avatar-green" : "avatar-blue");

        avatar.textContent =
            direction === "outgoing" ? "CS" :
            (selectedConversation?.dataset.avatar || "?");

        const content = document.createElement("div");
        content.className = "cskh-message-content";

        const bubble = document.createElement("div");
        bubble.className = "cskh-message-bubble";
        bubble.textContent = message;

        const timeElement = document.createElement("span");
        timeElement.className = "cskh-message-time";
        timeElement.textContent = time;

        content.append(bubble, timeElement);
        row.append(avatar, content);

        return row;
    }

    // Chọn hội thoại
    conversationItems.forEach(function (item) {
        item.addEventListener("click", function () {
            selectConversation(item);
        });
    });

    // Tìm kiếm và lọc
    searchInput?.addEventListener("input", filterConversations);
    statusFilter?.addEventListener("change", filterConversations);
    channelFilter?.addEventListener("change", filterConversations);

    // Đếm số ký tự
    replyInput?.addEventListener("input", function () {
        if (characterCount) {
            characterCount.textContent =
                replyInput.value.length + "/1000 ký tự";
        }
    });

    // Gửi phản hồi
    replyForm?.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!selectedConversation || !replyInput) {
            showConversationToast("Vui lòng chọn một hội thoại.");
            return;
        }

        const message = replyInput.value.trim();

        if (!message) {
            replyInput.focus();
            return;
        }

        const time = getCurrentTime();

        if (additionalMessages) {
            additionalMessages.append(
                appendMessage(message, "outgoing", time)
            );
        }

        // Cập nhật nội dung xem trước trong danh sách.
        selectedConversation.dataset.message = message;

        const preview =
            selectedConversation.querySelector(".cskh-chat-preview");

        if (preview) {
            preview.textContent = message;
        }

        const timeElement =
            selectedConversation.querySelector(".cskh-chat-item-top small");

        if (timeElement) {
            timeElement.textContent = time;
        }

        // Sau khi phản hồi, hội thoại chuyển sang đang xử lý.
        updateConversationStatus(selectedConversation, "processing");

        replyInput.value = "";

        if (characterCount) {
            characterCount.textContent = "0/1000 ký tự";
        }

        showConversationToast("Đã ghi nhận phản hồi.");
    });

    // Đánh dấu đang xử lý
    document.getElementById("markProcessingBtn")
        ?.addEventListener("click", function () {
            if (!selectedConversation) {
                showConversationToast("Vui lòng chọn một hội thoại.");
                return;
            }

            updateConversationStatus(selectedConversation, "processing");
            showConversationToast("Đã chuyển sang trạng thái đang xử lý.");
        });

    // Đánh dấu đã giải quyết
    document.getElementById("markResolvedBtn")
        ?.addEventListener("click", function () {
            if (!selectedConversation) {
                showConversationToast("Vui lòng chọn một hội thoại.");
                return;
            }

            updateConversationStatus(selectedConversation, "resolved");
            showConversationToast("Đã giải quyết hội thoại.");
        });

    // Xóa bộ lọc
    document.getElementById("clearConversationFiltersBtn")
        ?.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "";
            if (channelFilter) channelFilter.value = "";

            filterConversations();

            showConversationToast("Đã xóa bộ lọc.");
        });

    // Làm mới danh sách và bộ lọc
    document.getElementById("refreshConversationsBtn")
        ?.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "";
            if (channelFilter) channelFilter.value = "";

            filterConversations();

            showConversationToast("Danh sách hội thoại đã được cập nhật.");
        });

    // Khởi tạo giao diện
    updateConversationStatistics();

    if (selectedConversation) {
        selectConversation(selectedConversation);
    }
}
/* =========================================================
   MODULE QUẢN LÝ KHÁCH HÀNG - CSKH
   Dùng cho trang cskh/khach-hang.html
========================================================= */

(function () {
    "use strict";

    const customerTableBody = document.getElementById("customerTableBody");

    // Không chạy module này nếu đang ở trang khác.
    if (!customerTableBody) return;

    const searchInput = document.getElementById("customerSearch");
    const genderFilter = document.getElementById("customerGenderFilter");
    const statusFilter = document.getElementById("customerStatusFilter");
    const resetButton = document.getElementById("resetCustomerFilters");
    const exportButton = document.getElementById("exportCustomerBtn");

    const customerModalElement = document.getElementById("customerModal");
    const customerForm = document.getElementById("customerForm");
    const customerIdInput = document.getElementById("customerId");
    const customerNameInput = document.getElementById("customerName");
    const customerPhoneInput = document.getElementById("customerPhone");
    const customerEmailInput = document.getElementById("customerEmail");
    const customerGenderInput = document.getElementById("customerGender");
    const customerAddressInput = document.getElementById("customerAddress");
    const customerFormStatusInput = document.getElementById("customerFormStatus");
    const addCustomerButton = document.getElementById("addCustomerBtn");
    const saveCustomerButton = document.getElementById("saveCustomerBtn");

    const toastElement = document.getElementById("customerToast");
    const toastMessage = document.getElementById("customerToastMessage");

    const customerModal = customerModalElement && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(customerModalElement)
        : null;

    const customerToast = toastElement && window.bootstrap
        ? bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2500
        })
        : null;

    let customers = [
        {
            id: "KH001",
            name: "Nguyễn Minh Anh",
            phone: "0901234567",
            email: "minhanh@example.com",
            gender: "Nữ",
            address: "Thủ Đức, TP. Hồ Chí Minh",
            bookings: 5,
            createdAt: "2026-10-05",
            status: "active"
        },
        {
            id: "KH002",
            name: "Trần Quốc Bảo",
            phone: "0912345678",
            email: "quocbao@example.com",
            gender: "Nam",
            address: "Bình Thạnh, TP. Hồ Chí Minh",
            bookings: 3,
            createdAt: "2026-10-12",
            status: "active"
        },
        {
            id: "KH003",
            name: "Lê Thu Hà",
            phone: "0923456789",
            email: "thuha@example.com",
            gender: "Nữ",
            address: "Gò Vấp, TP. Hồ Chí Minh",
            bookings: 0,
            createdAt: "2026-10-18",
            status: "active"
        },
        {
            id: "KH004",
            name: "Phạm Hoàng Nam",
            phone: "0934567890",
            email: "hoangnam@example.com",
            gender: "Nam",
            address: "Quận 1, TP. Hồ Chí Minh",
            bookings: 2,
            createdAt: "2026-09-22",
            status: "inactive"
        },
        {
            id: "KH005",
            name: "Võ Ngọc Linh",
            phone: "0945678901",
            email: "ngoclinh@example.com",
            gender: "Nữ",
            address: "Tân Bình, TP. Hồ Chí Minh",
            bookings: 1,
            createdAt: "2026-10-20",
            status: "active"
        }
    ];

    let nextCustomerNumber = 6;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function showCustomerToast(message) {
        if (toastMessage) {
            toastMessage.textContent = message;
        }

        if (customerToast) {
            customerToast.show();
        } else {
            alert(message);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getGenderClass(gender) {
        if (gender === "Nam") return "gender-male";
        if (gender === "Nữ") return "gender-female";
        return "gender-other";
    }

    function getStatusLabel(status) {
        return status === "active" ? "Đang hoạt động" : "Ngừng hoạt động";
    }

    function getStatusClass(status) {
        return status === "active" ? "status-active" : "status-inactive";
    }

    function getInitials(name) {
        return String(name || "KH")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(function (word) {
                return word.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function getFilteredCustomers() {
        const keyword = (searchInput?.value || "").trim().toLowerCase();
        const gender = genderFilter?.value || "";
        const status = statusFilter?.value || "";

        return customers.filter(function (customer) {
            const matchesKeyword = [
                customer.id,
                customer.name,
                customer.phone,
                customer.email
            ].some(function (value) {
                return String(value || "").toLowerCase().includes(keyword);
            });

            const matchesGender = !gender || customer.gender === gender;
            const matchesStatus = !status || customer.status === status;

            return matchesKeyword && matchesGender && matchesStatus;
        });
    }

    function renderCustomers() {
        const filteredCustomers = getFilteredCustomers();

        if (filteredCustomers.length === 0) {
            customerTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="bi bi-people fs-2 d-block mb-2 text-secondary"></i>
                        <span class="text-secondary">Không tìm thấy khách hàng phù hợp.</span>
                    </td>
                </tr>
            `;
        } else {
            customerTableBody.innerHTML = filteredCustomers.map(function (customer) {
                return `
                    <tr data-customer-id="${escapeHTML(customer.id)}">
                        <td>
                            <span class="customer-code">${escapeHTML(customer.id)}</span>
                        </td>

                        <td>
                            <div class="customer-person">
                                <div class="customer-avatar">
                                    ${escapeHTML(getInitials(customer.name))}
                                </div>

                                <div class="customer-person-info">
                                    <div class="customer-person-name">
                                        ${escapeHTML(customer.name)}
                                    </div>
                                    <div class="customer-person-email">
                                        ${escapeHTML(customer.email || "Chưa cập nhật email")}
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="customer-contact">
                                ${escapeHTML(customer.phone)}
                            </span>
                        </td>

                        <td>
                            <span class="customer-gender ${getGenderClass(customer.gender)}">
                                ${escapeHTML(customer.gender)}
                            </span>
                        </td>

                        <td>
                            <span class="customer-booking-count">
                                ${customer.bookings}
                            </span>
                        </td>

                        <td>
                            <span class="customer-date">
                                ${formatDate(customer.createdAt)}
                            </span>
                        </td>

                        <td>
                            <span class="customer-status ${getStatusClass(customer.status)}">
                                ${getStatusLabel(customer.status)}
                            </span>
                        </td>

                        <td>
                            <div class="customer-actions">
                                <button type="button"
                                    class="customer-action-btn"
                                    data-action="view"
                                    data-id="${escapeHTML(customer.id)}"
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button type="button"
                                    class="customer-action-btn"
                                    data-action="edit"
                                    data-id="${escapeHTML(customer.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button type="button"
                                    class="customer-action-btn text-danger"
                                    data-action="delete"
                                    data-id="${escapeHTML(customer.id)}"
                                    title="Xóa khách hàng"
                                    aria-label="Xóa khách hàng">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        updateCustomerStatistics(filteredCustomers);
    }

    function updateCustomerStatistics(filteredCustomers) {
        const totalElement = document.getElementById("customerTotal");
        const newElement = document.getElementById("customerNew");
        const bookedElement = document.getElementById("customerBooked");
        const supportElement = document.getElementById("customerSupport");
        const resultCount = document.getElementById("customerResultCount");

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newCustomers = customers.filter(function (customer) {
            const date = new Date(customer.createdAt + "T00:00:00");

            return date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear;
        }).length;

        const bookedCustomers = customers.filter(function (customer) {
            return customer.bookings > 0;
        }).length;

        const inactiveCustomers = customers.filter(function (customer) {
            return customer.status === "inactive";
        }).length;

        if (totalElement) totalElement.textContent = customers.length;
        if (newElement) newElement.textContent = newCustomers;
        if (bookedElement) bookedElement.textContent = bookedCustomers;
        if (supportElement) supportElement.textContent = inactiveCustomers;

        if (resultCount) {
            resultCount.textContent =
                `Hiển thị ${filteredCustomers.length} / ${customers.length} khách hàng`;
        }
    }

    function resetCustomerForm() {
        if (!customerForm) return;

        customerForm.reset();

        if (customerIdInput) customerIdInput.value = "";
        if (customerFormStatusInput) customerFormStatusInput.value = "active";

        const modalTitle = customerModalElement?.querySelector(".modal-title");
        if (modalTitle) modalTitle.textContent = "Thêm khách hàng";

        if (saveCustomerButton) {
            saveCustomerButton.innerHTML =
                '<i class="bi bi-check-lg me-1"></i> Lưu khách hàng';
        }
    }

    function openAddCustomerModal() {
        resetCustomerForm();

        if (customerModal) {
            customerModal.show();
        }
    }

    function openEditCustomerModal(customer) {
        if (!customerForm || !customer) return;

        resetCustomerForm();

        customerIdInput.value = customer.id;
        customerNameInput.value = customer.name;
        customerPhoneInput.value = customer.phone;
        customerEmailInput.value = customer.email;
        customerGenderInput.value = customer.gender;
        customerAddressInput.value = customer.address;
        customerFormStatusInput.value = customer.status;

        const modalTitle = customerModalElement?.querySelector(".modal-title");
        if (modalTitle) modalTitle.textContent = "Cập nhật khách hàng";

        if (saveCustomerButton) {
            saveCustomerButton.innerHTML =
                '<i class="bi bi-check-lg me-1"></i> Lưu thay đổi';
        }

        if (customerModal) {
            customerModal.show();
        }
    }

    function viewCustomer(customer) {
        if (!customer) return;

        const details = [
            `Mã khách hàng: ${customer.id}`,
            `Họ và tên: ${customer.name}`,
            `Số điện thoại: ${customer.phone}`,
            `Email: ${customer.email || "Chưa cập nhật"}`,
            `Giới tính: ${customer.gender}`,
            `Địa chỉ: ${customer.address || "Chưa cập nhật"}`,
            `Số lượt đặt lịch: ${customer.bookings}`,
            `Ngày đăng ký: ${formatDate(customer.createdAt)}`,
            `Trạng thái: ${getStatusLabel(customer.status)}`
        ];

        alert(details.join("\n"));
    }

    function deleteCustomer(customer) {
        if (!customer) return;

        if (customer.bookings > 0) {
            showCustomerToast(
                "Khách hàng đã có lịch đặt. Không thể xóa thông tin này."
            );
            return;
        }

        const confirmed = confirm(
            `Bạn có chắc chắn muốn xóa khách hàng "${customer.name}" (${customer.id}) không?`
        );

        if (!confirmed) return;

        customers = customers.filter(function (item) {
            return item.id !== customer.id;
        });

        renderCustomers();
        showCustomerToast("Đã xóa khách hàng thành công.");
    }

    function generateCustomerId() {
        let id;

        do {
            id = "KH" + String(nextCustomerNumber).padStart(3, "0");
            nextCustomerNumber++;
        } while (customers.some(function (customer) {
            return customer.id === id;
        }));

        return id;
    }

    function validateCustomerForm() {
        const name = customerNameInput.value.trim();
        const phone = customerPhoneInput.value.trim();
        const email = customerEmailInput.value.trim();

        if (!name) {
            showCustomerToast("Vui lòng nhập họ và tên khách hàng.");
            customerNameInput.focus();
            return false;
        }

        if (!/^0\d{9}$/.test(phone)) {
            showCustomerToast("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.");
            customerPhoneInput.focus();
            return false;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showCustomerToast("Vui lòng nhập địa chỉ email hợp lệ.");
            customerEmailInput.focus();
            return false;
        }

        const editingId = customerIdInput.value;

        const duplicatePhone = customers.some(function (customer) {
            return customer.phone === phone && customer.id !== editingId;
        });

        if (duplicatePhone) {
            showCustomerToast("Số điện thoại này đã được đăng ký.");
            customerPhoneInput.focus();
            return false;
        }

        const duplicateEmail = email && customers.some(function (customer) {
            return customer.email.toLowerCase() === email.toLowerCase() &&
                customer.id !== editingId;
        });

        if (duplicateEmail) {
            showCustomerToast("Email này đã được sử dụng cho khách hàng khác.");
            customerEmailInput.focus();
            return false;
        }

        return true;
    }

    if (customerForm) {
        customerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!validateCustomerForm()) return;

            const editingId = customerIdInput.value;
            const existingCustomer = customers.find(function (customer) {
                return customer.id === editingId;
            });

            const customerData = {
                id: editingId || generateCustomerId(),
                name: customerNameInput.value.trim(),
                phone: customerPhoneInput.value.trim(),
                email: customerEmailInput.value.trim(),
                gender: customerGenderInput.value,
                address: customerAddressInput.value.trim(),
                bookings: existingCustomer ? existingCustomer.bookings : 0,
                createdAt: existingCustomer
                    ? existingCustomer.createdAt
                    : new Date().toISOString().slice(0, 10),
                status: customerFormStatusInput.value || "active"
            };

            if (existingCustomer) {
                customers = customers.map(function (customer) {
                    return customer.id === editingId ? customerData : customer;
                });

                showCustomerToast("Cập nhật thông tin khách hàng thành công.");
            } else {
                customers.unshift(customerData);
                showCustomerToast("Thêm khách hàng mới thành công.");
            }

            renderCustomers();

            if (customerModal) {
                customerModal.hide();
            }
        });
    }

    if (addCustomerButton) {
        addCustomerButton.addEventListener("click", openAddCustomerModal);
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderCustomers);
    }

    if (genderFilter) {
        genderFilter.addEventListener("change", renderCustomers);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", renderCustomers);
    }

    if (resetButton) {
        resetButton.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            if (genderFilter) genderFilter.value = "";
            if (statusFilter) statusFilter.value = "";

            renderCustomers();
        });
    }

    customerTableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const customerId = button.dataset.id;

        const customer = customers.find(function (item) {
            return item.id === customerId;
        });

        if (!customer) return;

        if (action === "view") {
            viewCustomer(customer);
        } else if (action === "edit") {
            openEditCustomerModal(customer);
        } else if (action === "delete") {
            deleteCustomer(customer);
        }
    });

    if (exportButton) {
        exportButton.addEventListener("click", function () {
            const data = getFilteredCustomers();

            if (data.length === 0) {
                showCustomerToast("Không có khách hàng để xuất.");
                return;
            }

            const headers = [
                "Mã khách hàng",
                "Họ và tên",
                "Số điện thoại",
                "Email",
                "Giới tính",
                "Địa chỉ",
                "Số lượt đặt lịch",
                "Ngày đăng ký",
                "Trạng thái"
            ];

            const rows = data.map(function (customer) {
                return [
                    customer.id,
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.gender,
                    customer.address,
                    customer.bookings,
                    formatDate(customer.createdAt),
                    getStatusLabel(customer.status)
                ];
            });

            function escapeCSV(value) {
                let text = String(value ?? "");

                // Tránh dữ liệu bắt đầu bằng ký tự công thức trong Excel.
                if (/^[=+\-@]/.test(text)) {
                    text = "'" + text;
                }

                return '"' + text.replace(/"/g, '""') + '"';
            }

            const csvContent = "\uFEFF" + [headers, ...rows]
                .map(function (row) {
                    return row.map(escapeCSV).join(",");
                })
                .join("\r\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "danh-sach-khach-hang.csv";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);

            showCustomerToast("Đã xuất danh sách khách hàng.");
        });
    }

    if (customerModalElement) {
        customerModalElement.addEventListener("hidden.bs.modal", resetCustomerForm);
    }

    // Hiển thị danh sách và thống kê khi mở trang.
    renderCustomers();

})();
/* =========================================================
   QUẢN LÝ YÊU CẦU ĐẶT LỊCH - MEDCARE CSKH
========================================================= */
(() => {
    const tableBody = document.getElementById("bookingRequestTableBody");

    // Chỉ chạy trên trang yêu cầu đặt lịch.
    if (!tableBody) return;

    const searchInput = document.getElementById("bookingRequestSearch");
    const departmentFilter = document.getElementById("bookingRequestDepartment");
    const statusFilter = document.getElementById("bookingRequestStatus");
    const resetButton = document.getElementById("resetBookingRequestFilters");
    const refreshButton = document.getElementById("refreshBookingRequests");
    const resultCount = document.getElementById("bookingRequestResultCount");

    const totalElement = document.getElementById("bookingRequestTotal");
    const pendingElement = document.getElementById("bookingRequestPending");
    const confirmedElement = document.getElementById("bookingRequestConfirmed");
    const rejectedElement = document.getElementById("bookingRequestRejected");

    const modalElement = document.getElementById("bookingRequestDetailModal");
    const toastElement = document.getElementById("bookingRequestToast");
    const toastMessage = document.getElementById("bookingRequestToastMessage");

    const detailCode = document.getElementById("bookingRequestDetailCode");
    const detailName = document.getElementById("detailCustomerName");
    const detailPhone = document.getElementById("detailCustomerPhone");
    const detailEmail = document.getElementById("detailCustomerEmail");
    const detailDepartment = document.getElementById("detailDepartment");
    const detailDoctor = document.getElementById("detailDoctor");
    const detailDate = document.getElementById("detailDate");
    const detailTime = document.getElementById("detailTime");
    const detailStatus = document.getElementById("detailStatus");
    const detailReason = document.getElementById("detailReason");

    const rejectReasonWrap = document.getElementById("bookingRequestRejectReasonWrap");
    const rejectReasonInput = document.getElementById("bookingRequestRejectReason");
    const confirmButton = document.getElementById("confirmBookingRequestBtn");
    const rejectButton = document.getElementById("rejectBookingRequestBtn");

    const modal = modalElement && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(modalElement)
        : null;

    const toast = toastElement && window.bootstrap
        ? bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 3000
        })
        : null;

    let selectedRequestId = null;
    let rejectionMode = false;

    // Dữ liệu khởi tạo để hiển thị giao diện.
    // Khi kết nối backend, thay phần này bằng dữ liệu từ API.
    let bookingRequests = [
        {
            id: "YC260001",
            name: "Nguyễn Minh Anh",
            phone: "0901234567",
            email: "minhanh@example.com",
            department: "Tim mạch",
            doctor: "BS. Nguyễn Hoàng Nam",
            date: "2026-10-22",
            time: "08:30",
            status: "pending",
            reason: "Tôi muốn kiểm tra sức khỏe tim mạch định kỳ."
        },
        {
            id: "YC260002",
            name: "Trần Hoàng Long",
            phone: "0912345678",
            email: "hoanglong@example.com",
            department: "Nội tổng quát",
            doctor: "BS. Trần Minh Tuấn",
            date: "2026-10-22",
            time: "09:00",
            status: "confirmed",
            reason: "Tôi cần khám tổng quát và tư vấn sức khỏe."
        },
        {
            id: "YC260003",
            name: "Lê Thu Hà",
            phone: "0987654321",
            email: "thuha@example.com",
            department: "Da liễu",
            doctor: "BS. Phạm Ngọc Lan",
            date: "2026-10-23",
            time: "10:00",
            status: "pending",
            reason: "Tôi muốn đặt lịch khám da liễu."
        },
        {
            id: "YC260004",
            name: "Phạm Quốc Bảo",
            phone: "0934567890",
            email: "quocbao@example.com",
            department: "Tai Mũi Họng",
            doctor: "BS. Lê Thanh Bình",
            date: "2026-10-24",
            time: "14:00",
            status: "rejected",
            reason: "Tôi muốn kiểm tra sức khỏe tai mũi họng.",
            rejectionReason: "Khung giờ này hiện không còn lịch trống."
        },
        {
            id: "YC260005",
            name: "Võ Ngọc Trâm",
            phone: "0961234567",
            email: "ngoctram@example.com",
            department: "Nhi khoa",
            doctor: "BS. Nguyễn Thị Mai",
            date: "2026-10-25",
            time: "08:00",
            status: "pending",
            reason: "Tôi muốn đặt lịch khám cho bé."
        },
        {
            id: "YC260006",
            name: "Đặng Thành Đạt",
            phone: "0972345678",
            email: "thanhdat@example.com",
            department: "Cơ xương khớp",
            doctor: "BS. Trần Quốc Huy",
            date: "2026-10-26",
            time: "15:30",
            status: "confirmed",
            reason: "Tôi cần được tư vấn về đau nhức xương khớp."
        }
    ];

    const statusLabels = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        rejected: "Đã từ chối"
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
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
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getInitials(name) {
        return String(name || "KH")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function showToast(message) {
        if (toastMessage) {
            toastMessage.textContent = message;
        }

        if (toast) {
            toast.show();
        } else {
            window.alert(message);
        }
    }

    function getStatusHTML(status) {
        const label = statusLabels[status] || "Không xác định";

        return `
            <span class="booking-request-status status-${escapeHTML(status)}">
                ${escapeHTML(label)}
            </span>
        `;
    }

    function getFilteredRequests() {
        const keyword = (searchInput?.value || "").trim().toLowerCase();
        const department = departmentFilter?.value || "";
        const status = statusFilter?.value || "";

        return bookingRequests.filter(request => {
            const searchableText = [
                request.id,
                request.name,
                request.phone,
                request.email,
                request.doctor,
                request.department
            ].join(" ").toLowerCase();

            const matchesKeyword = !keyword || searchableText.includes(keyword);
            const matchesDepartment = !department || request.department === department;
            const matchesStatus = !status || request.status === status;

            return matchesKeyword && matchesDepartment && matchesStatus;
        });
    }

    function updateStatistics() {
        if (totalElement) {
            totalElement.textContent = bookingRequests.length;
        }

        if (pendingElement) {
            pendingElement.textContent =
                bookingRequests.filter(item => item.status === "pending").length;
        }

        if (confirmedElement) {
            confirmedElement.textContent =
                bookingRequests.filter(item => item.status === "confirmed").length;
        }

        if (rejectedElement) {
            rejectedElement.textContent =
                bookingRequests.filter(item => item.status === "rejected").length;
        }
    }

    function renderTable() {
        const filteredRequests = getFilteredRequests();

        if (resultCount) {
            resultCount.textContent =
                `Hiển thị ${filteredRequests.length} / ${bookingRequests.length} yêu cầu`;
        }

        if (filteredRequests.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="booking-request-empty">
                        <i class="bi bi-calendar-x"></i>
                        Không tìm thấy yêu cầu đặt lịch phù hợp.
                    </td>
                </tr>
            `;

            updateStatistics();
            return;
        }

        tableBody.innerHTML = filteredRequests.map(request => `
            <tr>
                <td>
                    <span class="booking-request-code">
                        ${escapeHTML(request.id)}
                    </span>
                </td>

                <td>
                    <div class="booking-request-customer">
                        <div class="booking-request-avatar">
                            ${escapeHTML(getInitials(request.name))}
                        </div>

                        <div class="booking-request-customer-info">
                            <div class="booking-request-customer-name">
                                ${escapeHTML(request.name)}
                            </div>
                            <div class="booking-request-customer-phone">
                                ${escapeHTML(request.phone)}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="booking-request-department">
                        ${escapeHTML(request.department)}
                    </span>
                </td>

                <td>
                    <span class="booking-request-doctor">
                        ${escapeHTML(request.doctor)}
                    </span>
                </td>

                <td>
                    <div class="booking-request-date">
                        ${escapeHTML(formatDate(request.date))}
                    </div>
                </td>

                <td>
                    <span class="booking-request-time">
                        <i class="bi bi-clock"></i>
                        ${escapeHTML(request.time)}
                    </span>
                </td>

                <td>${getStatusHTML(request.status)}</td>

                <td>
                    <div class="booking-request-actions">
                        <button
                            type="button"
                            class="booking-request-action"
                            data-action="view"
                            data-id="${escapeHTML(request.id)}"
                            title="Xem chi tiết"
                            aria-label="Xem chi tiết">
                            <i class="bi bi-eye"></i>
                        </button>

                        ${request.status === "pending" ? `
                            <button
                                type="button"
                                class="booking-request-action action-confirm"
                                data-action="confirm"
                                data-id="${escapeHTML(request.id)}"
                                title="Xác nhận yêu cầu"
                                aria-label="Xác nhận yêu cầu">
                                <i class="bi bi-check-lg"></i>
                            </button>

                            <button
                                type="button"
                                class="booking-request-action action-reject"
                                data-action="reject"
                                data-id="${escapeHTML(request.id)}"
                                title="Từ chối yêu cầu"
                                aria-label="Từ chối yêu cầu">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        ` : ""}
                    </div>
                </td>
            </tr>
        `).join("");

        updateStatistics();
    }

    function resetRejectMode() {
        rejectionMode = false;

        if (rejectReasonWrap) {
            rejectReasonWrap.hidden = true;
        }

        if (rejectReasonInput) {
            rejectReasonInput.value = "";
        }

        if (rejectButton) {
            rejectButton.innerHTML =
                '<i class="bi bi-x-circle me-1"></i> Từ chối yêu cầu';
        }
    }

    function openRequestDetail(id) {
        const request = bookingRequests.find(item => item.id === id);
        if (!request) return;

        selectedRequestId = id;
        resetRejectMode();

        if (detailCode) detailCode.textContent = request.id;
        if (detailName) detailName.textContent = request.name;
        if (detailPhone) detailPhone.textContent = request.phone;
        if (detailEmail) detailEmail.textContent = request.email || "Chưa cung cấp";
        if (detailDepartment) detailDepartment.textContent = request.department;
        if (detailDoctor) detailDoctor.textContent = request.doctor;
        if (detailDate) detailDate.textContent = formatDate(request.date);
        if (detailTime) detailTime.textContent = request.time;
        if (detailReason) detailReason.textContent = request.reason || "Không có ghi chú.";

        if (detailStatus) {
            detailStatus.innerHTML = getStatusHTML(request.status);
        }

        if (confirmButton) {
            confirmButton.hidden = request.status !== "pending";
        }

        if (rejectButton) {
            rejectButton.hidden = request.status !== "pending";
        }

        if (modal) {
            modal.show();
        }
    }

    function confirmRequest(id) {
        const request = bookingRequests.find(item => item.id === id);
        if (!request || request.status !== "pending") return;

        const accepted = window.confirm(
            `Xác nhận yêu cầu đặt lịch ${request.id} của ${request.name}?`
        );

        if (!accepted) return;

        request.status = "confirmed";

        renderTable();

        if (selectedRequestId === id && modalElement) {
            modal?.hide();
        }

        showToast(`Đã xác nhận yêu cầu ${request.id}.`);
    }

    function rejectRequest(id, reason) {
        const request = bookingRequests.find(item => item.id === id);
        if (!request || request.status !== "pending") return;

        if (!reason.trim()) {
            showToast("Vui lòng nhập lý do từ chối yêu cầu.");
            rejectReasonInput?.focus();
            return;
        }

        const accepted = window.confirm(
            `Bạn có chắc chắn muốn từ chối yêu cầu ${request.id}?`
        );

        if (!accepted) return;

        request.status = "rejected";
        request.rejectionReason = reason.trim();

        renderTable();

        if (selectedRequestId === id && modalElement) {
            modal?.hide();
        }

        showToast(`Đã từ chối yêu cầu ${request.id}.`);
    }

    // Lọc và tìm kiếm.
    searchInput?.addEventListener("input", renderTable);
    departmentFilter?.addEventListener("change", renderTable);
    statusFilter?.addEventListener("change", renderTable);

    // Đặt lại bộ lọc.
    resetButton?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (departmentFilter) departmentFilter.value = "";
        if (statusFilter) statusFilter.value = "";

        renderTable();
    });

    // Làm mới danh sách hiện tại.
    refreshButton?.addEventListener("click", () => {
        renderTable();
        showToast("Danh sách yêu cầu đã được cập nhật.");
    });

    // Các thao tác trên bảng.
    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "view") {
            openRequestDetail(id);
        } else if (action === "confirm") {
            confirmRequest(id);
        } else if (action === "reject") {
            openRequestDetail(id);

            if (rejectReasonWrap) {
                rejectReasonWrap.hidden = false;
            }

            rejectionMode = true;

            if (rejectButton) {
                rejectButton.innerHTML =
                    '<i class="bi bi-check-circle me-1"></i> Xác nhận từ chối';
            }

            rejectReasonInput?.focus();
        }
    });

    // Xác nhận trong cửa sổ chi tiết.
    confirmButton?.addEventListener("click", () => {
        if (selectedRequestId) {
            confirmRequest(selectedRequestId);
        }
    });

    // Bật chế độ từ chối hoặc thực hiện từ chối.
    rejectButton?.addEventListener("click", () => {
        if (!selectedRequestId) return;

        if (!rejectionMode) {
            rejectionMode = true;

            if (rejectReasonWrap) {
                rejectReasonWrap.hidden = false;
            }

            rejectButton.innerHTML =
                '<i class="bi bi-check-circle me-1"></i> Xác nhận từ chối';

            rejectReasonInput?.focus();
            return;
        }

        rejectRequest(
            selectedRequestId,
            rejectReasonInput?.value || ""
        );
    });

    // Trạng thái ban đầu.
    renderTable();
})();
/* =========================================================
   LỊCH SỬ XỬ LÝ - MEDCARE CSKH
========================================================= */
(() => {
    "use strict";

    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("historySearch");
    const typeFilter = document.getElementById("historyTypeFilter");
    const statusFilter = document.getElementById("historyStatusFilter");
    const dateFilter = document.getElementById("historyDateFilter");
    const resetButton = document.getElementById("resetHistoryFilters");
    const refreshButton = document.getElementById("refreshHistoryBtn");
    const exportButton = document.getElementById("exportHistoryBtn");
    const resultCount = document.getElementById("historyResultCount");

    const totalElement = document.getElementById("historyTotal");
    const completedElement = document.getElementById("historyCompletedCount");
    const processingElement = document.getElementById("historyProcessingCount");

    const modalElement = document.getElementById("historyDetailModal");
    const toastElement = document.getElementById("historyToast");
    const toastMessage = document.getElementById("historyToastMessage");

    const detailFields = {
        code: document.getElementById("historyDetailCode"),
        customer: document.getElementById("historyDetailCustomer"),
        phone: document.getElementById("historyDetailPhone"),
        staff: document.getElementById("historyDetailStaff"),
        type: document.getElementById("historyDetailType"),
        time: document.getElementById("historyDetailTime"),
        status: document.getElementById("historyDetailStatus"),
        content: document.getElementById("historyDetailContent"),
        note: document.getElementById("historyDetailNote")
    };

    const modal = modalElement && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(modalElement)
        : null;

    const toast = toastElement && window.bootstrap
        ? bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 2800 })
        : null;

    const typeLabels = {
        conversation: "Hội thoại",
        booking: "Yêu cầu đặt lịch",
        customer: "Khách hàng"
    };

    const statusLabels = {
        completed: "Hoàn tất",
        processing: "Đang xử lý",
        cancelled: "Đã hủy"
    };

    // Dữ liệu khởi tạo cho giao diện.
    // Có thể thay bằng dữ liệu API khi kết nối backend.
    const historyRecords = [
        {
            id: "LS260001",
            customer: "Nguyễn Minh Anh",
            phone: "0901234567",
            type: "conversation",
            content: "Tư vấn thông tin dịch vụ khám tim mạch.",
            staff: "Trần Thu Hương",
            time: "2026-10-21T09:15:00",
            status: "completed",
            note: "Đã cung cấp thông tin dịch vụ và hướng dẫn khách hàng đặt lịch."
        },
        {
            id: "LS260002",
            customer: "Trần Hoàng Long",
            phone: "0912345678",
            type: "booking",
            content: "Xác nhận yêu cầu đặt lịch khám tổng quát.",
            staff: "Nguyễn Thanh Tâm",
            time: "2026-10-21T08:50:00",
            status: "completed",
            note: "Đã xác nhận lịch hẹn với khách hàng."
        },
        {
            id: "LS260003",
            customer: "Lê Thu Hà",
            phone: "0987654321",
            type: "conversation",
            content: "Tiếp nhận câu hỏi về lịch khám da liễu.",
            staff: "Trần Thu Hương",
            time: "2026-10-21T08:30:00",
            status: "processing",
            note: "Đang kiểm tra lịch làm việc của bác sĩ."
        },
        {
            id: "LS260004",
            customer: "Phạm Quốc Bảo",
            phone: "0934567890",
            type: "booking",
            content: "Thông báo điều chỉnh thời gian đặt lịch.",
            staff: "Lê Minh Thư",
            time: "2026-10-20T16:40:00",
            status: "cancelled",
            note: "Khách hàng đã được thông báo về tình trạng khung giờ."
        },
        {
            id: "LS260005",
            customer: "Võ Ngọc Trâm",
            phone: "0961234567",
            type: "customer",
            content: "Cập nhật thông tin liên hệ khách hàng.",
            staff: "Nguyễn Thanh Tâm",
            time: "2026-10-20T15:20:00",
            status: "completed",
            note: "Thông tin liên hệ đã được kiểm tra."
        },
        {
            id: "LS260006",
            customer: "Đặng Thành Đạt",
            phone: "0972345678",
            type: "conversation",
            content: "Hỗ trợ khách hàng tìm hiểu dịch vụ cơ xương khớp.",
            staff: "Lê Minh Thư",
            time: "2026-10-20T14:10:00",
            status: "completed",
            note: "Đã cung cấp thông tin về chuyên khoa."
        },
        {
            id: "LS260007",
            customer: "Nguyễn Ngọc Mai",
            phone: "0907654321",
            type: "booking",
            content: "Tiếp nhận yêu cầu đặt lịch khám nhi khoa.",
            staff: "Trần Thu Hương",
            time: "2026-10-19T10:25:00",
            status: "processing",
            note: "Đang kiểm tra lịch khám phù hợp."
        },
        {
            id: "LS260008",
            customer: "Bùi Gia Hân",
            phone: "0938123456",
            type: "customer",
            content: "Hỗ trợ điều chỉnh thông tin hồ sơ.",
            staff: "Nguyễn Thanh Tâm",
            time: "2026-10-18T11:00:00",
            status: "completed",
            note: "Đã hỗ trợ khách hàng kiểm tra thông tin."
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getInitials(name) {
        return String(name || "")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function formatDateTime(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    function showToast(message) {
        if (toastMessage) {
            toastMessage.textContent = message;
        }

        if (toast) {
            toast.show();
        } else {
            window.alert(message);
        }
    }

    function getFilteredRecords() {
        const keyword = (searchInput?.value || "").trim().toLowerCase();
        const type = typeFilter?.value || "";
        const status = statusFilter?.value || "";
        const date = dateFilter?.value || "";

        return historyRecords
            .filter(record => {
                const searchableText = [
                    record.id,
                    record.customer,
                    record.phone,
                    record.staff,
                    record.content,
                    record.note,
                    typeLabels[record.type],
                    statusLabels[record.status]
                ].join(" ").toLowerCase();

                const recordDate = record.time.slice(0, 10);

                return (!keyword || searchableText.includes(keyword))
                    && (!type || record.type === type)
                    && (!status || record.status === status)
                    && (!date || recordDate === date);
            })
            .sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    function updateStatistics() {
        if (totalElement) {
            totalElement.textContent = historyRecords.length;
        }

        if (completedElement) {
            completedElement.textContent = historyRecords.filter(
                record => record.status === "completed"
            ).length;
        }

        if (processingElement) {
            processingElement.textContent = historyRecords.filter(
                record => record.status === "processing"
            ).length;
        }
    }

    function renderTable() {
        const records = getFilteredRecords();

        if (resultCount) {
            resultCount.textContent =
                `Hiển thị ${records.length} / ${historyRecords.length} hoạt động`;
        }

        if (records.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="history-empty">
                        <i class="bi bi-clock-history"></i>
                        Không tìm thấy hoạt động phù hợp.
                    </td>
                </tr>
            `;

            updateStatistics();
            return;
        }

        tableBody.innerHTML = records.map(record => {
            const typeIcon = {
                conversation: "bi-chat-dots",
                booking: "bi-calendar-check",
                customer: "bi-person"
            }[record.type] || "bi-clock-history";

            return `
                <tr>
                    <td>
                        <span class="history-code">
                            ${escapeHTML(record.id)}
                        </span>
                    </td>

                    <td>
                        <div class="history-customer">
                            <div class="history-avatar">
                                ${escapeHTML(getInitials(record.customer))}
                            </div>
                            <div class="history-customer-info">
                                <span class="history-customer-name">
                                    ${escapeHTML(record.customer)}
                                </span>
                                <span class="history-customer-phone">
                                    ${escapeHTML(record.phone)}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="history-type type-${escapeHTML(record.type)}">
                            <i class="bi ${typeIcon}"></i>
                            ${escapeHTML(typeLabels[record.type])}
                        </span>
                    </td>

                    <td>
                        <span class="history-description"
                              title="${escapeHTML(record.content)}">
                            ${escapeHTML(record.content)}
                        </span>
                    </td>

                    <td>
                        <span class="history-staff">
                            ${escapeHTML(record.staff)}
                        </span>
                    </td>

                    <td>
                        <span class="history-time">
                            ${escapeHTML(formatDateTime(record.time))}
                        </span>
                    </td>

                    <td>
                        <span class="history-result result-${escapeHTML(record.status)}">
                            ${escapeHTML(statusLabels[record.status])}
                        </span>
                    </td>

                    <td>
                        <button type="button"
                                class="history-action"
                                data-history-detail="${escapeHTML(record.id)}"
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        updateStatistics();
    }

    function openDetail(id) {
        const record = historyRecords.find(item => item.id === id);
        if (!record) return;

        const values = {
            code: record.id,
            customer: record.customer,
            phone: record.phone,
            staff: record.staff,
            type: typeLabels[record.type] || "Khác",
            time: formatDateTime(record.time),
            status: statusLabels[record.status] || "Không xác định",
            content: record.content,
            note: record.note || "Không có ghi chú."
        };

        Object.entries(values).forEach(([key, value]) => {
            const element = detailFields[key];

            if (element) {
                element.textContent = value;
            }
        });

        if (modal) {
            modal.show();
            return;
        }

        window.alert(
            `Mã hoạt động: ${record.id}\n` +
            `Khách hàng: ${record.customer}\n` +
            `Số điện thoại: ${record.phone}\n` +
            `Nhân viên: ${record.staff}\n` +
            `Loại hoạt động: ${typeLabels[record.type]}\n` +
            `Thời gian: ${formatDateTime(record.time)}\n` +
            `Kết quả: ${statusLabels[record.status]}\n` +
            `Nội dung: ${record.content}\n` +
            `Ghi chú: ${record.note}`
        );
    }

    function exportCSV() {
        const records = getFilteredRecords();

        if (records.length === 0) {
            showToast("Không có dữ liệu để xuất.");
            return;
        }

        const headers = [
            "Mã hoạt động",
            "Khách hàng",
            "Số điện thoại",
            "Loại hoạt động",
            "Nội dung xử lý",
            "Nhân viên",
            "Thời gian",
            "Kết quả",
            "Ghi chú"
        ];

        const rows = records.map(record => [
            record.id,
            record.customer,
            record.phone,
            typeLabels[record.type],
            record.content,
            record.staff,
            formatDateTime(record.time),
            statusLabels[record.status],
            record.note
        ]);

        function escapeCSV(value) {
            let text = String(value ?? "");

            // Ngăn nội dung bắt đầu bằng ký tự công thức trong Excel.
            if (/^[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return `"${text.replace(/"/g, '""')}"`;
        }

        const csv = "\uFEFF" + [headers, ...rows]
            .map(row => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "lich-su-xu-ly.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showToast("Đã xuất báo cáo lịch sử xử lý.");
    }

    // Tìm kiếm và lọc.
    searchInput?.addEventListener("input", renderTable);
    typeFilter?.addEventListener("change", renderTable);
    statusFilter?.addEventListener("change", renderTable);
    dateFilter?.addEventListener("change", renderTable);

    // Đặt lại điều kiện tìm kiếm.
    resetButton?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "";
        if (statusFilter) statusFilter.value = "";
        if (dateFilter) dateFilter.value = "";

        renderTable();
    });

    // Làm mới danh sách đang hiển thị.
    refreshButton?.addEventListener("click", () => {
        renderTable();
        showToast("Danh sách lịch sử đã được làm mới.");
    });

    // Xuất dữ liệu theo bộ lọc hiện tại.
    exportButton?.addEventListener("click", exportCSV);

    // Xem chi tiết hoạt động.
    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-history-detail]");
        if (!button) return;

        openDetail(button.dataset.historyDetail);
    });

    renderTable();
})();

/* =========================================================
   QUẢN LÝ MẪU TIN NHẮN - MEDCARE CSKH
   Chèn module này bên trong DOMContentLoaded hiện có.
   ========================================================= */

(() => {
    "use strict";

    const page = document.querySelector(".template-management");

    // Chỉ chạy trên trang quản lý mẫu tin nhắn.
    if (!page || page.dataset.templateInitialized === "true") {
        return;
    }

    page.dataset.templateInitialized = "true";

    const $ = (selector) => page.querySelector(selector);
    const byId = (id) => document.getElementById(id);

    const elements = {
        total: byId("templateTotal"),
        active: byId("templateActive"),
        booking: byId("templateBooking"),
        support: byId("templateSupport"),

        search: byId("templateSearch"),
        categoryFilter: byId("templateCategoryFilter"),
        channelFilter: byId("templateChannelFilter"),
        statusFilter: byId("templateStatusFilter"),
        resetFilters: byId("resetTemplateFilters"),
        refresh: byId("refreshTemplatesBtn"),

        tableBody: byId("templateTableBody"),
        resultCount: byId("templateResultCount"),
        addButton: byId("addTemplateBtn"),

        modal: byId("templateModal"),
        form: byId("templateForm"),
        modalTitle: byId("templateModalTitle"),
        id: byId("templateId"),
        name: byId("templateName"),
        category: byId("templateCategory"),
        channel: byId("templateChannel"),
        status: byId("templateStatus"),
        content: byId("templateContent"),
        characterCount: byId("templateCharacterCount"),
        saveButton: byId("saveTemplateBtn"),

        previewModal: byId("templatePreviewModal"),
        previewMeta: byId("templatePreviewMeta"),
        previewName: byId("templatePreviewName"),
        previewContent: byId("templatePreviewContent"),
        copyButton: byId("copyTemplateBtn"),

        toast: byId("templateToast"),
        toastMessage: byId("templateToastMessage")
    };

    // Kiểm tra HTML có đủ các phần tử quan trọng.
    if (
        !elements.tableBody ||
        !elements.form ||
        !elements.modal ||
        !elements.previewModal
    ) {
        console.error(
            "MedCare: Không tìm thấy đầy đủ các phần tử HTML của trang mẫu tin nhắn."
        );
        return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(elements.modal);
    const previewModal = bootstrap.Modal.getOrCreateInstance(
        elements.previewModal
    );

    const toast = elements.toast
        ? bootstrap.Toast.getOrCreateInstance(elements.toast, {
            delay: 2800
        })
        : null;

    const STORAGE_KEY = "medcare_cskh_message_templates_v1";

    const initialTemplates = [
        {
            id: "MT001",
            name: "Xác nhận tiếp nhận yêu cầu",
            category: "Đặt lịch",
            channel: "Chat",
            status: "active",
            content: "Xin chào {{ten_khach_hang}}, MedCare đã tiếp nhận yêu cầu đặt lịch khám của bạn. Nhân viên sẽ kiểm tra thông tin và phản hồi trong thời gian sớm nhất."
        },
        {
            id: "MT002",
            name: "Xác nhận lịch khám",
            category: "Đặt lịch",
            channel: "SMS",
            status: "active",
            content: "MedCare xin xác nhận lịch khám của bạn vào ngày {{ngay_kham}}, lúc {{gio_kham}}. Vui lòng đến trước giờ hẹn 15 phút. Cảm ơn bạn đã lựa chọn MedCare."
        },
        {
            id: "MT003",
            name: "Nhắc lịch khám",
            category: "Nhắc lịch",
            channel: "SMS",
            status: "active",
            content: "MedCare nhắc bạn có lịch khám vào {{ngay_kham}} lúc {{gio_kham}}. Địa điểm: {{dia_diem}}. Nếu cần hỗ trợ thay đổi lịch, vui lòng liên hệ với chúng tôi."
        },
        {
            id: "MT004",
            name: "Hướng dẫn chuẩn bị khám",
            category: "Tư vấn",
            channel: "Chat",
            status: "active",
            content: "Chào {{ten_khach_hang}}, để buổi khám diễn ra thuận lợi, bạn vui lòng mang theo giấy tờ tùy thân, thẻ bảo hiểm y tế nếu có và các kết quả khám trước đây liên quan đến tình trạng sức khỏe."
        },
        {
            id: "MT005",
            name: "Thông báo thay đổi lịch",
            category: "Đặt lịch",
            channel: "Email",
            status: "active",
            content: "Kính gửi {{ten_khach_hang}}, MedCare xin thông báo lịch khám của bạn có sự thay đổi. Lịch mới: {{ngay_kham_moi}}, {{gio_kham_moi}}. Vui lòng phản hồi nếu thời gian này chưa phù hợp."
        },
        {
            id: "MT006",
            name: "Hướng dẫn thanh toán",
            category: "Thanh toán",
            channel: "Chat",
            status: "active",
            content: "MedCare xin thông tin về khoản thanh toán của bạn. Vui lòng kiểm tra thông tin tại quầy tiếp nhận hoặc liên hệ nhân viên hỗ trợ để được hướng dẫn chi tiết."
        },
        {
            id: "MT007",
            name: "Tiếp nhận phản hồi khách hàng",
            category: "Tư vấn",
            channel: "Email",
            status: "active",
            content: "Kính gửi {{ten_khach_hang}}, cảm ơn bạn đã gửi phản hồi đến MedCare. Chúng tôi đã ghi nhận ý kiến và sẽ chuyển đến bộ phận phụ trách để kiểm tra, xử lý."
        },
        {
            id: "MT008",
            name: "Thông báo yêu cầu đã xử lý",
            category: "Khác",
            channel: "Chat",
            status: "inactive",
            content: "Xin chào {{ten_khach_hang}}, yêu cầu hỗ trợ của bạn đã được xử lý. Nếu cần thêm thông tin, vui lòng phản hồi tin nhắn này để được hỗ trợ."
        }
    ];

    let templates = loadTemplates();
    let currentPreviewId = null;

    function loadTemplates() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed.filter(isValidTemplate);
                }
            }
        } catch (error) {
            console.warn(
                "MedCare: Không thể đọc dữ liệu mẫu tin nhắn đã lưu.",
                error
            );
        }

        return initialTemplates.map((item) => ({ ...item }));
    }

    function isValidTemplate(item) {
        return (
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.category === "string" &&
            typeof item.channel === "string" &&
            typeof item.content === "string" &&
            ["active", "inactive"].includes(item.status)
        );
    }

    function saveTemplates() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return true;
        } catch (error) {
            console.error(
                "MedCare: Không thể lưu mẫu tin nhắn vào trình duyệt.",
                error
            );

            showToast(
                "Không thể lưu dữ liệu. Vui lòng kiểm tra bộ nhớ trình duyệt."
            );

            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function showToast(message) {
        if (!elements.toast || !elements.toastMessage || !toast) {
            window.alert(message);
            return;
        }

        elements.toastMessage.textContent = message;
        toast.show();
    }

    function getNextId() {
        const maxNumber = templates.reduce((max, item) => {
            const match = item.id.match(/^MT(\d+)$/);

            return match
                ? Math.max(max, Number(match[1]))
                : max;
        }, 0);

        return `MT${String(maxNumber + 1).padStart(3, "0")}`;
    }

    function updateStatistics() {
        if (elements.total) {
            elements.total.textContent = templates.length;
        }

        if (elements.active) {
            elements.active.textContent = templates.filter(
                (item) => item.status === "active"
            ).length;
        }

        if (elements.booking) {
            elements.booking.textContent = templates.filter(
                (item) => item.category === "Đặt lịch"
            ).length;
        }

        if (elements.support) {
            elements.support.textContent = templates.filter(
                (item) => item.category === "Tư vấn"
            ).length;
        }
    }

    function getFilteredTemplates() {
        const keyword = (elements.search?.value || "")
            .trim()
            .toLocaleLowerCase("vi");

        const category = elements.categoryFilter?.value || "";
        const channel = elements.channelFilter?.value || "";
        const status = elements.statusFilter?.value || "";

        return templates.filter((item) => {
            const matchesKeyword =
                !keyword ||
                item.id.toLocaleLowerCase("vi").includes(keyword) ||
                item.name.toLocaleLowerCase("vi").includes(keyword) ||
                item.content.toLocaleLowerCase("vi").includes(keyword);

            const matchesCategory =
                !category || item.category === category;

            const matchesChannel =
                !channel || item.channel === channel;

            const matchesStatus =
                !status || item.status === status;

            return (
                matchesKeyword &&
                matchesCategory &&
                matchesChannel &&
                matchesStatus
            );
        });
    }

    function renderTable() {
        const filteredTemplates = getFilteredTemplates();

        if (filteredTemplates.length === 0) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="template-empty">
                        <i class="bi bi-chat-square-text"></i>
                        <span>Không tìm thấy mẫu tin nhắn phù hợp.</span>
                    </td>
                </tr>
            `;
        } else {
            elements.tableBody.innerHTML = filteredTemplates.map((item) => {
                const statusClass =
                    item.status === "active"
                        ? "status-active"
                        : "status-inactive";

                const statusText =
                    item.status === "active"
                        ? "Đang sử dụng"
                        : "Ngừng sử dụng";

                return `
                    <tr>
                        <td class="template-name-cell">
                            <span class="template-code">
                                ${escapeHTML(item.id)}
                            </span>
                            <span class="template-name">
                                ${escapeHTML(item.name)}
                            </span>
                        </td>

                        <td>
                            <span class="template-category-badge">
                                ${escapeHTML(item.category)}
                            </span>
                        </td>

                        <td>
                            <span class="template-channel-badge">
                                ${escapeHTML(item.channel)}
                            </span>
                        </td>

                        <td class="template-content-cell">
                            <span class="template-content-text">
                                ${escapeHTML(item.content)}
                            </span>
                        </td>

                        <td>
                            <span class="template-status-badge ${statusClass}">
                                <i class="bi ${
                                    item.status === "active"
                                        ? "bi-check-circle-fill"
                                        : "bi-pause-circle"
                                }"></i>
                                ${statusText}
                            </span>
                        </td>

                        <td>
                            <div class="template-actions">
                                <button
                                    type="button"
                                    class="template-action-btn"
                                    data-action="preview"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Xem trước"
                                    aria-label="Xem trước ${escapeHTML(item.name)}">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="template-action-btn"
                                    data-action="edit"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa ${escapeHTML(item.name)}">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button
                                    type="button"
                                    class="template-action-btn action-delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(item.id)}"
                                    title="Xóa mẫu"
                                    aria-label="Xóa ${escapeHTML(item.name)}">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        if (elements.resultCount) {
            const count = filteredTemplates.length;
            const total = templates.length;

            elements.resultCount.textContent =
                `Hiển thị ${count} / ${total} mẫu tin nhắn`;
        }

        updateStatistics();
    }

    function resetForm() {
        elements.form.reset();

        elements.id.value = "";
        elements.status.value = "active";
        elements.category.value = "Đặt lịch";
        elements.channel.value = "Chat";

        updateCharacterCount();
    }

    function updateCharacterCount() {
        if (!elements.content || !elements.characterCount) {
            return;
        }

        const maxLength = Number(elements.content.maxLength) || 2000;

        elements.characterCount.textContent =
            `${elements.content.value.length}/${maxLength} ký tự`;
    }

    function openAddModal() {
        resetForm();

        elements.modalTitle.textContent = "Thêm mẫu tin nhắn";
        elements.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu mẫu tin nhắn';

        modal.show();
    }

    function openEditModal(id) {
        const item = templates.find((template) => template.id === id);

        if (!item) {
            showToast("Không tìm thấy mẫu tin nhắn cần chỉnh sửa.");
            return;
        }

        resetForm();

        elements.id.value = item.id;
        elements.name.value = item.name;
        elements.category.value = item.category;
        elements.channel.value = item.channel;
        elements.status.value = item.status;
        elements.content.value = item.content;

        updateCharacterCount();

        elements.modalTitle.textContent = "Chỉnh sửa mẫu tin nhắn";
        elements.saveButton.innerHTML =
            '<i class="bi bi-check-lg"></i> Lưu thay đổi';

        modal.show();
    }

    function openPreview(id) {
        const item = templates.find((template) => template.id === id);

        if (!item) {
            showToast("Không tìm thấy mẫu tin nhắn.");
            return;
        }

        currentPreviewId = item.id;

        const statusText =
            item.status === "active"
                ? "Đang sử dụng"
                : "Ngừng sử dụng";

        elements.previewMeta.textContent =
            `${item.id} · ${item.category} · ${item.channel} · ${statusText}`;

        elements.previewName.textContent = item.name;
        elements.previewContent.textContent = item.content;

        previewModal.show();
    }

    function deleteTemplate(id) {
        const item = templates.find((template) => template.id === id);

        if (!item) {
            showToast("Không tìm thấy mẫu tin nhắn cần xóa.");
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa mẫu "${item.name}" không?`
        );

        if (!confirmed) {
            return;
        }

        const oldTemplates = templates;
        templates = templates.filter((template) => template.id !== id);

        if (!saveTemplates()) {
            templates = oldTemplates;
            return;
        }

        renderTable();
        showToast("Đã xóa mẫu tin nhắn.");
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!elements.form.reportValidity()) {
            return;
        }

        const id = elements.id.value.trim();
        const name = elements.name.value.trim();
        const content = elements.content.value.trim();

        if (!name || !content) {
            showToast("Vui lòng nhập đầy đủ tên và nội dung mẫu.");
            return;
        }

        const duplicateName = templates.some((item) => {
            return (
                item.name.toLocaleLowerCase("vi") ===
                    name.toLocaleLowerCase("vi") &&
                item.id !== id
            );
        });

        if (duplicateName) {
            elements.name.setCustomValidity(
                "Tên mẫu tin nhắn này đã tồn tại."
            );
            elements.name.reportValidity();
            elements.name.setCustomValidity("");
            return;
        }

        const isEditing = Boolean(id);

        const newTemplate = {
            id: id || getNextId(),
            name,
            category: elements.category.value,
            channel: elements.channel.value,
            status: elements.status.value,
            content
        };

        const oldTemplates = templates;

        if (isEditing) {
            const index = templates.findIndex((item) => item.id === id);

            if (index === -1) {
                showToast("Mẫu tin nhắn không còn tồn tại.");
                return;
            }

            templates = templates.map((item) =>
                item.id === id ? newTemplate : item
            );
        } else {
            templates = [newTemplate, ...templates];
        }

        if (!saveTemplates()) {
            templates = oldTemplates;
            return;
        }

        renderTable();
        modal.hide();

        showToast(
            isEditing
                ? "Đã cập nhật mẫu tin nhắn."
                : "Đã thêm mẫu tin nhắn mới."
        );
    }

    async function copyPreviewContent() {
        const item = templates.find(
            (template) => template.id === currentPreviewId
        );

        if (!item) {
            showToast("Không tìm thấy nội dung cần sao chép.");
            return;
        }

        try {
            await navigator.clipboard.writeText(item.content);
            showToast("Đã sao chép nội dung mẫu tin nhắn.");
        } catch (error) {
            // Hỗ trợ khi Clipboard API không khả dụng.
            const temporaryTextarea = document.createElement("textarea");

            temporaryTextarea.value = item.content;
            temporaryTextarea.setAttribute("readonly", "");
            temporaryTextarea.style.position = "fixed";
            temporaryTextarea.style.opacity = "0";

            document.body.appendChild(temporaryTextarea);
            temporaryTextarea.select();

            let copied = false;

            try {
                copied = document.execCommand("copy");
            } catch (copyError) {
                copied = false;
            }

            temporaryTextarea.remove();

            if (copied) {
                showToast("Đã sao chép nội dung mẫu tin nhắn.");
            } else {
                showToast(
                    "Không thể sao chép tự động. Vui lòng thử lại trên trang đang chạy bằng localhost."
                );
            }
        }
    }

    function resetFilters() {
        if (elements.search) {
            elements.search.value = "";
        }

        if (elements.categoryFilter) {
            elements.categoryFilter.value = "";
        }

        if (elements.channelFilter) {
            elements.channelFilter.value = "";
        }

        if (elements.statusFilter) {
            elements.statusFilter.value = "";
        }

        renderTable();
    }

    // Tìm kiếm và lọc.
    elements.search?.addEventListener("input", renderTable);
    elements.categoryFilter?.addEventListener("change", renderTable);
    elements.channelFilter?.addEventListener("change", renderTable);
    elements.statusFilter?.addEventListener("change", renderTable);

    elements.resetFilters?.addEventListener("click", resetFilters);

    elements.refresh?.addEventListener("click", () => {
        renderTable();
        showToast("Đã cập nhật danh sách mẫu tin nhắn.");
    });

    // Thêm mới.
    elements.addButton?.addEventListener("click", openAddModal);

    // Lưu mẫu.
    elements.form.addEventListener("submit", handleSubmit);

    // Đếm ký tự nội dung.
    elements.content?.addEventListener("input", updateCharacterCount);

    // Xử lý các nút thao tác trong bảng.
    elements.tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const id = button.dataset.id;

        if (!id) {
            return;
        }

        switch (action) {
            case "preview":
                openPreview(id);
                break;

            case "edit":
                openEditModal(id);
                break;

            case "delete":
                deleteTemplate(id);
                break;

            default:
                break;
        }
    });

    // Sao chép nội dung trong modal xem trước.
    elements.copyButton?.addEventListener("click", copyPreviewContent);

    // Dọn trạng thái modal khi đóng.
    elements.modal.addEventListener("hidden.bs.modal", resetForm);

    // Hiển thị dữ liệu lần đầu.
    renderTable();
    updateCharacterCount();

})();
