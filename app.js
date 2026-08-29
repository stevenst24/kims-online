// =========================================================
// KIMS ONLINE
// Supabase
// =========================================================

const SUPABASE_URL = "https://bzfnsoqefgddkjjoleuz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kR3TRDVXjwQaj0xatKYHCA_mxDy26T_";

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
        document.getElementById("representatives-page");

    const customersPage =
        document.getElementById("customers-page");

    const productsPage =
        document.getElementById("productsSection");


    if (representativesPage) {
        representativesPage.style.display = "none";
    }

    if (customersPage) {
        customersPage.style.display = "none";
    }

    if (productsPage) {
        productsPage.style.display = "none";
    }


    if (page === "representatives") {

        if (representativesPage) {
            representativesPage.style.display = "block";
        }

        loadRepresentatives();
    }


    if (page === "customers") {

        if (customersPage) {
            customersPage.style.display = "block";
        }

        loadCustomers();
    }


    if (page === "products") {

        if (productsPage) {
            productsPage.style.display = "block";
        }

        loadProducts();
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
    const customer = customers.find(item => String(item.id) === String(id));

    if (!customer) {
        alert("Customer not found.");
        return;
    }

    const confirmed = confirm(
        `Delete customer "${customer.shop_name}"?`
    );

    if (!confirmed) return;

    try {
        // First check whether this customer is used by invoices
        const { data: invoices, error: checkError } = await client
            .from("Invoices")
            .select("id")
            .eq("customer_id", id)
            .limit(1);

        if (checkError) {
            alert("Could not check customer usage:\n\n" + checkError.message);
            return;
        }

        if (invoices && invoices.length > 0) {
            alert(
                "This customer cannot be deleted because it is already used in an invoice."
            );
            return;
        }

        const { error } = await client
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

        alert("Customer deleted successfully.");

        await loadCustomers();

    } catch (err) {
        alert(
            "Delete failed:\n\n" +
            (err.message || err)
        );
    }
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


// =========================================================
// PRODUCTS MODULE
// =========================================================

let products = [];
let editingProductId = null;


// LOAD PRODUCTS
async function loadProducts() {

    const { data, error } = await client
        .from("Products")
        .select("*")
        .order("product_name", { ascending: true });

    if (error) {
        alert("Could not load products:\n\n" + error.message);
        return;
    }

    products = data || [];

    renderProducts();
}


// RENDER PRODUCTS
function renderProducts() {

    const tbody =
        document.getElementById("productsTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    products.forEach(product => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(product.product_code || "")}</td>
            <td>${escapeHtml(product.product_name || "")}</td>
            <td>${escapeHtml(product.pack_size || "")}</td>
            <td>${Number(product.unit_tp || 0).toFixed(2)}</td>
            <td>${Number(product.unit_vat || 0).toFixed(2)}</td>
            <td>${Number(product.unit_rp_vat || 0).toFixed(2)}</td>

            <td>
                <button
                    onclick="editProduct(${product.id})">
                    Edit
                </button>

                <button
                    onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// ADD / UPDATE PRODUCT
async function saveProduct() {

    const product_code =
        document.getElementById("productCode")?.value.trim();

    const product_name =
        document.getElementById("productName")?.value.trim();

    const pack_size =
        document.getElementById("packSize")?.value.trim();

    const unit_tp =
        parseFloat(
            document.getElementById("unitTP")?.value || 0
        );

    const unit_vat =
        parseFloat(
            document.getElementById("unitVAT")?.value || 0
        );

    const unit_rp_vat =
        parseFloat(
            document.getElementById("unitRPVAT")?.value || 0
        );


    if (!product_code || !product_name) {

        alert(
            "Product Code and Product Name are required."
        );

        return;
    }


    let error;


    if (editingProductId) {

        const result = await client
            .from("Products")
            .update({
                product_code,
                product_name,
                pack_size,
                unit_tp,
                unit_vat,
                unit_rp_vat
            })
            .eq("id", editingProductId);

        error = result.error;

    } else {

        const result = await client
            .from("Products")
            .insert([{
                product_code,
                product_name,
                pack_size,
                unit_tp,
                unit_vat,
                unit_rp_vat
            }]);

        error = result.error;
    }


    if (error) {

        alert(
            "Could not save product:\n\n" +
            error.message
        );

        return;
    }


    alert(
        editingProductId
            ? "Product updated successfully."
            : "Product added successfully."
    );


    clearProductForm();

    await loadProducts();
}


// EDIT PRODUCT
function editProduct(id) {

    const product =
        products.find(
            item => String(item.id) === String(id)
        );


    if (!product) {

        alert("Product not found.");

        return;
    }


    editingProductId = id;


    document.getElementById("productCode").value =
        product.product_code || "";

    document.getElementById("productName").value =
        product.product_name || "";

    document.getElementById("packSize").value =
        product.pack_size || "";

    document.getElementById("unitTP").value =
        product.unit_tp ?? "";

    document.getElementById("unitVAT").value =
        product.unit_vat ?? "";

    document.getElementById("unitRPVAT").value =
        product.unit_rp_vat ?? "";
}


// DELETE PRODUCT
async function deleteProduct(id) {

    const product =
        products.find(
            item => String(item.id) === String(id)
        );


    if (!product) {

        alert("Product not found.");

        return;
    }


    if (
        !confirm(
            `Delete product "${product.product_name}"?`
        )
    ) {
        return;
    }


    // Check invoice usage
    const { data: invoiceItems, error: checkError } =
        await client
            .from("InvoiceItems")
            .select("id")
            .eq("product_id", id)
            .limit(1);


    if (checkError) {

        alert(
            "Could not check product usage:\n\n" +
            checkError.message
        );

        return;
    }


    if (
        invoiceItems &&
        invoiceItems.length > 0
    ) {

        alert(
            "This product cannot be deleted because it is already used in an invoice."
        );

        return;
    }


    const { error } =
        await client
            .from("Products")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Could not delete product:\n\n" +
            error.message
        );

        return;
    }


    alert("Product deleted successfully.");

    await loadProducts();
}


// CLEAR FORM
function clearProductForm() {

    [
        "productCode",
        "productName",
        "packSize",
        "unitTP",
        "unitVAT",
        "unitRPVAT"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });


    editingProductId = null;
}
