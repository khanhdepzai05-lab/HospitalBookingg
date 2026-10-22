
document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const sidebarLinks = document.querySelectorAll(".sidebar .side-link");

    sidebarLinks.forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("../")) {
            return;
        }

        const targetPage = href.split("/").pop().toLowerCase();

        if (targetPage === currentPage) {
            sidebarLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");
        }
    });
});
