/* =====================================================
   Bhutada Family Tree
   Version : 4.0.1
   File    : utils.js
===================================================== */

class MemberID{

    /* ============================================
       Validate
    ============================================ */

    static validate(memberId){

        if(typeof memberId!=="string")
            return false;

        return /^[0-9]{5}[MS]$/.test(memberId);

    }


    /* ============================================
       Parse
    ============================================ */

    static parse(memberId){

        if(!this.validate(memberId))
            throw new Error("Invalid Member ID : "+memberId);

        const digits = memberId
            .substring(0,5)
            .split("")
            .map(Number);

        const type = memberId.slice(-1);

        const generation =
            digits.filter(d=>d!==0).length;

        return{

            id:memberId,

            digits:digits,

            type:type,

            role:type==="M"
                ? "Member"
                : "Spouse",

            generation:generation,

            isRoot:
                memberId==="10000M",

            spouseId:
                this.getSpouse(memberId),

            parentId:
                this.getParent(memberId),

            path:
                digits.filter(d=>d!==0)

        };

    }


    /* ============================================
       Generation
    ============================================ */

    static getGeneration(memberId){

        return this.parse(memberId).generation;

    }


    /* ============================================
       Root
    ============================================ */

    static isRoot(memberId){

        return memberId==="10000M";

    }


    /* ============================================
       Spouse
    ============================================ */

    static getSpouse(memberId){

        if(!this.validate(memberId))
            return null;

        const digits = memberId.substring(0,5);

        return digits+
            (memberId.endsWith("M")?"S":"M");

    }


    /* ============================================
       Parent
    ============================================ */

    static getParent(memberId){

        if(!this.validate(memberId))
            return null;

        if(memberId==="10000M")
            return null;

        const digits = memberId
            .substring(0,5)
            .split("")
            .map(Number);

        for(let i=4;i>=1;i--){

            if(digits[i]!==0){

                digits[i]=0;

                break;

            }

        }

        return digits.join("")+"M";

    }


    /* ============================================
       Level
    ============================================ */

    static getLevel(memberId){

        return this.getGeneration(memberId);

    }


    /* ============================================
       Path
    ============================================ */

    static getPath(memberId){

        return this.parse(memberId).path;

    }


    /* ============================================
       Compare
    ============================================ */

    static compare(a,b){

        return a.localeCompare(b);

    }

}



/* =====================================================
   Compatibility Functions
   (Existing tree.js can continue using them)
===================================================== */

function isValidMemberId(memberId){

    return MemberID.validate(memberId);

}


function isRootMember(memberId){

    return MemberID.isRoot(memberId);

}


function getMemberType(memberId){

    if(!MemberID.validate(memberId))
        return null;

    return memberId.slice(-1);

}


function getSpouseId(memberId){

    return MemberID.getSpouse(memberId);

}


function getParentId(memberId){

    return MemberID.getParent(memberId);

}


function getGeneration(memberId){

    return MemberID.getGeneration(memberId);

}


function compareMemberId(a,b){

    return MemberID.compare(a,b);

}


function findMember(memberId){

    return App.memberMap.get(memberId);

}