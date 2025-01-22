const worksUrl = "http://localhost:5678/api/works";
const urlCategories ="http://localhost:5678/api/categories";
const filters = document.querySelector(".filters");

async function getWorks() {
    const response = await fetch(worksUrl);
    if (response.ok) {
        return response.json();
    } else {
        console.error('HTTP error ! status ${response.status}');
        return[];
    }
}
function displayWorks(works, newWork = null) {
    const gallery = document.querySelector(".gallery");
    
    if (newWork) {
        // Ajouter la nouvelle image directement sans vider la galerie
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        figure.setAttribute("data-id", newWork.id);
        img.src = newWork.imageUrl;
        img.alt = newWork.title || "Image";
        figcaption.innerText = newWork.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    } else {
        gallery.innerHTML = ""; // Réinitialise la galerie si aucun nouvel élément
        works.forEach(work => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            const figcaption = document.createElement("figcaption");

            figure.setAttribute("data-id", work.id);
            img.src = work.imageUrl;
            img.alt = work.title || "Image";
            figcaption.innerText = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        });
    }
}



async function getCategories() {
    const response = await fetch (urlCategories);
    if (response.ok) {
        return response.json();
    } else {
        console.error('HTTP error ! status ${response.status}');
        return[];
    }
}



function displayfilters(categories) {
    const title = document.querySelector("#portfolio");
    const subTitle = title.children[1];
    const divBtn = document.createElement("div");
    divBtn.classList.add("divBtn");

    title.insertBefore(divBtn, subTitle);
    
    const gallery = document.querySelector(".gallery");
    const btnAll = document.createElement("button");
    btnAll.classList.add("filterButton", "btnAll", "active");
    btnAll.innerText = "Tous";

    // Fonction pour gérer la mise en surbrillance du bouton sélectionné
    function handleFilterButton(clickedBtn) {
        document.querySelectorAll(".filterButton").forEach(btn => {
            btn.classList.remove("active");
        });
        clickedBtn.classList.add("active");
    }

    btnAll.addEventListener("click", () => {
        gallery.innerHTML = "";
        getWorks().then(displayWorks);
        handleFilterButton(btnAll);
    });
    divBtn.appendChild(btnAll);
    
    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.classList.add("filterButton");

        // Transformer la première lettre en majuscule et le reste en minuscule
        btn.innerText = category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();

        btn.addEventListener("click", () => {
            gallery.innerHTML = "";
            getWorks().then(works => {
                const filterWorks = works.filter(work => work.categoryId === category.id);
                displayWorks(filterWorks);
            });
            handleFilterButton(btn);
        });
        divBtn.appendChild(btn);
    });
}




// Fonction principale pour récupérer les données et les afficher
async function main() {
   
    const works = await getWorks();
    const categories = await getCategories();
    const token = localStorage.getItem('authToken');

    if (Array.isArray(works) && works.length > 0 && Array.isArray(categories) && categories.length > 0) {
        console.log("Récupération des travaux et des catégories avec succès !");
        displayWorks(works);

       if (!token) { 
        displayfilters(categories);
     }
    } else {
        console.error("Une erreur s'est produite lors de la récupération des travaux er des catégories");
    }
};


document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("only-guest");
    const logoutButton = document.getElementById("nav-logout");
    const adminBar = document.getElementById("banner-modifier");
    const editButton = document.getElementById("edit-button");
    const token = localStorage.getItem("authToken");
    

    if (!loginButton || !logoutButton ||!adminBar ) {
        console.error("Les éléments avec les ID n'ont pas été trouvée");
        return;
    }
    

    if (token) {
        //Utilisateur connecté
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
        adminBar.classList.remove("hidden");
        editButton.style.display ="block";
    } else {
        //Utilisateur non connecté
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
        adminBar.classList.add("hidden");
        editButton.style.display = "none";

    }


    //Gestion du clic sur le bouton login
    loginButton.addEventListener("click", () => {
        window.location.href = "login.html"
    })
    
    

    //Gestion du clic sur le bouton Logout
    logoutButton.addEventListener("click", () =>{
        localStorage.removeItem("authToken");
        window.location.href = "index.html"
    });

    const addPhotoSection = document.getElementById("arrow-return");
    addPhotoSection.style.display = token ? "block" : "none";

  });

//Appel à la fonction principale 
main()

