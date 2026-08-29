const SUPABASE_URL = "https://bzfnsoqefgddkjjoleuz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kR3TRDVXjwQaj0xatKYHCA_mxDy26T_";


const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================================================
// LOGIN
// =========================================================

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

    showApp();
    return true;
}


async function logout() {

    await client.auth.signOut();

    showLogin();
}


async function checkLogin() {

    const { data } =
        await client.auth.getSession();

    if (data.session) {
        showApp();
    } else {
        showLogin();
    }
}


function showLogin() {

    document.getElementById("login-page").style.display = "flex";

    document.getElementById("app-page").style.display = "none";
}


function showApp() {

    document.getElementById("login-page").style.display = "none";

    document.getElementById("app-page").style.display = "block";

    loadRepresentatives();
}


// =========================================================
// REPRESENTATIVES
// =========================================================

let representatives = [];

let editingRepresentativeId = null;


async function loadRepresentatives() {

    const { data, error } =
        await client
            .from("Representatives")
            .select("*")
            .order("rep_name", { ascending: true });

    if (error) {

        console.error(error);

        alert(
            "Could not load representatives:\n\n" +
            error.message
        );

        return;
    }

    representatives = data || [];

    displayRepresentatives();
}


function displayRepresentatives() {

    const search =
        document
            .getElementById("representative-search")
            .value
            .trim()
            .toLowerCase();

    const filtered =
        representatives.filter(rep => {

            return (
                (rep.rep_code || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (rep.rep_name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (rep.territory_code || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (rep.territory_name || "")
                    .toLowerCase()
                    .includes(search)
            );

        });


    const tbody =
        document.getElementById(
            "representatives-table-body"
        );


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No representatives found
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(rep => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(rep.rep_code || "")}</td>

            <td>${escapeHtml(rep.rep_name || "")}</td>

            <td>${escapeHtml(rep.territory_code || "")}</td>

            <td>${escapeHtml(rep.territory_name || "")}</td>

            <td class="actions">

                <button
                    class="edit-btn"
                    onclick="editRepresentative(${rep.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteRepresentative(${rep.id})"
                >
                    Delete
                </button>

            </td>
        `;


        tbody.appendChild(row);

    });
}


// =========================================================
// ADD / UPDATE
// =========================================================

async function saveRepresentative() {

    const repCode =
        document
            .getElementById("rep-code")
            .value
            .trim();

    const repName =
        document
            .getElementById("rep-name")
            .value
            .trim();

    const territoryCode =
        document
            .getElementById("territory-code")
            .value
            .trim();

    const territoryName =
        document
            .getElementById("territory-name")
            .value
            .trim();


    if (!repCode) {

        alert("Please enter Representative Code.");

        return;
    }


    if (!repName) {

        alert("Please enter Representative Name.");

        return;
    }


    const record = {

        rep_code: repCode,

        rep_name: repName,

        territory_code: territoryCode,

        territory_name: territoryName

    };


    let result;


    if (editingRepresentativeId) {

        result =
            await client
                .from("Representatives")
                .update(record)
                .eq("id", editingRepresentativeId);

    } else {

        result =
            await client
                .from("Representatives")
                .insert([record]);

    }


    if (result.error) {

        alert(
            "Could not save representative:\n\n" +
            result.error.message
        );

        return;
    }


    alert(
        editingRepresentativeId
            ? "Representative updated successfully."
            : "Representative created successfully."
    );


    clearRepresentativeForm();

    await loadRepresentatives();
}


// =========================================================
// EDIT
// =========================================================

function editRepresentative(id) {

    const rep =
        representatives.find(
            item => item.id === id
        );


    if (!rep) {
        return;
    }


    editingRepresentativeId = id;


    document.getElementById("rep-code").value =
        rep.rep_code || "";


    document.getElementById("rep-name").value =
        rep.rep_name || "";


    document.getElementById("territory-code").value =
        rep.territory_code || "";


    document.getElementById("territory-name").value =
        rep.territory_name || "";


    document.getElementById("save-representative-btn")
        .textContent = "Update Representative";


    document.getElementById("cancel-edit-btn")
        .style.display = "inline-block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// DELETE
// =========================================================

async function deleteRepresentative(id) {

    const rep =
        representatives.find(
            item => item.id === id
        );


    if (!rep) {
        return;
    }


    const confirmed =
        confirm(
            `Delete representative "${rep.rep_name}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await client
            .from("Representatives")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Could not delete representative:\n\n" +
            error.message
        );

        return;
    }


    alert("Representative deleted successfully.");

    await loadRepresentatives();
}


// =========================================================
// CLEAR FORM
// =========================================================

function clearRepresentativeForm() {

    editingRepresentativeId = null;


    document.getElementById("rep-code").value = "";

    document.getElementById("rep-name").value = "";

    document.getElementById("territory-code").value = "";

    document.getElementById("territory-name").value = "";


    document.getElementById("save-representative-btn")
        .textContent = "Create Representative";


    document.getElementById("cancel-edit-btn")
        .style.display = "none";
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkLogin();

        document
            .getElementById("representative-search")
            .addEventListener(
                "input",
                displayRepresentatives
            );

    }
);
