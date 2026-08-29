// =========================================================
// KIMS ONLINE
// app.js
// =========================================================

// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
    "https://bzfnsoqefgddkjjoleuz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_kR3TRDVXjwQaj0xatKYHCA_mxDy26T_";

const client =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================================
// GLOBAL DATA
// =========================================================

let currentUser = null;

let representatives = [];
let customers = [];
let products = [];

let editingRepresentativeId = null;
let editingCustomerId = null;
let editingProductId = null;


// =========================================================
// LOGIN
// =========================================================

async function loginUser() {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");

    if (!email || !password) {
        message.textContent =
            "Enter email and password.";
        return;
    }

    message.textContent = "Logging in...";

    const { data, error } =
        await client.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        console.error(error);

        message.textContent =
            error.message;

        return;
    }

    currentUser = data.user;

    message.textContent = "";

    showApplication();
}


// =========================================================
// LOGOUT
// =========================================================

async function logoutUser() {

    await client.auth.signOut();

    currentUser = null;

    document.getElementById(
        "appScreen"
    ).style.display = "none";

    document.getElementById(
        "loginScreen"
    ).style.display = "flex";
}


// =========================================================
// SHOW APPLICATION
// =========================================================

function showApplication() {

    document.getElementById(
        "loginScreen"
    ).style.display = "none";

    document.getElementById(
        "appScreen"
    ).style.display = "block";

    showPage("representatives");
}


// =========================================================
// PAGE NAVIGATION
// =========================================================

function showPage(page) {

    const pages = [
        "representatives-page",
        "customers-page",
        "products-page"
    ];

    pages.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.remove("active");
        }
    });


    // REPRESENTATIVES
    if (page === "representatives") {

        const element =
            document.getElementById(
                "representatives-page"
            );

        if (element) {
            element.classList.add("active");
        }

        loadRepresentatives();

        return;
    }


    // CUSTOMERS
    if (page === "customers") {

        const element =
            document.getElementById(
                "customers-page"
            );

        if (element) {
            element.classList.add("active");
        }

        loadRepresentatives();
        loadCustomers();

        return;
    }


    // PRODUCTS
    if (page === "products") {

        const element =
            document.getElementById(
                "products-page"
            );

        if (element) {
            element.classList.add("active");
        }

        loadProducts();

        return;
    }
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// REPRESENTATIVES
// =========================================================

// LOAD REPRESENTATIVES

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

    const searchInput =
        document.getElementById(
            "representativeSearch"
        );

    const tbody =
        document.getElementById(
            "representativesTableBody"
        );

    if (!tbody) return;


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        representatives.filter(rep => {

            return (

                String(
                    rep.rep_code || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    rep.rep_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    rep.territory_code || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    rep.territory_name || ""
                )
                    .toLowerCase()
                    .includes(search)

            );
        });


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
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
                ${escapeHtml(rep.rep_code)}
            </td>

            <td>
                ${escapeHtml(rep.rep_name)}
            </td>

            <td>
                ${escapeHtml(rep.territory_code)}
            </td>

            <td>
                ${escapeHtml(rep.territory_name)}
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
// SEARCH REPRESENTATIVES
// =========================================================

function searchRepresentatives() {

    displayRepresentatives();
}


// =========================================================
// SAVE REPRESENTATIVE
// =========================================================

async function saveRepresentative() {

    const repCode =
        document
            .getElementById("repCode")
            .value
            .trim();


    const repName =
        document
            .getElementById("repName")
            .value
            .trim();


    const territoryCode =
        document
            .getElementById("territoryCode")
            .value
            .trim();


    const territoryName =
        document
            .getElementById("territoryName")
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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!rep) {

        alert("Representative not found.");

        return;
    }


    editingRepresentativeId = id;


    document.getElementById(
        "repCode"
    ).value =
        rep.rep_code || "";


    document.getElementById(
        "repName"
    ).value =
        rep.rep_name || "";


    document.getElementById(
        "territoryCode"
    ).value =
        rep.territory_code || "";


    document.getElementById(
        "territoryName"
    ).value =
        rep.territory_name || "";


    const saveButton =
        document.querySelector(
            "#representatives-page .primary-btn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Representative";
    }


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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!rep) {

        alert(
            "Representative not found."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete representative "${rep.rep_name}"?`
        );


    if (!confirmed) return;


    // Check customer usage first

    const { data: usedCustomers, error: checkError } =
        await client
            .from("Customers")
            .select("id")
            .eq("representative_id", id)
            .limit(1);


    if (checkError) {

        alert(
            "Could not check representative usage:\n\n" +
            checkError.message
        );

        return;
    }


    if (
        usedCustomers &&
        usedCustomers.length > 0
    ) {

        alert(
            "This representative cannot be deleted because customers are assigned to this representative."
        );

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


    alert(
        "Representative deleted successfully."
    );


    await loadRepresentatives();
}


// =========================================================
// CLEAR REPRESENTATIVE
// =========================================================

function clearRepresentativeForm() {

    editingRepresentativeId = null;


    document.getElementById(
        "repCode"
    ).value = "";


    document.getElementById(
        "repName"
    ).value = "";


    document.getElementById(
        "territoryCode"
    ).value = "";


    document.getElementById(
        "territoryName"
    ).value = "";


    const saveButton =
        document.querySelector(
            "#representatives-page .primary-btn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Save Representative";
    }
}


// =========================================================
// CUSTOMER
// =========================================================

// LOAD CUSTOMERS

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

    const searchInput =
        document.getElementById(
            "customerSearch"
        );


    const tbody =
        document.getElementById(
            "customersTableBody"
        );


    if (!tbody) return;


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        customers.filter(customer => {

            const rep =
                customer.Representatives || {};


            return (

                String(
                    customer.customer_code || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    customer.shop_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    customer.address || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    customer.owner_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    customer.mobile || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    customer.email || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    rep.rep_name || ""
                )
                    .toLowerCase()
                    .includes(search)

            );
        });


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
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
                    customer.customer_code
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.shop_name
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.address
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.owner_name
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.mobile
                )}
            </td>

            <td>
                ${escapeHtml(
                    customer.email
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
// SEARCH CUSTOMERS
// =========================================================

function searchCustomers() {

    displayCustomers();
}


// =========================================================
// REPRESENTATIVE DROPDOWN
// =========================================================

function populateRepresentativeDropdown() {

    const select =
        document.getElementById(
            "customerRepresentative"
        );


    if (!select) return;


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


        option.value =
            rep.id;


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
            .getElementById("customerCode")
            .value
            .trim();


    const shopName =
        document
            .getElementById("shopName")
            .value
            .trim();


    const address =
        document
            .getElementById("address")
            .value
            .trim();


    const ownerName =
        document
            .getElementById("ownerName")
            .value
            .trim();


    const mobile =
        document
            .getElementById("mobile")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const representativeId =
        document
            .getElementById(
                "customerRepresentative"
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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!customer) {

        alert(
            "Customer not found."
        );

        return;
    }


    editingCustomerId = id;


    document.getElementById(
        "customerCode"
    ).value =
        customer.customer_code || "";


    document.getElementById(
        "shopName"
    ).value =
        customer.shop_name || "";


    document.getElementById(
        "address"
    ).value =
        customer.address || "";


    document.getElementById(
        "ownerName"
    ).value =
        customer.owner_name || "";


    document.getElementById(
        "mobile"
    ).value =
        customer.mobile || "";


    document.getElementById(
        "email"
    ).value =
        customer.email || "";


    document.getElementById(
        "customerRepresentative"
    ).value =
        customer.representative_id || "";


    const saveButton =
        document.querySelector(
            "#customers-page .primary-btn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Customer";
    }


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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!customer) {

        alert(
            "Customer not found."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete customer "${customer.shop_name}"?`
        );


    if (!confirmed) return;


    try {

        // Check invoice usage

        const {
            data: invoices,
            error: checkError
        } =
            await client
                .from("Invoices")
                .select("id")
                .eq(
                    "customer_id",
                    id
                )
                .limit(1);


        if (checkError) {

            alert(
                "Could not check customer usage:\n\n" +
                checkError.message
            );

            return;
        }


        if (
            invoices &&
            invoices.length > 0
        ) {

            alert(
                "This customer cannot be deleted because it is already used in an invoice."
            );

            return;
        }


        // Delete customer

        const { error } =
            await client
                .from("Customers")
                .delete()
                .eq(
                    "id",
                    id
                );


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

    } catch (error) {

        console.error(error);

        alert(
            "Delete failed:\n\n" +
            error.message
        );
    }
}


// =========================================================
// CLEAR CUSTOMER FORM
// =========================================================

function clearCustomerForm() {

    editingCustomerId = null;


    document.getElementById(
        "customerCode"
    ).value = "";


    document.getElementById(
        "shopName"
    ).value = "";


    document.getElementById(
        "address"
    ).value = "";


    document.getElementById(
        "ownerName"
    ).value = "";


    document.getElementById(
        "mobile"
    ).value = "";


    document.getElementById(
        "email"
    ).value = "";


    document.getElementById(
        "customerRepresentative"
    ).value = "";


    const saveButton =
        document.querySelector(
            "#customers-page .primary-btn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Save Customer";
    }
}


// =========================================================
// PRODUCTS
// =========================================================

// LOAD PRODUCTS

async function loadProducts() {

    const { data, error } =
        await client
            .from("Products")
            .select("*")
            .order(
                "product_name",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        alert(
            "Could not load products:\n\n" +
            error.message
        );

        return;
    }


    products =
        data || [];


    renderProducts();
}


// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function renderProducts() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );


    if (!tbody) return;


    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        products.filter(product => {

            return (

                String(
                    product.product_code || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.product_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.pack_size || ""
                )
                    .toLowerCase()
                    .includes(search)

            );
        });


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No products found
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(product => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    product.product_code
                )}
            </td>

            <td>
                ${escapeHtml(
                    product.product_name
                )}
            </td>

            <td>
                ${escapeHtml(
                    product.pack_size
                )}
            </td>

            <td>
                ${Number(
                    product.unit_tp || 0
                ).toFixed(2)}
            </td>

            <td>
                ${Number(
                    product.unit_vat || 0
                ).toFixed(2)}
            </td>

            <td>
                ${Number(
                    product.unit_rp_vat || 0
                ).toFixed(2)}
            </td>

            <td class="actions">

                <button
                    class="edit-btn"
                    onclick="editProduct(${product.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tbody.appendChild(row);

    });
}


// =========================================================
// SEARCH PRODUCTS
// =========================================================

function searchProducts() {

    renderProducts();
}


// =========================================================
// SAVE PRODUCT
// =========================================================

async function saveProduct() {

    const productCode =
        document
            .getElementById("productCode")
            .value
            .trim();


    const productName =
        document
            .getElementById("productName")
            .value
            .trim();


    const packSize =
        document
            .getElementById("packSize")
            .value
            .trim();


    const unitTP =
        parseFloat(
            document
                .getElementById("unitTP")
                .value || 0
        );


    const unitVAT =
        parseFloat(
            document
                .getElementById("unitVAT")
                .value || 0
        );


    const unitRPVAT =
        parseFloat(
            document
                .getElementById("unitRPVAT")
                .value || 0
        );


    if (!productCode) {

        alert(
            "Please enter Product Code."
        );

        return;
    }


    if (!productName) {

        alert(
            "Please enter Product Name."
        );

        return;
    }


    const record = {

        product_code:
            productCode,

        product_name:
            productName,

        pack_size:
            packSize,

        unit_tp:
            unitTP,

        unit_vat:
            unitVAT,

        unit_rp_vat:
            unitRPVAT
    };


    let result;


    if (editingProductId) {

        result =
            await client
                .from("Products")
                .update(record)
                .eq(
                    "id",
                    editingProductId
                );

    } else {

        result =
            await client
                .from("Products")
                .insert([record]);
    }


    if (result.error) {

        alert(
            "Could not save product:\n\n" +
            result.error.message
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


// =========================================================
// EDIT PRODUCT
// =========================================================

function editProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }


    editingProductId = id;


    document.getElementById(
        "productCode"
    ).value =
        product.product_code || "";


    document.getElementById(
        "productName"
    ).value =
        product.product_name || "";


    document.getElementById(
        "packSize"
    ).value =
        product.pack_size || "";


    document.getElementById(
        "unitTP"
    ).value =
        product.unit_tp ?? "";


    document.getElementById(
        "unitVAT"
    ).value =
        product.unit_vat ?? "";


    document.getElementById(
        "unitRPVAT"
    ).value =
        product.unit_rp_vat ?? "";


    const saveButton =
        document.getElementById(
            "productSaveButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Product";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// DELETE PRODUCT
// =========================================================

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete product "${product.product_name}"?`
        );


    if (!confirmed) return;


    // Check invoice usage

    const {
        data: invoiceItems,
        error: checkError
    } =
        await client
            .from("InvoiceItems")
            .select("id")
            .eq(
                "product_id",
                id
            )
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
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Could not delete product:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Product deleted successfully."
    );


    await loadProducts();
}


// =========================================================
// CLEAR PRODUCT
// =========================================================

function clearProductForm() {

    editingProductId = null;


    const fields = [
        "productCode",
        "productName",
        "packSize",
        "unitTP",
        "unitVAT",
        "unitRPVAT"
    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });


    const saveButton =
        document.getElementById(
            "productSaveButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "Add Product";
    }
}


// =========================================================
// CHECK SESSION
// =========================================================

async function checkSession() {

    const { data, error } =
        await client.auth.getSession();


    if (error) {

        console.error(error);

        showLogin();

        return;
    }


    if (data.session) {

        currentUser =
            data.session.user;

        showApplication();

    } else {

        showLogin();
    }
}


// =========================================================
// SHOW LOGIN
// =========================================================

function showLogin() {

    document.getElementById(
        "appScreen"
    ).style.display = "none";

    document.getElementById(
        "loginScreen"
    ).style.display = "flex";
}


// =========================================================
// AUTH STATE LISTENER
// =========================================================

client.auth.onAuthStateChange(
    (event, session) => {

        if (session) {

            currentUser =
                session.user;

        } else {

            currentUser = null;
        }
    }
);


// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const repSearch =
            document.getElementById(
                "representativeSearch"
            );

        if (repSearch) {

            repSearch.addEventListener(
                "input",
                searchRepresentatives
            );
        }


        const customerSearch =
            document.getElementById(
                "customerSearch"
            );

        if (customerSearch) {

            customerSearch.addEventListener(
                "input",
                searchCustomers
            );
        }


        const productSearch =
            document.getElementById(
                "productSearch"
            );

        if (productSearch) {

            productSearch.addEventListener(
                "input",
                searchProducts
            );
        }


        checkSession();
    }
);
