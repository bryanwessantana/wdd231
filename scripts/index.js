const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu").querySelector("ul");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
});

const currentYear = new Date().getFullYear();
document.getElementById("currentYear").textContent = currentYear;

document.getElementById("lastModified").textContent = `Last Modified: ${document.lastModified}`;

const courses = [
    { code: "WDD130", name: "Web Fundamentals", credits: 2, completed: true },
    { code: "WDD131", name: "Dynamic Web Fundamentals", credits: 2, completed: true },
    { code: "CSE110", name: "Programming Building Blocks", credits: 2, completed: true },
    { code: "CSE111", name: "Programming with Functions", credits: 2, completed: false },
    { code: "CSE210", name: "Programming with Classes", credits: 2, completed: false },
    { code: "CSE310", name: "Data Structures & Algorithms", credits: 2, completed: false },
    { code: "WDD231", name: "Front-End Web Development I", credits: 2, completed: false }
];

const coursesContainer = document.getElementById("coursesContainer");
const creditTotalEl = document.getElementById("creditTotal");

document.getElementById("allBtn").addEventListener("click", () => {
    displayCourses(courses);
});

document.getElementById("wddBtn").addEventListener("click", () => {
    const filtered = courses.filter(course => course.code.startsWith("WDD"));
    displayCourses(filtered);
});

document.getElementById("cseBtn").addEventListener("click", () => {
    const filtered = courses.filter(course => course.code.startsWith("CSE"));
    displayCourses(filtered);
});

function displayCourses(courseList) {
    coursesContainer.innerHTML = "";
    let totalCredits = 0;

    courseList.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        if (course.completed) card.classList.add("completed");
        card.innerHTML = `<h3>${course.code}</h3><p>${course.name}</p><p>Credits: ${course.credits}</p>`;
        coursesContainer.appendChild(card);
        totalCredits += course.credits;
    });

    creditTotalEl.textContent = totalCredits;
}

displayCourses(courses);

document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.querySelector('footer .social-links');

    if (footerContainer) {
        footerContainer.innerHTML = `
            <a href="https://github.com/bryanwessantana" target="_blank" rel="noopener">
                <i class="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/bryansantana/" target="_blank" rel="noopener">
                <i class="fab fa-linkedin"></i>
            </a>
            <a href="https://www.instagram.com/bryan._santana/" target="_blank" rel="noopener">
                <i class="fab fa-instagram"></i>
            </a>
        `;
    }
});