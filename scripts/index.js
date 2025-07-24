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
        card.addEventListener("click", () => displayCourseDetails(course));
        coursesContainer.appendChild(card);
        totalCredits += course.credits;
    });

    creditTotalEl.textContent = totalCredits;
}

displayCourses(courses);

function displayCourses(courseList) {
    coursesContainer.innerHTML = "";
    let totalCredits = 0;

    courseList.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        if (course.completed) card.classList.add("completed");

        // Show only the course code
        card.innerHTML = `<h3>${course.code}</h3>`;

        // Add click to show modal
        card.addEventListener("click", () => displayCourseDetails(course));

        coursesContainer.appendChild(card);
        totalCredits += course.credits;
    });

    creditTotalEl.textContent = totalCredits;
}

// Show modal with course details
const courseDetails = document.getElementById("course-details");

function displayCourseDetails(course) {
    courseDetails.innerHTML = `
        <button id="closeModal">❌</button>
        <h2>${course.code}</h2>
        <h3>${course.name}</h3>
        <p><strong>Credits</strong>: ${course.credits}</p>
        <p><strong>Certificate</strong>: ${course.completed ? "Yes" : "No"}</p>
        <p>This course is part of the Web & Computer Programming Certificate.</p>
        <p><strong>Technologies</strong>: HTML, CSS, JavaScript</p>
    `;
    courseDetails.showModal();

    const closeModal = document.getElementById("closeModal");
    closeModal.addEventListener("click", () => courseDetails.close());

    courseDetails.addEventListener("click", (e) => {
        const rect = courseDetails.getBoundingClientRect();
        if (
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom
        ) {
            courseDetails.close();
        }
    });
}

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