/*
 * Code has elements that are based on a sample project that was provided to us.
 */

const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

/* Project Code: */

// Reset App: This doesn't work, can't run START file.sql from JS execute.
// router.get('/resetApp', async (req, res) => {
//     const result = await appService.resetProject();
//     if(result) {
//         res.json({success: true});
//     } else {
//         res.status(500).json({success: false});
//     }
// });

// Insert Voter
router.post('/insertVoter', async (req, res) => {
    const newVoter = req.body;

    // console.log("fullName Type: " + newVoter.fullName + ", " + typeof newVoter.fullName);
    // console.log("postalCode Type: " + newVoter.postalCode + ", " + typeof newVoter.postalCode);
    // console.log("sin Type: " + newVoter.sin + ", " + typeof newVoter.sin);
    // console.log("email Type: " + newVoter.email + ", " + typeof newVoter.email);
    // console.log("dob Type: " + newVoter.dob + ", " + typeof newVoter.dob);
    // console.log("streetAddress Type: " + newVoter.streetAddress + ", " + typeof newVoter.streetAddress);
    // console.log("city Type: " + newVoter.city + ", " + typeof newVoter.city);
    // console.log("province Type: " + newVoter.province + ", " + typeof newVoter.province);
    // console.log("voted Type: " + newVoter.voted + ", " + typeof newVoter.voted);
    // console.log("party_PartyName Type: " + newVoter.party_PartyName + ", " + typeof newVoter.party_PartyName);
    // console.log("role Type: " + newVoter.role + ", " + typeof newVoter.role);

    if((typeof newVoter.fullName) !== 'string' || (typeof newVoter.postalCode) !== 'string' || (typeof newVoter.dob) !== 'string' || (typeof newVoter.province) !== 'string' || (typeof newVoter.streetAddress) !== 'string' || (typeof newVoter.city) !== 'string' || (typeof newVoter.email) !== 'string' || !Number.isSafeInteger(newVoter.sin) || !(Number.isSafeInteger(newVoter.voted) || (typeof newVoter.voted) === 'undefined') || !((typeof newVoter.party_PartyName) === 'string' || newVoter.party_PartyName === null || (typeof newVoter.party_PartyName) === 'undefined' ) || !((typeof newVoter.role) === 'string' || newVoter.role === null || (typeof newVoter.role) === 'undefined')) {
        // Bad input
        res.status(500).json({success: false});
        return;
    }

    if(newVoter.postalCode.length !== 6) {
        res.status(500).json({success: false});
        return;
    }

    if((typeof newVoter.voted) === undefined) newVoter.voted = 0;
    if((typeof newVoter.party_PartyName === undefined)) newVoter.party_PartyName = null;
    if((typeof newVoter.role === undefined)) newVoter.role = null;

    const result = await appService.voterInsert(newVoter);
    if(result) {
        res.json({success: true});
    } else {
        res.status(500).json({success: false});
    }
});

// Get and return a list of all the polling station names
router.get('/getPollingStations', async (req, res) => {
    const result = await appService.getPollingStationNames();
    res.json(result);
});

// Get and return a list of all the ridings
router.get('/getRidings', async (req, res) => {
    const result = await appService.getRidings();
    res.json({data: result});
});

// Get a list of all registered Voters
router.get('/votertable', async (req, res) => {
    const result = await appService.getVoters();
    res.json({data: result});
});

// Update Voter with a patch
router.patch('/updateVoter', async (req, res) => {
    console.log("controller updateVoter");
    const newVoterInfo = req.body;
    if(newVoterInfo.sin === undefined) {
        console.log("voter not found");
        res.status(500).json({success: false});
        return;
    }

    let propertyCount = 0;
    for(const property in newVoterInfo) {
        if(property === 'sin' || property === 'email' || property === 'fullName' || property === 'dob' || property === 'streetAddress' || property === 'voted' || property === 'party_PartyName' || property === 'role' || property === 'postalCode' || property === 'city' || property === 'province') {
            propertyCount++;
        } else {
            res.status(500).json({success: false, error: "invalid property"});
            return;
        }
    }

    if(propertyCount < 2) {
        res.status(500).json({success: false});
        return;
    }

    if('province' in newVoterInfo && !(postalCode in newVoterInfo)) {
        res.status(500).json({success: false});
        return;
    }

    if('city' in newVoterInfo && !(postalCode in newVoterInfo)) {
        res.status(500).json({success: false});
        return;
    }

    const result = await appService.updateVoter(newVoterInfo);
    if(result) {
        res.json({success: true});
    } else {
        res.status(500).json({success: false});
    }
});

// Delete Party
router.delete('/deleteParty/:partyName', async (req, res) => {

    const result = await appService.deleteParty(req.params.partyName);

    if(result) {
        res.json({success: true});
    } else {
        res.status(500).json({success: false});
    }
});

// Selection (Riding) - Please send an object with a parameter named queryString with a string representing the query,
router.post('/riding', async (req, res) => {
    const { queryString } = req.body;

    if((typeof queryString) !== 'string') {
        res.status(500).json({success: false});
        return;
    }

    const result = await appService.selectRiding(queryString);

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }

});

// Projection (Party): send an object with a parameter queryString that has a comma-separated list of attributes to project on
router.post('/projection', async (req, res) =>{
    const { queryString } = req.body;

    const result = await appService.getParty(queryString);

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

// Join returns an array of arrays that each contain a single entry with the candidate name that are running in the given riding
router.get('/join/:pollingStationName', async (req, res) => {
    const result = await appService.getCandidatesInRiding(req.params.pollingStationName);
    console.log("getting candidates");
    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

router.get('/groupBy', async (req, res) => {

    const result = await appService.groupBy();

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

router.get('/having', async (req, res) => {
    console.log("controller");
    const result = await appService.having();

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

router.get('/nestedGroupBy', async (req, res) => {

    const result = await appService.nestedGroupBy();

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

router.get('/division', async (req, res) => {
    console.log("dividing controller");
    const result = await appService.division();

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
});

router.get('/policies', async (req, res) => {

    const result = await appService.getPolicies();

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true, data: result});
    }
})

// Get and return a list of all the policy names
router.get('/getAllPolicyNames', async (req, res) => {
    const result = await appService.getPolicyNames();
    res.json(result);
});

router.post('/vote', async (req, res) => {

    const { voterSIN, candidateSIN, pollingStationName } = req.body;

    const result = await appService.castVote(voterSIN, candidateSIN, pollingStationName);

    if(result === false) {
        res.status(500).json({success: false});
    } else {
        res.json({success: true});
    }
});

// Note that I don't have the projection or join written up yet

module.exports = router;

class Voter {

    fullName;
    postalCode;
    dob;
    province;
    streetAddress;
    city;
    email;
    sin;
    voted;
    party_PartyName;
    role;

    constructor(fullName, sin, email, dateOfBirth, streetAddress, city, province, postalCode, voted = 0, party_PartyName = null, role = null) {
        this.fullName = fullName;
        this.sin = sin;
        this.email = email;
        this.dob = dateOfBirth;
        this.streetAddress = streetAddress;
        this.city = city;
        this.province = province;
        this.postalCode = postalCode;
        this.voted = voted;
        this.party_PartyName = party_PartyName;
        this.role = role;
    }
}