/* =====================================================
   Bhutada Family Tree
   Version : 4.0.1
   File    : tree.js
===================================================== */


/* ============================================
   Build Complete Family Tree
============================================ */

function buildFamilyTree(){

    App.memberMap.clear();
    App.familyMap.clear();

    /* ----------------------------------------
       Build Member Map
    ---------------------------------------- */

    App.family.forEach(person=>{

        const info = MemberID.parse(person.memberId);

        /* ----- Normalise Data ----- */

        person.role = info.role;
        person.generation = info.generation;

        person.parent = null;
        person.spouse = null;
        person.children = [];

        person.expanded = false;

        /* ----- Store Parsed Info ----- */

        person.memberInfo = info;

        App.memberMap.set(

            person.memberId,

            person

        );

    });


    /* ----------------------------------------
       Link Spouses
    ---------------------------------------- */

    App.family.forEach(person=>{

        if(person.role!=="Member")
            return;

        const spouse = App.memberMap.get(

            person.memberInfo.spouseId

        );

        if(spouse){

            person.spouse = spouse;
            spouse.spouse = person;

        }

    });


    /* ----------------------------------------
       Link Parent & Children
    ---------------------------------------- */

    App.family.forEach(person=>{

        if(person.role!=="Member")
            return;

        if(person.memberInfo.isRoot)
            return;

        const parent = App.memberMap.get(

            person.memberInfo.parentId

        );

        if(!parent)
            return;

        person.parent = parent;

        parent.children.push(person);

    });


    /* ----------------------------------------
       Sort Children
    ---------------------------------------- */

    App.family.forEach(person=>{

        person.children.sort((a,b)=>{

            return MemberID.compare(

                a.memberId,

                b.memberId

            );

        });

    });


    /* ----------------------------------------
       Build Family Map
    ---------------------------------------- */

    App.family.forEach(person=>{

        if(person.role!=="Member")
            return;

        App.familyMap.set(

            person.memberId,

            person.children

        );

    });


    /* ----------------------------------------
       Locate Root
    ---------------------------------------- */

    App.rootMember = App.memberMap.get(

        "10000M"

    );

    if(!App.rootMember){

        throw new Error(

            "Root Member (10000M) not found."

        );

    }

}



/* ============================================
   Expand All
============================================ */

function expandAll(){

    App.family.forEach(person=>{

        person.expanded = true;

    });

}



/* ============================================
   Collapse All
============================================ */

function collapseAll(){

    App.family.forEach(person=>{

        person.expanded = false;

    });

    if(App.rootMember){

        App.rootMember.expanded = false;

    }

}



/* ============================================
   Find Member
============================================ */

function findMemberById(memberId){

    return App.memberMap.get(memberId);

}



/* ============================================
   Find By Name
============================================ */

function findMemberByName(name){

    const search =

        name.trim().toLowerCase();

    return App.family.find(person=>

        person.name

        .toLowerCase()

        .includes(search)

    );

}