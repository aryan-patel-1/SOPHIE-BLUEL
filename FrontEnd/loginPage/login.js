// URL de l'API de connexion
const loginApi = "http://localhost:5678/api/users/login";

// Ajout d'un gestionnaire d'événements pour la soumission du formulaire
document.getElementById("login-section").addEventListener("submit", handleSubmit);

// Fonction asynchrone qui gère la soumission du formulaire
async function handleSubmit(event) {
    event.preventDefault();
    
    const emailElement = document.getElementById("email");
    const passwordElement = document.getElementById("password");

    let user = {
        email: emailElement.value,
        password: passwordElement.value,
    };

    try {
        let response = await fetch(loginApi, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        const previousError = document.querySelector(".error-login");
        if (previousError) {
            previousError.remove();
        }

        console.log("Response Status:", response.status);

        if (response.status !== 200) {
            const errorBox = document.createElement("div");
            errorBox.className = "error-login";
            errorBox.innerHTML = "Veuillez vérifier votre email et/ou votre mot de passe";
        
            const passwordElement = document.getElementById("password");
            passwordElement.parentNode.insertBefore(errorBox, passwordElement.nextSibling);
        }
         else {
            let result = await response.json();
            const token = result.token;

            console.log("Login Success:", result);

            localStorage.setItem("authToken", token);

            //Vérification de l'enregistrement du token 
            const storedToken = localStorage.getItem("authToken");
            console.log("Token enregistré", storedToken);
            
            // Pour vérifier que la redirection fonctionne
            window.location.href = "../index.html";
        }
    } catch (error) {
        console.error("Erreur lors de la soumission du formulaire:", error);
    }
}
      


    
    