/* =====================================================
   Bhutada Family Tree
   Version : 4.0.2
   File    : renderer.js
===================================================== */

/* ============================================
   Render Application
============================================ */

function renderApplication() {

    const canvas =
        document.getElementById("treeCanvas");

    const wrapper =
        document.getElementById("treeWrapper");


    /* ==========================================
       Relationship Connector Layer
    ========================================== */

    let connectorLayer =
        document.getElementById(
            "relationshipConnectorLayer"
        );


    if (!connectorLayer){

        connectorLayer =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );


        connectorLayer.id =
            "relationshipConnectorLayer";


        connectorLayer.setAttribute(
            "aria-hidden",
            "true"
        );


        wrapper.insertBefore(
            connectorLayer,
            canvas
        );

    }


    /* Clear previous connectors */

    connectorLayer.innerHTML = "";


    canvas.innerHTML = "";


    if (!App.rootMember) {
        canvas.innerHTML =
            "<h2>Root Member not found.</h2>";

        return;

    }

    const rootTree = createTree(App.rootMember);

    canvas.appendChild(rootTree);

    requestAnimationFrame(() => {

        drawAllSpouseConnectors();

});

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


function drawSpouseConnector(
    connectorLayer,
    memberCard,
    spouseCard
){

    if(
        !connectorLayer ||
        !memberCard ||
        !spouseCard
    ){

        return;

    }


    const memberRect =
        memberCard.getBoundingClientRect();


    const spouseRect =
        spouseCard.getBoundingClientRect();


    const wrapper =
        document.getElementById(
            "treeWrapper"
        );


    if(!wrapper){

        return;

    }


    const wrapperRect =
        wrapper.getBoundingClientRect();


    /*
       Convert viewport coordinates
       into tree-wrapper coordinates.
    */

    const memberRight =
        memberRect.right -
        wrapperRect.left;


    const spouseLeft =
        spouseRect.left -
        wrapperRect.left;


    const memberCenterY =
        (
            memberRect.top +
            memberRect.bottom
        ) / 2 -
        wrapperRect.top;


    const spouseCenterY =
        (
            spouseRect.top +
            spouseRect.bottom
        ) / 2 -
        wrapperRect.top;


    /*
       Use the shared vertical center
       of the two cards.
    */

    const lineY =
        (
            memberCenterY +
            spouseCenterY
        ) / 2;


    /*
       Do not draw if cards overlap
       or there is no space between them.
    */

    if(spouseLeft <= memberRight){

        return;

    }


    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "x1",
        memberRight
    );


    line.setAttribute(
        "y1",
        lineY
    );


    line.setAttribute(
        "x2",
        spouseLeft
    );


    line.setAttribute(
        "y2",
        lineY
    );


    line.setAttribute(
        "class",
        "relationshipLine spouseLine"
    );


    connectorLayer.appendChild(
        line
    );

}

function drawAllSpouseConnectors(){

    const connectorLayer =
        document.getElementById(
            "relationshipConnectorLayer"
        );


    if(!connectorLayer){

        return;

    }


    /* Clear existing connector lines */

    connectorLayer.innerHTML = "";


    /*
       Find every rendered Family Unit.
       Each Family Unit contains:
       .member
       .spouse
    */

    document
        .querySelectorAll(".familyUnit")
        .forEach(unit => {


            const memberCard =
                unit.querySelector(
                    ".personCard.member"
                );


            const spouseCard =
                unit.querySelector(
                    ".personCard.spouse"
                );

            const childGroup =
                unit.parentElement
                    ?.querySelector(
                    ":scope > .children"
                );


            /*
               A family without a spouse
               has no spouse connector.
            */

            if(
                !memberCard ||
                !spouseCard
            ){

                return;

            }

            if(childGroup){

    drawParentVerticalConnector(
        connectorLayer,
        memberCard,
        spouseCard,
        childGroup
    );


    drawChildrenHorizontalConnector(
        connectorLayer,
        memberCard,
        spouseCard,
        childGroup
    );

    drawChildVerticalConnectors(
        connectorLayer,
        memberCard,
        spouseCard,
        childGroup
    );

}


            drawSpouseConnector(
                connectorLayer,
                memberCard,
                spouseCard
            );

        });

}

function getChildrenConnectorY(
    memberCard,
    spouseCard,
    childGroup
){

    if(
        !memberCard ||
        !spouseCard ||
        !childGroup
    ){

        return null;

    }


    const wrapper =
        document.getElementById(
            "treeWrapper"
        );


    if(!wrapper){

        return null;

    }


    const wrapperRect =
        wrapper.getBoundingClientRect();


    const memberRect =
        memberCard.getBoundingClientRect();


    const spouseRect =
        spouseCard.getBoundingClientRect();


    /*
       Find actual child cards.
    */

    const childNodes =
        Array.from(
            childGroup.children
        );


    const childCards =
        childNodes
            .map(childNode =>
                childNode.querySelector(
                    ":scope > .familyUnit > .personCard.member"
                )
            )
            .filter(Boolean);


    if(!childCards.length){

        return null;

    }


    const childRects =
        childCards.map(card =>
            card.getBoundingClientRect()
        );


    /*
       Bottom of the Parent Cards.
    */

    const parentBottom =
        Math.max(
            memberRect.bottom,
            spouseRect.bottom
        ) -
        wrapperRect.top;


    /*
       Top of the Child Cards.
    */

    const childTop =
        Math.min(
            ...childRects.map(
                rect => rect.top
            )
        ) -
        wrapperRect.top;


    /*
       Exact midpoint between
       Parent Bottom and Child Top.
    */

    return (
        parentBottom +
        childTop
    ) / 2;

}


function drawParentVerticalConnector(
    connectorLayer,
    memberCard,
    spouseCard,
    childGroup
){

    if(
        !connectorLayer ||
        !memberCard ||
        !spouseCard ||
        !childGroup
    ){

        return;

    }


    const memberRect =
        memberCard.getBoundingClientRect();


    const spouseRect =
        spouseCard.getBoundingClientRect();


    /*
    const childGroupRect =
        childGroup.getBoundingClientRect();
    */


    const wrapper =
        document.getElementById(
            "treeWrapper"
        );


    if(!wrapper){

        return;

    }


    const wrapperRect =
        wrapper.getBoundingClientRect();


    /*
       Right edge of Member
       and left edge of Spouse.
    */

    const memberRight =
        memberRect.right -
        wrapperRect.left;


    const spouseLeft =
        spouseRect.left -
        wrapperRect.left;


    /*
       Exact center of the spouse
       horizontal connector.
    */

    const connectorCenterX =
        (
            memberRight +
            spouseLeft
        ) / 2;


    /*
       Bottom of the spouse connector.

       The spouse connector is centered
       vertically on the two cards.
    */

    const memberCenterY =
        (
            memberRect.top +
            memberRect.bottom
        ) / 2 -
        wrapperRect.top;


    const spouseCenterY =
        (
            spouseRect.top +
            spouseRect.bottom
        ) / 2 -
        wrapperRect.top;


    const spouseLineY =
        (
            memberCenterY +
            spouseCenterY
        ) / 2;


    /*
   Bottom of the Parent Cards
*/

const parentBottom =
    Math.max(
        memberRect.bottom,
        spouseRect.bottom
    ) -
    wrapperRect.top;

/*
const childrenTop =
    childGroupRect.top -
    wrapperRect.top;

    if(childrenTop <= spouseLineY){

    return;

}
*/

const childrenConnectorY =
    getChildrenConnectorY(
        memberCard,
        spouseCard,
        childGroup
    );


if(
    childrenConnectorY === null ||
    childrenConnectorY <= spouseLineY
){

    return;

}


const line =
    document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );


line.setAttribute(
    "x1",
    connectorCenterX
);

line.setAttribute(
    "y1",
    spouseLineY
);

line.setAttribute(
    "x2",
    connectorCenterX
);

line.setAttribute(
    "y2",
    childrenConnectorY
);

    line.setAttribute(
        "class",
        "relationshipLine parentVerticalLine"
    );


    connectorLayer.appendChild(
        line
    );

}

function drawChildrenHorizontalConnector(
    connectorLayer,
    memberCard,
    spouseCard,
    childGroup
){

    if(
        !connectorLayer ||
        !childGroup
    ){

        return;

    }

    const memberRect =
        memberCard.getBoundingClientRect();


    const spouseRect =
        spouseCard.getBoundingClientRect();

    const childNodes =
        Array.from(
            childGroup.children
        );


    if(
        childNodes.length < 2
    ){

        return;

    }


    const wrapper =
        document.getElementById(
            "treeWrapper"
        );


    if(!wrapper){

        return;

    }


    const wrapperRect =
        wrapper.getBoundingClientRect();


    /*
       Get the first and last
       actual child family units.
    */

    const firstChildUnit =
        childNodes[0]
            .querySelector(
                ":scope > .familyUnit"
            );


    const lastChildUnit =
        childNodes[
            childNodes.length - 1
        ]
            .querySelector(
                ":scope > .familyUnit"
            );


    if(
        !firstChildUnit ||
        !lastChildUnit
    ){

        return;

    }


    /*
       Find the first card of each
       child family unit.

       The horizontal connector
       terminates at the TOP CENTER
       of the child card.
    */

    const firstChildCard =
        firstChildUnit.querySelector(
            ".personCard.member"
        );


    const lastChildCard =
        lastChildUnit.querySelector(
            ".personCard.member"
        );


    if(
        !firstChildCard ||
        !lastChildCard
    ){

        return;

    }


    const firstRect =
        firstChildCard.getBoundingClientRect();


    const lastRect =
        lastChildCard.getBoundingClientRect();


    const firstCenterX =
        (
            firstRect.left +
            firstRect.right
        ) / 2 -
        wrapperRect.left;


    const lastCenterX =
        (
            lastRect.left +
            lastRect.right
        ) / 2 -
        wrapperRect.left;


    /*
       Both cards belong to the same
       generation, so use the top
       position of the child cards.
    */

    /*
    const firstTop =
        firstRect.top -
        wrapperRect.top;


    const lastTop =
        lastRect.top -
        wrapperRect.top;
    */


    /*
    const parentBottom =
        Math.max(
            memberRect.bottom,
            spouseRect.bottom
        ) - wrapperRect.top;
    

    const childTop =
        Math.min(
            firstRect.top,
            lastRect.top
        ) - wrapperRect.top;


    const lineY =
        (
            parentBottom +
            childTop
        ) / 2;
    */

    const lineY =
    getChildrenConnectorY(
        memberCard,
        spouseCard,
        childGroup
    );


    if(lineY === null){

        return;

    }
    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "x1",
        firstCenterX
    );


    line.setAttribute(
        "y1",
        lineY
    );


    line.setAttribute(
        "x2",
        lastCenterX
    );


    line.setAttribute(
        "y2",
        lineY
    );


    line.setAttribute(
        "class",
        "relationshipLine childrenHorizontalLine"
    );


    connectorLayer.appendChild(
        line
    );

}

function drawChildVerticalConnectors(
    connectorLayer,
    memberCard,
    spouseCard,
    childGroup
){

    if(
        !connectorLayer ||
        !memberCard ||
        !spouseCard ||
        !childGroup
    ){

        return;

    }


    const wrapper =
        document.getElementById(
            "treeWrapper"
        );


    if(!wrapper){

        return;

    }


    const wrapperRect =
        wrapper.getBoundingClientRect();


    /*
       Get the shared parent/child
       junction Y-coordinate.
    */

    const connectorY =
        getChildrenConnectorY(
            memberCard,
            spouseCard,
            childGroup
        );


    if(connectorY === null){

        return;

    }


    /*
       Find all direct child
       Member Cards.
    */

    const childNodes =
        Array.from(
            childGroup.children
        );


    childNodes.forEach(childNode => {


        const childCard =
            childNode.querySelector(
                ":scope > .familyUnit > .personCard.member"
            );


        if(!childCard){

            return;

        }


        const childRect =
            childCard.getBoundingClientRect();


        /*
           Top-center of the actual
           child Member Card.
        */

        const childCenterX =
            (
                childRect.left +
                childRect.right
            ) / 2 -
            wrapperRect.left;


        const childTop =
            childRect.top -
            wrapperRect.top;


        /*
           Don't draw an invalid
           upward connector.
        */

        if(childTop <= connectorY){

            return;

        }


        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            childCenterX
        );


        line.setAttribute(
            "y1",
            connectorY
        );


        line.setAttribute(
            "x2",
            childCenterX
        );


        line.setAttribute(
            "y2",
            childTop
        );


        line.setAttribute(
            "class",
            "relationshipLine childVerticalLine"
        );


        connectorLayer.appendChild(
            line
        );

    });

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