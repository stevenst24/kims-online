// =========================================================
// KIMS ONLINE
// Supabase
// =========================================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================================================
// GLOBAL DATA
// =========================================================

let representatives = [];

let customers = [];

let editingRepresentativeId = null;

let editingCustomerId = null;


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


// =========================================================
// LOGOUT
// =========================================================

async function logout() {

    await client.auth.signOut();

    showLogin();
}


// =========================================================
// LOGIN CHECK
// =========================================================

async function checkLogin() {

    const { data } =
        await client.auth.getSession();

    if (data.session) {

        showApp();

    } else {

        showLogin();

    }
}


// =========================================================
// SHOW LOGIN
// =========================================================

function showLogin() {

    document.getElementById(
        "login-page"
    ).style.display = "flex";

    document.getElementById(
        "app-page"
    ).style.display = "none";
}


// =========================================================
// SHOW APPLICATION
// =========================================================

function showApp() {

    document.getElementById(
        "login-page"
    ).style.display = "none";

    document.getElementById(
        "app-page"
    ).style.display = "block";


    loadRepresentatives();

    loadCustomers();
}


// =========================================================
// NAVIGATION
// =========================================================

function showPage(page) {

    const representativesPage =
        document.getElementById(
            "representatives-page"
        );

    const customersPage =
        document.getElementById(
            "customers-page"
        );


    representativesPage.style.display = "none";

    customersPage.style.display = "none";


    if (page === "representatives") {

        representativesPage.style.display =
            "block";

        loadRepresentatives();

    }


    if (page === "customers") {

        customersPage.style.display =
            "block";

        loadCustomers();

    }

}


// =========================================================
// REPRESENTATIVES
// =========================================================

async function loadRepresentatives() {

    const { data, error } =
        await client
            .from("Representatives")
            .select("*")
            .order("rep_name", {
                ascending: true
            });


    if (error) {

        console.error(error);

        alert(
            "Could not load representatives:\n\n" +
            error.message
        );

        return;
    }


    representatives =
        data || [];


    displayRepresentatives();

    populateRepresentativeDropdown();
}


// =========================================================
// DISPLAY REPRESENTATIVES
// =========================================================

function displayRepresentatives() {

    const search =
        document
            .getElementById(
                "representative-search"
            )
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

            <td>
                ${escapeHtml(rep.rep_code || "")}
            </td>

            <td>
                ${escapeHtml(rep.rep_name || "")}
            </td>

            <td>
                ${escapeHtml(rep.territory_code || "")}
            </td>

            <td>
                ${escapeHtml(rep.territory_name || "")}
            </td>

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
// SAVE REPRESENTATIVE
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

        alert(
            "Please enter Representative Code."
        );

        return;
    }


    if (!repName) {

        alert(
            "Please enter Representative Name."
        );

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
                .eq(
                    "id",
                    editingRepresentativeId
                );

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
// EDIT REPRESENTATIVE
// =========================================================

function editRepresentative(id) {

    const rep =
        representatives.find(
            item => item.id === id
        );


    if (!rep) return;


    editingRepresentativeId = id;


    document.getElementById(
        "rep-code"
    ).value =
        rep.rep_code || "";


    document.getElementById(
        "rep-name"
    ).value =
        rep.rep_name || "";


    document.getElementById(
        "territory-code"
    ).value =
        rep.territory_code || "";


    document.getElementById(
        "territory-name"
    ).value =
        rep.territory_name || "";


    document.getElementById(
        "save-representative-btn"
    ).textContent =
        "Update Representative";


    document.getElementById(
        "cancel-edit-btn"
    ).style.display =
        "inline-block";


    showPage("representatives");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// DELETE REPRESENTATIVE
// =========================================================

async function deleteRepresentative(id) {

    const rep =
        representatives.find(
            item => item.id === id
        );


    if (!rep) return;


    const confirmed =
        confirm(
            `Delete representative "${rep.rep_name}"?`
        );


    if (!confirmed) return;


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


    alert(
        "Representative deleted successfully."
    );


    await loadRepresentatives();
}


// =========================================================
// CLEAR REPRESENTATIVE FORM
// =========================================================

function clearRepresentativeForm() {

    editingRepresentativeId = null;


    document.getElementById(
        "rep-code"
    ).value = "";


    document.getElementById(
        "rep-name"
    ).value = "";


    document.getElementById(
        "territory-code"
    ).value = "";


    document.getElementById(
        "territory-name"
    ).value = "";


    document.getElementById(
        "save-representative-btn"
    ).textContent =
        "Create Representative";


    document.getElementById(
        "cancel-edit-btn"
    ).style.display =
        "none";
}


// =========================================================
// CUSTOMER
// =========================================================

async function loadCustomers() {

    const { data, error } =
        await client
            .from("Customers")
            .select(`
                *,
                Representatives (
                    rep_code,
                    rep_name,
                    territory_code,
                    territory_name
                )
            `)
            .order("shop_name", {
                ascending: true
            });


    if (error) {

        console.error(error);

        alert(
            "Could not load customers:\n\n" +
            error.message
        );

        return;
    }


    customers =
        data || [];


    displayCustomers();
}


// =========================================================
// DISPLAY CUSTOMERS
// =========================================================

function displayCustomers() {

    const search =
        document
            .getElementById(
                "customer-search"
            )
            .value
            .trim()
            .toLowerCase();


    const filtered =
        customers.filter(customer => {

            const rep =
                customer.Representatives || {};


            return (

                (customer.customer_code || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (customer.shop_name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (customer.address || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (customer.owner_name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (customer.mobile || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (rep.rep_name || "")
                    .toLowerCase()
                    .includes(search)

            );

        });


    const tbody =
        document.getElementById(
            "customers-table-body"
        );


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No customers found
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(customer => {

        const row =
            document.createElement("tr");


        const rep =
            customer.Representatives || {};


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    customer.customer_code || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.shop_name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.address || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.owner_name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.mobile || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.email || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    rep.rep_name || "-"
                )}
            </td>

            <td class="actions">

                <button
                    class="edit-btn"
                    onclick="editCustomer(${customer.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteCustomer(${customer.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tbody.appendChild(row);

    });
}


// =========================================================
// REPRESENTATIVE DROPDOWN
// =========================================================

function populateRepresentativeDropdown() {

    const select =
        document.getElementById(
            "customer-representative"
        );


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Select Representative
        </option>
    `;


    representatives.forEach(rep => {

        const option =
            document.createElement("option");


        option.value = rep.id;


        option.textContent =
            `${rep.rep_code} - ${rep.rep_name}`;


        select.appendChild(option);

    });


    if (currentValue) {

        select.value =
            currentValue;

    }
}


// =========================================================
// SAVE CUSTOMER
// =========================================================

async function saveCustomer() {

    const customerCode =
        document
            .getElementById(
                "customer-code"
            )
            .value
            .trim();


    const shopName =
        document
            .getElementById(
                "shop-name"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "customer-address"
            )
            .value
            .trim();


    const ownerName =
        document
            .getElementById(
                "owner-name"
            )
            .value
            .trim();


    const mobile =
        document
            .getElementById(
                "customer-mobile"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "customer-email"
            )
            .value
            .trim();


    const representativeId =
        document
            .getElementById(
                "customer-representative"
            )
            .value;


    if (!customerCode) {

        alert(
            "Please enter Customer Code."
        );

        return;
    }


    if (!shopName) {

        alert(
            "Please enter Shop Name."
        );

        return;
    }


    if (!representativeId) {

        alert(
            "Please select a Representative."
        );

        return;
    }


    const record = {

        customer_code:
            customerCode,

        shop_name:
            shopName,

        address:
            address,

        owner_name:
            ownerName,

        mobile:
            mobile,

        email:
            email,

        representative_id:
            Number(representativeId)

    };


    let result;


    if (editingCustomerId) {

        result =
            await client
                .from("Customers")
                .update(record)
                .eq(
                    "id",
                    editingCustomerId
                );

    } else {

        result =
            await client
                .from("Customers")
                .insert([record]);

    }


    if (result.error) {

        alert(
            "Could not save customer:\n\n" +
            result.error.message
        );

        return;
    }


    alert(
        editingCustomerId
            ? "Customer updated successfully."
            : "Customer created successfully."
    );


    clearCustomerForm();

    await loadCustomers();
}


// =========================================================
// EDIT CUSTOMER
// =========================================================

function editCustomer(id) {

    const customer =
        customers.find(
            item => item.id === id
        );


    if (!customer) return;


    editingCustomerId = id;


    document.getElementById(
        "customer-code"
    ).value =
        customer.customer_code || "";


    document.getElementById(
        "shop-name"
    ).value =
        customer.shop_name || "";


    document.getElementById(
        "customer-address"
    ).value =
        customer.address || "";


    document.getElementById(
        "owner-name"
    ).value =
        customer.owner_name || "";


    document.getElementById(
        "customer-mobile"
    ).value =
        customer.mobile || "";


    document.getElementById(
        "customer-email"
    ).value =
        customer.email || "";


    document.getElementById(
        "customer-representative"
    ).value =
        customer.representative_id || "";


    document.getElementById(
        "save-customer-btn"
    ).textContent =
        "Update Customer";


    document.getElementById(
        "cancel-customer-edit-btn"
    ).style.display =
        "inline-block";


    showPage("customers");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// DELETE CUSTOMER
// =========================================================

async function deleteCustomer(id) {

    const customer =
        customers.find(
            item => item.id === id
        );


    if (!customer) return;


    const confirmed =
        confirm(
            `Delete customer "${customer.shop_name}"?`
        );


    if (!confirmed) return;


    const { error } =
        await client
            .from("Customers")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Could not delete customer:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Customer deleted successfully."
    );


    await loadCustomers();
}


// =========================================================
// CLEAR CUSTOMER FORM
// =========================================================

function clearCustomerForm() {

    editingCustomerId = null;


    document.getElementById(
        "customer-code"
    ).value = "";


    document.getElementById(
        "shop-name"
    ).value = "";


    document.getElementById(
        "customer-address"
    ).value = "";


    document.getElementById(
        "owner-name"
    ).value = "";


    document.getElementById(
        "customer-mobile"
    ).value = "";


    document.getElementById(
        "customer-email"
    ).value = "";


    document.getElementById(
        "customer-representative"
    ).value = "";


    document.getElementById(
        "save-customer-btn"
    ).textContent =
        "Create Customer";


    document.getElementById(
        "cancel-customer-edit-btn"
    ).style.display =
        "none";
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// =========================================================
// START APPLICATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkLogin();


        document
            .getElementById(
                "representative-search"
            )
            .addEventListener(
                "input",
                displayRepresentatives
            );


        document
            .getElementById(
                "customer-search"
            )
            .addEventListener(
                "input",
                displayCustomers
            );

    }
);
