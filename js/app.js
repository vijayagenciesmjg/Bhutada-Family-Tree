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

        const memberId =
            this.dataset.memberId;


        /* Select the member */

        selectMemberById(
            memberId
        );


        /* Hide search results */

        resultsPanel.innerHTML = "";

        resultsPanel.style.display =
            "none";

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

function selectMemberById(memberId){

    if(!memberId)
        return;


    /* ==========================================
       Find Person in Family Data
    ========================================== */

    const person =
        App.family.find(
            member =>
                member.memberId === memberId
        );


    if(!person){

        console.warn(
            "Member not found:",
            memberId
        );

        return;

    }


    /* ==========================================
       Find Rendered Person Card
    ========================================== */

    const cards =
        document.querySelectorAll(
            ".personCard"
        );


    let selectedCard =
        null;


    cards.forEach(card => {

        if(
            card.dataset.memberId ===
            memberId
        ){

            selectedCard =
                card;

        }

    });


    if(!selectedCard){

        console.warn(
            "Member card not currently rendered:",
            memberId
        );

        return;

    }


    /* ==========================================
       Store Selected Member
    ========================================== */

    App.selectedMember =
        person;


    /* ==========================================
       Remove Previous Selection
    ========================================== */

    document
        .querySelectorAll(
            ".personCard.selected"
        )
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    /* ==========================================
       Select Current Card
    ========================================== */

    selectedCard.classList.add(
        "selected"
    );


    /* ==========================================
       Highlight Family Context
    ========================================== */

    if(
        typeof highlightFamilyContext ===
        "function"
    ){

        highlightFamilyContext(
            person
        );

    }


    /* ==========================================
       Show Member Details
    ========================================== */

    showMemberDetails(
        selectedCard
    );


    /* ==========================================
       Locate Member in Tree
    ========================================== */

    selectedCard.scrollIntoView({

        behavior:"instant",

        block:"center",

        inline:"center"

    });

    requestAnimationFrame(() => {

    focusFamilyCamera(person);

});
}

/* ============================================
   Focus Family Members
   Maximum 2 Levels Up
   Maximum 2 Levels Down
============================================ */

function getFocusedFamilyMembers(person){

    if(!person)
        return [];


    const focusedMembers = [];


    /* ==========================================
       Grandparent — 2 Levels Up
    ========================================== */

    if(
        person.parent &&
        person.parent.parent
    ){

        focusedMembers.push(
            person.parent.parent
        );

    }


    /* ==========================================
       Parent — 1 Level Up
    ========================================== */

    if(person.parent){

        focusedMembers.push(
            person.parent
        );

    }


    /* ==========================================
       Selected Member
    ========================================== */

    focusedMembers.push(
        person
    );


    /* ==========================================
       Children — 1 Level Down
    ========================================== */

    if(
        Array.isArray(person.children)
    ){

        person.children.forEach(
            child => {

                focusedMembers.push(
                    child
                );

            }
        );

    }


    /* ==========================================
       Grandchildren — 2 Levels Down
    ========================================== */

    if(
        Array.isArray(person.children)
    ){

        person.children.forEach(
            child => {

                if(
                    Array.isArray(
                        child.children
                    )
                ){

                    child.children.forEach(
                        grandchild => {

                            focusedMembers.push(
                                grandchild
                            );

                        }
                    );

                }

            }
        );

    }


    /* ==========================================
       Remove Duplicate Members
    ========================================== */

    return [
        ...new Map(
            focusedMembers.map(
                member => [
                    member.memberId,
                    member
                ]
            )
        ).values()
    ];

}

/* ============================================
   Calculate Focus Family Bounds
============================================ */

function getFocusedFamilyBounds(members){

    if(
        !Array.isArray(members) ||
        members.length === 0
    ){

        return null;

    }


    const cards = [];


    /* ==========================================
       Find Rendered Cards
    ========================================== */

    members.forEach(member => {

        if(!member || !member.memberId)
            return;


        const card =
            document.querySelector(
                `.personCard[data-member-id="${member.memberId}"]`
            );


        if(card){

            cards.push(card);

        }

    });


    if(cards.length === 0)
        return null;


    /* ==========================================
       Calculate Combined Bounds
    ========================================== */

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;


    cards.forEach(card => {

        const rect =
            card.getBoundingClientRect();


        left =
            Math.min(
                left,
                rect.left
            );


        top =
            Math.min(
                top,
                rect.top
            );


        right =
            Math.max(
                right,
                rect.right
            );


        bottom =
            Math.max(
                bottom,
                rect.bottom
            );

    });


    return {

        left,
        top,
        right,
        bottom,

        width:
            right - left,

        height:
            bottom - top

    };

}

/* ============================================
   Calculate Focus Zoom
============================================ */

function calculateFocusedZoom(bounds){

    if(!bounds)
        return App.zoom;


    const viewport =
        document.getElementById(
            "treeViewport"
        );


    if(!viewport)
        return App.zoom;


    const padding = 80;


    const availableWidth =
        viewport.clientWidth -
        padding;


    const availableHeight =
        viewport.clientHeight -
        padding;


    if(
        availableWidth <= 0 ||
        availableHeight <= 0
    ){

        return App.zoom;

    }


    const widthZoom =
        availableWidth /
        bounds.width;


    const heightZoom =
        availableHeight /
        bounds.height;


    let zoom =
        Math.min(
            widthZoom,
            heightZoom
        );


    /* ==========================================
       Keep Zoom Within Application Limits
    ========================================== */

    zoom =
        Math.max(
            App.minZoom,
            zoom
        );


    zoom =
        Math.min(
            App.maxZoom,
            zoom
        );


    return zoom;

}

/* ============================================
   Apply Focused Family Camera
============================================ */

/* ============================================
   Simple Focus Zoom
============================================ */

/* ============================================
   Simple Focus Zoom + Accurate Centering
============================================ */

function focusFamilyCamera(person){

    if(!person)
        return;


    const viewport =
        document.getElementById(
            "treeViewport"
        );


    if(!viewport)
        return;


    const selectedCard =
        document.querySelector(
            `.personCard[data-member-id="${person.memberId}"]`
        );


    if(!selectedCard)
        return;


    /* ==========================================
       Desired Focus Zoom
    ========================================== */

    const focusZoom = 0.80;


    App.zoom =
        Math.min(
            App.maxZoom,
            focusZoom
        );


    /* ==========================================
       Apply Zoom First
    ========================================== */

    updateTreeTransform();


    /* ==========================================
       Wait Until Browser Applies Zoom
    ========================================== */

    requestAnimationFrame(() => {


        const viewportRect =
            viewport.getBoundingClientRect();


        const cardRect =
            selectedCard.getBoundingClientRect();


        /* ======================================
        Actual Tree Viewport Center
        ====================================== */

const viewportLeft =
    viewportRect.left;

const viewportTop =
    viewportRect.top;

const viewportWidth =
    viewportRect.width;

const viewportHeight =
    viewportRect.height;


/* Center of the ACTUAL Tree viewport */

const viewportCenterX =
    viewportLeft +
    (
        viewportWidth / 2
    );

const viewportCenterY =
    viewportTop +
    (
        viewportHeight / 2
    );


        /* ======================================
           Selected Card Center
        ====================================== */

        const cardCenterX =
            cardRect.left +
            (
                cardRect.width / 2
            );


        const cardCenterY =
            cardRect.top +
            (
                cardRect.height / 2
            );


        /* ======================================
           Difference
        ====================================== */

        const moveX =
            viewportCenterX -
            cardCenterX;


        const moveY =
            viewportCenterY -
            cardCenterY;


        /* ======================================
           Apply Correct Pan
        ====================================== */

        App.panX += moveX;

        App.panY += moveY;


        /* ======================================
           Apply Final Transform
        ====================================== */

        updateTreeTransform();

    });

}

/* ============================================
   Member Details Popup
============================================ */

function showMemberDetails(card){

    /* ==========================================
       Member Name
    ========================================== */

    document
        .getElementById("popupMemberName")
        .textContent =
            card.dataset.name ||
            "Member Details";


    document
        .getElementById("popName")
        .textContent =
            card.dataset.name || "";


    /* ==========================================
       Role
    ========================================== */

    document
        .getElementById("popRole")
        .textContent =
            card.dataset.role || "-";


    /* ==========================================
       Internal Member Lookup
    ========================================== */

    const memberId =
        card.dataset.memberId || "";


    const person =
        App.family.find(
            item =>
                item.memberId === memberId
        );


    /* ==========================================
       Spouse
    ========================================== */

    const spouseId =

        memberId.endsWith("M")

            ? memberId.slice(0, -1) + "S"

            : memberId.endsWith("S")

            ? memberId.slice(0, -1) + "M"

            : "";


    const spouse =

        App.family.find(
            item =>
                item.memberId === spouseId
        );


    const spouseElement =
    document.getElementById("popSpouse");


spouseElement.innerHTML = "";


if(spouse){

    const spouseLink =
        document.createElement("span");


    spouseLink.className =
        "familyLink";


    spouseLink.textContent =
        spouse.name;


    spouseLink.dataset.memberId =
        spouse.memberId;


    spouseLink.addEventListener(
        "click",
        function(){

            selectMemberById(
                this.dataset.memberId
            );

        }
    );


    spouseElement.appendChild(
        spouseLink
    );

}
else{

    spouseElement.textContent =
        "-";

}


    /* ==========================================
       Parents
    ========================================== */

    const parentsElement =
    document.getElementById(
        "popParents"
    );


parentsElement.innerHTML = "";


if(
    person &&
    person.parent
){

    const parentLink =
        document.createElement("span");


    parentLink.className =
        "familyLink";


    parentLink.textContent =
        person.parent.name;


    parentLink.dataset.memberId =
        person.parent.memberId;


    parentLink.addEventListener(
        "click",
        function(){

            selectMemberById(
                this.dataset.memberId
            );

        }
    );


    parentsElement.appendChild(
        parentLink
    );

}
else{

    parentsElement.textContent =
        "-";

}


    /* ==========================================
       Children
    ========================================== */

    const childrenElement =
    document.getElementById(
        "popChildren"
    );


childrenElement.innerHTML = "";


if(
    person &&
    Array.isArray(person.children) &&
    person.children.length > 0
){

    person.children.forEach(
        function(child, index){

            const childLink =
                document.createElement(
                    "span"
                );


            childLink.className =
                "familyLink";


            childLink.textContent =
                child.name;


            childLink.dataset.memberId =
                child.memberId;


            childLink.addEventListener(
                "click",
                function(){

                    selectMemberById(
                        this.dataset.memberId
                    );

                }
            );


            childrenElement.appendChild(
                childLink
            );


            /*
             * Separate multiple children
             */

            if(
                index <
                person.children.length - 1
            ){

                childrenElement.appendChild(
                    document.createTextNode(
                        ", "
                    )
                );

            }

        }
    );

}
else{

    childrenElement.textContent =
        "-";

}


    /* ==========================================
       Contact
    ========================================== */

    document
        .getElementById("popContact")
        .textContent =

            card.dataset.contact || "-";


    /* ==========================================
       Date of Birth
    ========================================== */

    document
        .getElementById("popDOB")
        .textContent =

            card.dataset.dob || "-";


    /* ==========================================
       Anniversary
    ========================================== */

    document
        .getElementById("popDOA")
        .textContent =

            card.dataset.doa || "-";


    /* ==========================================
       Demise
    ========================================== */

    document
        .getElementById("popDOD")
        .textContent =

            card.dataset.dod || "-";


    /* ==========================================
       Show Member Information
    ========================================== */

    document
        .getElementById("emptyMemberMessage")
        .style.display = "none";


    document
        .getElementById("memberDetailsContent")
        .style.display = "block";

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