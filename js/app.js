/* =====================================================
   Bhutada Family Tree
   Version : 4.1.0
   File    : app.js
===================================================== */

const App = {

    version : "4.1.0",

    family : [],

    familyMap : new Map(),

    memberMap : new Map(),

    rootMember : null,

    zoom : 1,

    minZoom : 0.30,

    maxZoom : 3.00,

    panX : 0,

    panY : 0

};



/* ============================================
   Application Startup
============================================ */

window.addEventListener(

    "DOMContentLoaded",

    startApplication

);



/* ============================================
   Start Application
============================================ */

async function startApplication(){

    try{

        setStatus("Loading family database...");

        App.family = await loadFamilyData();

        setStatus("Building family hierarchy...");

        buildFamilyTree();

        setStatus("Rendering tree...");

        renderApplication();

        initializeToolbar();

        fitTreeToScreen();

        setStatus(

            "Ready | Members : " +

            App.family.length +

            " | Version : " +

            App.version

        );

    }

    catch(error){

        console.error(error);

        setStatus("Application Error");

        document.getElementById("treeCanvas").innerHTML =

        "<h2>Unable to start Bhutada Family Tree.</h2>";

    }

}



/* ============================================
   Toolbar
============================================ */

function initializeToolbar(){

    document
        .getElementById("btnExpandAll")
        .addEventListener(

            "click",

            ()=>{

                expandAll();

                renderApplication();

                fitTreeToScreen();

            }

        );



    document
        .getElementById("btnCollapseAll")
        .addEventListener(

            "click",

            ()=>{

                collapseAll();

                renderApplication();

                fitTreeToScreen();

            }

        );



    document
        .getElementById("btnResetZoom")
        .addEventListener(

            "click",

            resetZoom

        );



    document
        .getElementById("btnFitScreen")
        .addEventListener(

            "click",

            fitTreeToScreen

        );



    document
        .getElementById("txtSearch")
        .addEventListener(

            "input",

            searchMember

        );

/* ============================================
   Family Details Panel
============================================ */

document
    .getElementById("btnClosePopup")
    .addEventListener(
        "click",
        closeMemberDetails
    );


document.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Escape"){

            closeMemberDetails();

        }

    }
);
}


/* ============================================
   Zoom
============================================ */

function resetZoom(){

    App.zoom = 1;

    App.panX = 0;

    App.panY = 0;

    updateTreeTransform();

}



function fitTreeToScreen(){

    const viewport = document.getElementById("treeViewport");
    const wrapper  = document.getElementById("treeWrapper");

    if(!viewport || !wrapper) return;

    // The tree changes size after every expand/collapse render.
    // Measure the freshly rendered, untransformed wrapper before
    // calculating the scale.
    requestAnimationFrame(() => {

        const availableWidth = Math.max(
            viewport.clientWidth - 32,
            1
        );

        const availableHeight = Math.max(
            viewport.clientHeight - 32,
            1
        );

        const treeWidth = Math.max(
            wrapper.scrollWidth,
            wrapper.offsetWidth,
            1
        );

        const treeHeight = Math.max(
            wrapper.scrollHeight,
            wrapper.offsetHeight,
            1
        );

        const scaleX = availableWidth / treeWidth;
        const scaleY = availableHeight / treeHeight;

        // Never enlarge a tree just to fit it. For a large expanded
        // tree, scale it down enough that the complete tree remains
        // reachable inside the viewport.
        App.zoom = Math.min(1, scaleX, scaleY);

        // Prevent an extremely tiny tree on very large layouts.
        App.zoom = Math.max(App.minZoom, App.zoom);

        App.panX = 0;
        App.panY = 0;

        updateTreeTransform();

    });

}



function updateTreeTransform(){

    const viewport = document.getElementById("treeViewport");
    const wrapper  = document.getElementById("treeWrapper");

    if(!viewport || !wrapper) return;

    wrapper.style.transformOrigin = "top left";

    wrapper.style.transform =
        `scale(${App.zoom})`;

    const treeWidth  = wrapper.offsetWidth * App.zoom;
    const treeHeight = wrapper.offsetHeight * App.zoom;

    const offsetX = Math.max(
        (viewport.clientWidth - treeWidth) / 2,
        20
    );

    const offsetY = 20;

    wrapper.style.transform =
        `translate(${offsetX + App.panX}px, ${offsetY + App.panY}px)
         scale(${App.zoom})`;

}



/* ============================================
   Search
============================================ */

function searchMember(e){

    const keyword =

        e.target.value

        .trim()

        .toLowerCase();

    document

        .querySelectorAll(".personCard")

        .forEach(card=>{

            card.classList.remove("highlight");

        });

    if(keyword==="") return;

    const cards =

        document.querySelectorAll(".personCard");

    let found = null;

    cards.forEach(card=>{

        const name =
    (card.dataset.name || "")
        .toLowerCase();

        const id =
    (card.dataset.memberId || "")
        .toLowerCase();

        const contact =
    (card.dataset.contact || "");

        if(

            name.includes(keyword)

            ||

            id.includes(keyword)

            ||

            contact.includes(keyword)

        ){

            found = card;

        }

    });

    if(!found) return;

    found.classList.add("highlight");

    found.scrollIntoView({

        behavior:"smooth",

        block:"center",

        inline:"center"

    });

}


/* ============================================
   Member Details Popup
============================================ */

function showMemberDetails(card){

    document.getElementById("popupMemberName").textContent =
        card.dataset.name || "Member Details";


    document.getElementById("popName").textContent =
        card.dataset.name || "";


    document.getElementById("popMemberId").textContent =
        card.dataset.memberId || "";


    document.getElementById("popRole").textContent =
        card.dataset.role || "";


    document.getElementById("popGender").textContent =
        card.dataset.gender || "";


    const memberId =
        card.dataset.memberId || "";


    const person =
        App.family.find(
            item => item.memberId === memberId
        );


    const spouseId =
        memberId.endsWith("M")
            ? memberId.slice(0, -1) + "S"
            : memberId.endsWith("S")
            ? memberId.slice(0, -1) + "M"
            : "";


    const spouse =
        App.family.find(
            item => item.memberId === spouseId
        );


    const parentName =
        person && person.parent
        ? person.parent.name
        : "";


    document.getElementById("popParents").textContent =
        parentName || "-";


    const childrenNames =
        person && Array.isArray(person.children)
        ? person.children.map(
            child => child.name
        )
        : [];


    document.getElementById("popChildren").textContent =
        childrenNames.length
            ? childrenNames.join(", ")
            : "-";


    document.getElementById("popSpouse").textContent =
        spouse
            ? spouse.name
            : "-";


    document.getElementById("popGeneration").textContent =
        card.dataset.generation || "";


    document.getElementById("popContact").textContent =
        card.dataset.contact || "";


    document.getElementById("popDOB").textContent =
        card.dataset.dob || "-";


    document.getElementById("popDOA").textContent =
        card.dataset.doa || "-";


    document.getElementById("popDOD").textContent =
        card.dataset.dod || "-";


    /* Show member information */

    document.getElementById("emptyMemberMessage").style.display =
        "none";


    document.getElementById("memberTable").style.display =
        "table";

}

function closeMemberDetails(){

    document.getElementById("popupMemberName").textContent =
        "Select a Member";


    document.getElementById("emptyMemberMessage").style.display =
        "block";


    document.getElementById("memberTable").style.display =
        "none";


    document.getElementById("popName").textContent = "";
    document.getElementById("popMemberId").textContent = "";
    document.getElementById("popRole").textContent = "";
    document.getElementById("popGender").textContent = "";
    document.getElementById("popSpouse").textContent = "";
    document.getElementById("popParents").textContent = "";
    document.getElementById("popChildren").textContent = "";
    document.getElementById("popGeneration").textContent = "";
    document.getElementById("popContact").textContent = "";
    document.getElementById("popDOB").textContent = "";
    document.getElementById("popDOA").textContent = "";
    document.getElementById("popDOD").textContent = "";

}


/* ============================================
   Status Bar
============================================ */

function setStatus(message){

    document

        .getElementById("statusBar")

        .textContent = message;

}