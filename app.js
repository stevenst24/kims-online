const SUPABASE_URL = "https://bzfnsoqefgddkjjoleuz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kR3TRDVXjwQaj0xatKYHCA_mxDy26T_";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function login(email, password) {

    const { data, error } =
        await client.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        alert(error.message);
        return false;
    }

    document.getElementById("login-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";

    return true;
}

async function logout() {

    await client.auth.signOut();

    document.getElementById("login-page").style.display = "flex";
    document.getElementById("app-page").style.display = "none";
}

async function checkLogin() {

    const { data } = await client.auth.getSession();

    if (data.session) {
        document.getElementById("login-page").style.display = "none";
        document.getElementById("app-page").style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", checkLogin);
