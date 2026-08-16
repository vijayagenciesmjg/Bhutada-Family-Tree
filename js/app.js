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

        if(e.key !== "Escape")
            return;


        /* Close Search Results */

        const resultsPanel =
            document.getElementById(
                "searchResults"
            );


        if(resultsPanel){

            resultsPanel.innerHTML = "";

            resultsPanel.style.display =
                "none";

        }


        /* Close Member Details Popup */

        closeMemberDetails();

    }
);

/* ============================================
   Search Results — Close on Outside Click
============================================ */

document.addEventListener(

    "click",

    function(e){

        const searchContainer =
            document.getElementById(
                "searchContainer"
            );

        const resultsPanel =
            document.getElementById(
                "searchResults"
            );


        if(
            !searchContainer ||
            !resultsPanel
        ){

            return;

        }


        if(
            !searchContainer.contains(e.target)
        ){

            resultsPanel.innerHTML = "";

            resultsPanel.style.display =
                "none";

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

    const resultsPanel =
        document.getElementById("searchResults");


    /* ==========================================
       Clear Previous Results
    ========================================== */

    resultsPanel.innerHTML = "";


    /* ==========================================
       Empty Search
    ========================================== */

    if(keyword === ""){

        resultsPanel.style.display = "none";

        return;

    }


    /* ==========================================
       Find Matching Members
    ========================================== */

    const matches =

        App.family.filter(person => {

            const name =
                (person.name || "")
                .toLowerCase();

            const contact =
                (person.contact || "")
                .toLowerCase();


            return (

                name.includes(keyword)

                ||

                contact.includes(keyword)

            );

        });


    /* ==========================================
       No Results
    ========================================== */

    if(matches.length === 0){

        resultsPanel.innerHTML =

            `<div class="searchNoResults">
                No family member found.
             </div>`;

        resultsPanel.style.display = "block";

        return;

    }


    /* ==========================================
       Create Search Results
    ========================================== */

    matches.forEach(person => {

        const result =
            document.createElement("div");

        result.className =
            "searchResult";


        /* ======================================
           Store Internal Member ID
        ====================================== */

        result.dataset.memberId =
            person.memberId || "";


        /* ======================================
           Name
        ====================================== */

        const name =
    document.createElement("div");

name.className =
    "searchResultName";


const memberName =
    person.name || "Unknown";


const lowerName =
    memberName.toLowerCase();


const matchIndex =
    lowerName.indexOf(keyword);


if(matchIndex >= 0){

    const before =
        memberName.substring(
            0,
            matchIndex
        );


    const match =
        memberName.substring(
            matchIndex,
            matchIndex + keyword.length
        );


    const after =
        memberName.substring(
            matchIndex + keyword.length
        );


    name.innerHTML =

        before +

        "<span class='searchMatch'>" +

        match +

        "</span>" +

        after;

}
else{

    name.textContent =
        memberName;

}

        /* ======================================
           Contact
        ====================================== */

        const contact =
            document.createElement("div");

        contact.className =
            "searchResultContact";

        contact.textContent =
            person.contact ||
            "No contact number";


        /* ======================================
           Relationship
        ====================================== */

        const relationship =
            document.createElement("div");

        relationship.className =
            "searchResultRelationship";


        let relationshipText =
            "Family Member";


        if(person.spouse){

            if(person.gender === "Female"){

                relationshipText =
                    "Wife of " +
                    (person.spouse.name || "");

            }
            else{

                relationshipText =
                    "Husband of " +
                    (person.spouse.name || "");

            }

        }
        else if(person.parent){

            relationshipText =
                "Child of " +
                (person.parent.name || "");

        }


        relationship.textContent =
            relationshipText;


        /* ======================================
           Build Result
        ====================================== */

        result.appendChild(name);

        result.appendChild(contact);

        result.appendChild(relationship);


        /* ======================================
           CLICK RESULT
        ====================================== */

        result.addEventListener(
            "click",
            function(){

                /*
                 * We already know which person
                 * this result represents.
                 */

                const selectedPerson =
                    person;


                /* Store selected person */

                App.selectedMember =
                    selectedPerson;


                /* Hide search results */

                resultsPanel.innerHTML = "";

                resultsPanel.style.display =
                    "none";


                /* ==================================
                   Find Person Card
                ================================== */

                const cards =
                    document.querySelectorAll(
                        ".personCard"
                    );


                let selectedCard =
                    null;


                cards.forEach(card => {

                    if(
                        card.dataset.memberId ===
                        selectedPerson.memberId
                    ){

                        selectedCard =
                            card;

                    }

                });


                if(!selectedCard){

                    console.warn(
                        "Selected member card not found:",
                        selectedPerson.memberId
                    );

                    return;

                }


                /* ==================================
                   Remove Previous Selection
                ================================== */

                document
                    .querySelectorAll(
                        ".personCard.selected"
                    )
                    .forEach(card => {

                        card.classList.remove(
                            "selected"
                        );

                    });


                /* ==================================
                   Select Card
                ================================== */

                selectedCard.classList.add(
                    "selected"
                );


                /* ==================================
                   Relationship Highlight
                ================================== */

                if(
                    typeof highlightFamilyContext ===
                    "function"
                ){

                    highlightFamilyContext(
                        selectedPerson
                    );

                }


                /* ==================================
                   Member Details
                ================================== */

                if(
                    typeof showMemberDetails ===
                    "function"
                ){

                    showMemberDetails(
                        selectedCard
                    );

                }


                /* ==================================
                   Locate Member
                ================================== */

                selectedCard.scrollIntoView({

                    behavior:"smooth",

                    block:"center",

                    inline:"center"

                });

            }
        );


        /* ======================================
           Add Result
        ====================================== */

        resultsPanel.appendChild(
            result
        );

    });


    /* ==========================================
       Show Results
    ========================================== */

    resultsPanel.style.display =
        "block";

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