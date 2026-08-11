/* =====================================================
   Bhutada Family Tree
   Version : 4.0.0
   File    : data.js
===================================================== */


/* ============================================
   Load Family Database
============================================ */

async function loadFamilyData(){

    const response = await fetch("data/family.json");

    if(!response.ok){

        throw new Error("Unable to load family.json");

    }

    const family = await response.json();

    validateFamilyData(family);

    sortFamilyData(family);

    return family;

}


/* ============================================
   Validate Database
============================================ */

function validateFamilyData(family){

    if(!Array.isArray(family)){

        throw new Error("family.json is not an Array.");

    }

    family.forEach((person,index)=>{

        if(!person.memberId){

            console.warn(

                "Missing Member ID at row",

                index+1

            );

        }

        if(!person.name){

            console.warn(

                "Missing Name at row",

                index+1

            );

        }

        if(!person.role){

            console.warn(

                "Missing Role at row",

                index+1

            );

        }

        if(person.generation==null){

            console.warn(

                "Missing Generation at row",

                index+1

            );

        }

    });

}


/* ============================================
   Sort Family
============================================ */

function sortFamilyData(family){

    family.sort((a,b)=>{

        return a.memberId.localeCompare(b.memberId);

    });

}