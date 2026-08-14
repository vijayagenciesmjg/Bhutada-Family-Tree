/* =====================================================
   Bhutada Family Tree
   Version : 4.0.2
   File    : renderer.js
===================================================== */

/* ============================================
   Render Application
============================================ */

function renderApplication() {

    const canvas = document.getElementById("treeCanvas");

    canvas.innerHTML = "";

    if (!App.rootMember) {

        canvas.innerHTML =
            "<h2>Root Member not found.</h2>";

        return;

    }

    const rootTree = createTree(App.rootMember);

    canvas.appendChild(rootTree);

}


/* ============================================
   Create Tree
============================================ */

function createTree(member) {

    const node = document.createElement("div");
    node.className = "treeNode";

    if (member.children.length === 0) {
        node.classList.add("leaf");
    }

    // Family Unit (Member + Spouse)
    const familyUnit = createFamilyUnit(member);
    node.appendChild(familyUnit);

    // Children
    if (member.expanded && member.children.length > 0) {

        const childrenContainer = document.createElement("div");
        childrenContainer.className = "children";

        member.children.forEach(child => {

            const childTree = createTree(child);

            childrenContainer.appendChild(childTree);

        });

        node.appendChild(childrenContainer);

    }

    return node;

}

/* ============================================
   Family Unit
============================================ */

function createFamilyUnit(member) {

    const unit = document.createElement("div");
    unit.className = "familyUnit";

    /* Expand Button */

    const btn = document.createElement("button");
    btn.className = "toggleButton";

    if (member.children.length === 0) {

        btn.textContent = "";
        btn.disabled = true;

    } else {

        btn.textContent = member.expanded ? "−" : "+";

        btn.onclick = (e) => {

            e.stopPropagation();

            member.expanded = !member.expanded;

            renderApplication();

            updateTreeTransform();

        };

    }

    unit.appendChild(btn);

    /* Member Card */

    const memberCard = createPersonCard(member, true);
    unit.appendChild(memberCard);

    /* Spouse Card */

    if (member.spouse) {

        const spouseCard = createPersonCard(member.spouse, false);
        unit.appendChild(spouseCard);

    }

    return unit;

}

function findPersonCard(memberId){

    if(!memberId)
        return null;


    return document.querySelector(
        `.personCard[data-member-id="${memberId}"]`
    );

}

function highlightFamilyContext(person){

    /* Remove previous relationship highlighting */

    document
        .querySelectorAll(
            ".personCard.relationship-spouse, " +
            ".personCard.relationship-parent, " +
            ".personCard.relationship-child"
        )
        .forEach(card => {

            card.classList.remove(
                "relationship-spouse",
                "relationship-parent",
                "relationship-child"
            );

        });


    if(!person)
        return;


    /* Highlight Spouse */

    if(person.spouse){

        const spouseCard =
            findPersonCard(person.spouse.memberId);

        if(spouseCard){

            spouseCard.classList.add(
                "relationship-spouse"
            );

        }

    }


    /* Highlight Parent */

    if(person.parent){

        const parentCard =
            findPersonCard(person.parent.memberId);

        if(parentCard){

            parentCard.classList.add(
                "relationship-parent"
            );

        }

    }


    /* Highlight Children */

    if(Array.isArray(person.children)){

        person.children.forEach(child => {

            const childCard =
                findPersonCard(child.memberId);

            if(childCard){

                childCard.classList.add(
                    "relationship-child"
                );

            }

        });

    }

}

/* ============================================
   Person Card
============================================ */

function createPersonCard(person, isMember){

    const card = document.createElement("div");

    card.className = "personCard";

    if(isMember)
        card.classList.add("member");
    else
        card.classList.add("spouse");



    /* ==========================================
       Store Member Information
    ========================================== */

    card.dataset.name = person.name || "";

    card.dataset.memberId = person.memberId || "";

    card.dataset.role = person.role || "";

    card.dataset.gender = person.gender || "";

    card.dataset.generation = person.generation || "";

    card.dataset.contact = person.contact || "";

    card.dataset.dob = person.dob || "";

    card.dataset.doa = person.doa || "";

    card.dataset.dod = person.dod || "";



    /* ==========================================
       Card Layout
    ========================================== */

    card.innerHTML =

        "<div class='personName'>"

        + person.name +

        "</div>";



    /* ==========================================
   Click Event
========================================== */

card.addEventListener(

    "click",

    function(e){

        e.stopPropagation();


        /* Remove previous selection */

        document
            .querySelectorAll(".personCard.selected")
            .forEach(card => {

                card.classList.remove("selected");

            });


        /* Highlight current member */

        this.classList.add("selected");


        /* Find selected person in application data */

        const person =
            App.family.find(
                item =>
                    item.memberId ===
                    this.dataset.memberId
            );


        /* Highlight immediate family */

        highlightFamilyContext(person);


        /* Show member details */

        if(typeof showMemberDetails === "function"){

            showMemberDetails(this);

        }

    }

);



    return card;

}