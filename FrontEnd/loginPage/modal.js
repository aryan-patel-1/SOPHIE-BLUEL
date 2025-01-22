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
    const token = localStorage.getItem("authToken");

    // Fonction pour afficher la modale 
    function showModal() {
        modalOverlay.classList.remove("hide");
        modalOverlay.style.display = "flex";
        modalWorks.classList.remove("hide");
        modalEdit.style.display = "hide";
        loadThumbnails();
        loadCategories();
    }

    // Fonction pour cacher la modale 
    function hideModal() {
        modalOverlay.classList.add("hide");
        modalOverlay.style.display = "none";
        modalWorks.classList.add("hide");
        modalEdit.classList.add("hide");
       
        
    }

    // Ouvrir la modale 
    if (openModalButton) {
        openModalButton.addEventListener("click", showModal);
    } else {
        console.error("bouton ouverture modale introuvable");
    }

    // Fermer la modal
    closeModalButtons.forEach(button => {
        button.addEventListener("click", hideModal);
    });
    
    // Passer à la modal d'ajout de photo
    addPhotoBtn.addEventListener("click", () => {
        console.log("bouton ajouter une photo");
        
        modalWorks.classList.add("hide");
        modalEdit.classList.remove("hide");
    });

    returnModal.addEventListener("click", showModal);

    // Charger les catégories dans le formulaire d'ajout
    async function loadCategories() {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const categories = await response.json();
            categorySelect.innerHTML = ""; // Vider les catégories précédentes
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des catégories :", error);
        }
    }

    // Charger les miniatures dans la modal
    async function loadThumbnails() {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const works = await response.json();
            thumbnailGallery.innerHTML = ""; // Vider la galerie précédente
            works.forEach(work => {
                const workContainer = document.createElement("div");
                workContainer.className = "work-container";
                workContainer.setAttribute('data-id', work.id); // Ajouter l'attribut data-id
                
                const img = document.createElement("img");
                img.src = work.imageUrl;
                img.alt = work.title;
                img.classList.add("thumbnail");

                const trashDiv = document.createElement("div");
                trashDiv.className = "trash-div";

                const trashCan = document.createElement("i");
                trashCan.classList.add("fa-solid", "fa-trash-can");

                trashCan.addEventListener("click", () => {
                    deleteWork(work.id); // Suppression directe sans confirmation
                });

                thumbnailGallery.appendChild(workContainer);
                workContainer.appendChild(img);
                workContainer.appendChild(trashDiv);
                trashDiv.appendChild(trashCan);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des miniatures :", error);
        }
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("form submitted");
    
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categorySelect.value);
    
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
                const workContainer = document.createElement("div");
                workContainer.className = "work-container";
                workContainer.setAttribute('data-id', data.id);
        
                const img = document.createElement("img");
                img.src = URL.createObjectURL(fileInput.files[0]); 
                img.alt = titleInput.value;
                img.classList.add("thumbnail");
        
                const trashDiv = document.createElement("div");
                trashDiv.className = "trash-div";
        
                const trashCan = document.createElement("i");
                trashCan.classList.add("fa-solid", "fa-trash-can");
        
                trashCan.addEventListener("click", () => {
                    deleteWork(data.id);
                });
        
                workContainer.appendChild(img);
                workContainer.appendChild(trashDiv);
                trashDiv.appendChild(trashCan);
                thumbnailGallery.appendChild(workContainer);
        
                form.reset();
                photoPreview.innerHTML = "";
                modalWorks.style.display = "none"; // Masquer le contenu de la galerie
                modalEdit.style.display = "none"; // Masquer le formulaire d'ajout de photo
            } else {
                console.error("Erreur lors de l'ajout de la photo.");
            }
        })
        
        .catch(error => console.error("Erreur:", error));
    });
    
    

    function deleteWork(id) {
        console.log(token, id);
        
        fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response);
            
            if (response.ok) {
                // Retirer l'élément de la galerie sans fermer la modale
                const workToRemove = document.querySelector(`[data-id='${id}']`);
                if (workToRemove) {
                    workToRemove.remove();
                }
            } else {
                console.error("Erreur lors de la suppression de l'image.");
            }
        });
    }
    
});

let img = document.createElement('img');
let file;

// événement pour le label "new-image"
document.getElementById("new-image").addEventListener("click", function() {
    document.getElementById("form-image").click();
});

// événement pour l'input de fichier
document.getElementById("form-image").addEventListener("change", function (event) {
    file = event.target.files[0];
    // Assignez le fichier à une variable globale 
    if (file && (file.type === "image/jpg" || file.type === "image/png" || file.type === "image/jpeg")) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            img.alt = "Uploaded Photo";
            document.getElementById("photo-preview").appendChild(img);
        };
        reader.readAsDataURL(file);
        // Masque les éléments HTML avec la classe "new-image".
        document.querySelectorAll(".new-image").forEach(e => e.style.display = "none");
    } else {
        alert("Veuillez sélectionner une image en format JPG ou PNG.");
    }
});
