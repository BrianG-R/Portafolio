document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressBar = createScrollProgress();
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("is-nav-open", !isOpen);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
        document.body.classList.remove("is-nav-open");
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min((index % 5) * 70, 280)}ms`);
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const imageModal = document.getElementById("imgModal");
  const imageInModal = document.getElementById("imgInModal");

  if (imageModal && imageInModal) {
    const closeButton = imageModal.querySelector(".modal-close");

    document.querySelectorAll("[data-modal-image]").forEach((button) => {
      button.addEventListener("click", () => {
        imageInModal.src = button.dataset.modalImage;
        imageInModal.alt = button.dataset.modalAlt || "Imagen ampliada";
        openModal(imageModal, closeButton);
      });
    });

    bindModalClose(imageModal, closeButton, () => {
      imageInModal.removeAttribute("src");
      imageInModal.alt = "";
    });
  }

  const videoModal = document.getElementById("videoModal");

  if (videoModal) {
    const video = videoModal.querySelector("video");
    const source = video ? video.querySelector("source") : null;
    const closeButton = videoModal.querySelector(".modal-close");

    if (video && source) {
      document.querySelectorAll("[data-modal-video]").forEach((button) => {
        button.addEventListener("click", () => {
          source.src = button.dataset.modalVideo;
          video.load();
          openModal(videoModal, closeButton);
          video.play().catch(() => {});
        });
      });

      bindModalClose(videoModal, closeButton, () => {
        video.pause();
        source.removeAttribute("src");
        video.load();
      });
    }
  }

  if (!prefersReducedMotion) {
    bindSpotlightCards();
    updateScrollProgress(progressBar);

    window.addEventListener(
      "scroll",
      () => {
        document.body.style.backgroundPosition = `center ${window.scrollY * 0.18}px`;
        updateScrollProgress(progressBar);
      },
      { passive: true }
    );
  } else if (progressBar) {
    progressBar.remove();
  }
});

function createScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.prepend(progressBar);
  return progressBar;
}

function updateScrollProgress(progressBar) {
  if (!progressBar) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

function bindSpotlightCards() {
  const spotlightItems = document.querySelectorAll(
    ".project-card, .skill-card, .profile-panel, .detail-card, .contact-panel, .hero-meta div, .project-facts div"
  );

  spotlightItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      item.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      item.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    });
  });
}

function openModal(modal, closeButton) {
  modal.classList.add("show");
  document.body.classList.add("is-nav-open");

  if (closeButton) {
    closeButton.focus();
  }
}

function closeModal(modal, afterClose) {
  modal.classList.remove("show");
  document.body.classList.remove("is-nav-open");

  if (typeof afterClose === "function") {
    afterClose();
  }
}

function bindModalClose(modal, closeButton, afterClose) {
  if (closeButton) {
    closeButton.addEventListener("click", () => closeModal(modal, afterClose));
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal, afterClose);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal(modal, afterClose);
    }
  });
}
