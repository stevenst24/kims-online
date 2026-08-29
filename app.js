const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let currentUser = null;

async function checkLogin() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
        currentUser = data.session.user;
        showApp();
    } else {
        showLogin();
    }
}

async function login(email, password) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        alert(error.message);
        return false;
    }

    currentUser = data.user;
    showApp();
    return true;
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    showLogin();
}

function showLogin() {
    const loginPage = document.getElementById("login-page");
    const appPage = document.getElementById("app-page");

    if (loginPage) loginPage.style.display = "block";
    if (appPage) appPage.style.display = "none";
}

function showApp() {
    const loginPage = document.getElementById("login-page");
    const appPage = document.getElementById("app-page");

    if (loginPage) loginPage.style.display = "none";
    if (appPage) appPage.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
});
