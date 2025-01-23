document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("modal");
    const modalWorks = document.getElementById("modal-works");
    const modalEdit = document.getElementById("modal-edit");
    const closeModalButtons = document.querySelectorAll(".modal-close, #button, #arrow-return");
    const returnModal = document.getElementById("arrow-return");
    const openModalButton = document.getElementById("edit-button");
    const addPhotoBtn = document.getElementById("modal-edit-add");
    const thumbnailGallery = document.querySelector(".modal-content");
    const form = document.querySelector(".modal-content-new-category-title");
    const fileInput = document.getElementById("form-image");
    const titleInput = document.getElementById("form-title");
    const photoPreview = document.getElementById("photo-preview");
    const categorySelect = document.getElementById("form-category");
    const submitButton = document.getElementById("submit-new-work");
    const token = localStorage.getItem("authToken");

    // Function to show the modal
    function showModal() {
        modalOverlay.classList.remove("hide");
        modalOverlay.style.display = "flex";
        modalWorks.classList.remove("hide");
        modalEdit.style.display = "hide";
        loadThumbnails();
        loadCategories();
    }

    // Function to hide the modal
    function hideModal() {
        modalOverlay.classList.add("hide");
        modalOverlay.style.display = "none";
        modalWorks.classList.add("hide");
        modalEdit.classList.add("hide");
    }

    // Open the modal
    if (openModalButton) {
        openModalButton.addEventListener("click", showModal);
    } else {
        console.error("Open modal button not found");
    }

    // Close the modal
    closeModalButtons.forEach(button => {
        button.addEventListener("click", hideModal);
    });

    // Switch to the add photo modal
    addPhotoBtn.addEventListener("click", () => {
        modalWorks.classList.add("hide");
        modalEdit.classList.remove("hide");
    });

    returnModal.addEventListener("click", showModal);

    // Load categories into the add form
    async function loadCategories() {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const categories = await response.json();
            categorySelect.innerHTML = ""; // Clear previous categories
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }

    // Load thumbnails into the modal
    async function loadThumbnails() {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const works = await response.json();
            thumbnailGallery.innerHTML = ""; // Clear previous gallery
            works.forEach(work => {
                const workContainer = document.createElement("div");
                workContainer.className = "work-container";
                workContainer.setAttribute('data-id', work.id); // Add data-id attribute
                const img = document.createElement("img");
                img.src = work.imageUrl;
                img.alt = work.title;
                img.classList.add("thumbnail");
                const trashDiv = document.createElement("div");
                trashDiv.className = "trash-div";
                const trashCan = document.createElement("i");
                trashCan.classList.add("fa-solid", "fa-trash-can");
                trashCan.addEventListener("click", () => {
                    deleteWork(work.id); // Direct deletion without confirmation
                });
                thumbnailGallery.appendChild(workContainer);
                workContainer.appendChild(img);
                workContainer.appendChild(trashDiv);
                trashDiv.appendChild(trashCan);
            });
        } catch (error) {
            console.error("Error loading thumbnails:", error);
        }
    }
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const imageFile = fileInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        if (!imageFile || !title || !category) {
            alert("Veuillez remplir tous les champs !");
            return;
        }
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("title", title);
        formData.append("category", category);
        fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                const newWork = {
                    id: data.id,
                    imageUrl: URL.createObjectURL(imageFile),
                    title: title
                };
                displayWorks(null, newWork); // Call displayWorks with the new work
                form.reset();
                photoPreview.innerHTML = "";
                hideModal(); // Close the modal after adding the image
            } else {
                console.error("Error adding photo.");
            }
        })
        .catch(error => console.error("Error:", error));
    });
    
    function updateSubmitButtonState() {
        const imageFile = fileInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        if (imageFile && title && category) {
            submitButton.style.backgroundColor = "#1D6154";
            submitButton.disabled = false;
        } else {
            submitButton.style.backgroundColor = "grey";
            submitButton.disabled = true;
            if (!imageFile || !title || !category) {
                alert("Veuillez remplir tous les champs !");
            }
        }
    }
    
    fileInput.addEventListener("change", updateSubmitButtonState);
    titleInput.addEventListener("input", updateSubmitButtonState);
    categorySelect.addEventListener("change", updateSubmitButtonState);
    
    // Initial check
    updateSubmitButtonState();
    

    function deleteWork(id) {
        fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove the element from the gallery and modal without closing the modal
                document.querySelectorAll(`[data-id='${id}']`).forEach(element => {
                    element.remove();
                });
            } else {
                console.error("Error deleting image.");
            }
        });
    }

    let img = document.createElement('img');
    let file;

    // Event for the "new-image" label
    document.getElementById("new-image").addEventListener("click", function() {
        document.getElementById("form-image").click();
    });

    // Event for the file input
    document.getElementById("form-image").addEventListener("change", function (event) {
        file = event.target.files[0]; // Assign the file to a global variable
        if (file && (file.type === "image/jpg" || file.type === "image/png" || file.type === "image/jpeg")) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                img.alt = "Uploaded Photo";
                document.getElementById("photo-preview").appendChild(img);
            };
            reader.readAsDataURL(file);
            // Hide HTML elements with the "new-image" class.
            document.querySelectorAll(".new-image").forEach(e => e.style.display = "none");
        } else {
            alert("Please select an image in JPG or PNG format.");
        }
    });

    // Function to update the submit button state
    function updateSubmitButtonState() {
        if (fileInput.files.length > 0 && titleInput.value.trim() !== "" && categorySelect.value !== "") {
            submitButton.style.backgroundColor = "#1D6154";
            submitButton.disabled = false;
        } else {
            submitButton.style.backgroundColor = "grey";
            submitButton.disabled = true;
        }
    }

    fileInput.addEventListener("change", updateSubmitButtonState);
    titleInput.addEventListener("input", updateSubmitButtonState);
    categorySelect.addEventListener("change", updateSubmitButtonState);

    // Initial check
    updateSubmitButtonState();
});
