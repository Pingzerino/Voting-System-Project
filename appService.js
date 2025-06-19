/*
 * Code was taken from and based on the CPSC 304 sample project that was provided us
 */

const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60,
    maxRows: 1000
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

/* Insert new functions here. */

// Reset the project
async function resetProject() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`START votingApp.sql`, {autoCommit: true});
        } catch (err) {
            console.error("Reset script failed with err: " + err);
            return false;
        }
        return true;
    }).catch(() => {
        return false;
    });
}

// Voter Insert:
async function voterInsert(voter) {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`INSERT INTO PostalCode_City_Province ( PostalCode, City, Province ) VALUES ( :postalCode, :city, :province )`, {postalCode: voter.postalCode, city: voter.city, province: voter.province});
        } catch (error) {
            if(error.errorNum !== 1){ 
                throw error;
            }
        }
        
        await connection.execute('INSERT INTO VOTER ( SIN, Email, FullName, DOB, Voted, Party_PartyName, Role, StreetAddress, PostalCode ) VALUES ( :sin, :email, :fullName, :dob, :voted, :party_PartyName, :role, :streetAddress, :postalCode )', {sin: voter.sin, email: voter.email, fullName: voter.fullName, dob: voter.dob, voted: voter.voted, party_PartyName: voter.party_PartyName, role: voter.role, streetAddress: voter.streetAddress, postalCode: voter.postalCode});
        await connection.commit();

        // {postalCode: voter.postalCode, city: voter.city, province: voter.province}
        // {sin: voter.sin, email: voter.email, fullName: voter.fullName, dob: voter.dob, voted: voter.voted, party_PartyName: voter.party_PartyName, role: voter.role, streetAddress: voter.streetAddress, postalCode: voter.postalCode}

        return true;
    }).catch(() => {
        return false;
    });
}

async function getPollingStationNames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Name FROM PollingStation`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getRidings() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Riding`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getPolicyNames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT PolicyName FROM Policy`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function updateVoter(newData) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Voter WHERE SIN = :sin`, {sin: newData.sin});
        const result2 = await connection.execute(`SELECT * FROM PostalCode_City_Province WHERE PostalCode = :postalCode`, {postalCode: result.rows[0][8]});

        if(newData.fullName !== undefined) {
            await connection.execute(`UPDATE Voter SET FullName = :fullName WHERE SIN = :sin`, {fullName: newData.fullName, sin: newData.sin});
        }
        if(newData.dob !== undefined) {
            await connection.execute(`UPDATE Voter SET DOB = :dob WHERE SIN = :sin`, {dob: newData.dob, sin: newData.sin});
        }
        if(newData.streetAddress !== undefined) {
            await connection.execute(`UPDATE Voter SET StreetAddress = :streetAddress WHERE SIN = :sin`, {streetAddress: newData.streetAddress, sin: newData.sin});
        }
        if(newData.email !== undefined) {
            await connection.execute(`UPDATE Voter SET Email = :email WHERE SIN = :sin`, {email: newData.email, sin: newData.sin});
        }
        if(newData.voted !== undefined) {
            await connection.execute(`UPDATE Voter SET Voted = :voted WHERE SIN = :sin`, {voted: newData.voted, sin: newData.sin});
        }

        if(newData.party_PartyName !== undefined) {
            await connection.execute(`UPDATE Voter SET Party_PartyName = :party_PartyName WHERE SIN = :sin`, {party_PartyName: newData.party_PartyName, sin: newData.sin});
            if(newData.party_PartyName == null) {
                await connection.execute(`UPDATE Voter SET Role = :role WHERE SIN = :sin`, {role: null, sin: newData.sin});
            }
        }
        if(newData.role !== undefined && newData.party_PartyName !== null && (result.rows[0][5] !== null || newData.party_PartyName !== undefined)) {
            await connection.execute(`UPDATE Voter SET Role = :role WHERE SIN = :sin`, {role: newData.role, sin: newData.sin});
        } else if(newData.role !== undefined) {
            return false;
        }

        if(newData.postalCode !== undefined) {
            let newProvince = result2.rows[0][2];
            let newCity = result2.rows[0][1];
            if(newData.province !== undefined) {
                newProvince = newData.province;
            }
            if(newData.city !== undefined) {
                newCity = newData.newCity;
            }
            try {
                await connection.execute(`INSERT INTO PostalCode_City_Province (PostalCode, City, Province) VALUES (:postalCode, :city, :province)`, {postalCode: newData.postalCode, city: newCity, province: newProvince});
            } catch(err) {
                if(err.errorNum !== 1){ 
                    throw err;
                }
            }
            await connection.execute(`UPDATE Voter SET PostalCode = :postalCode WHERE SIN = :sin`, {postalCode: newData.postalCode, sin: newData.sin});
        }

        await connection.commit();
        return true;
    }).catch(() => {
        return false;
    });
}
async function deleteParty(partyNameToDelete) {
    return await withOracleDB(async (connection) => {
        await connection.execute(`DELETE FROM Party WHERE PartyName = :partyName`, {partyName: partyNameToDelete}, {autoCommit: true});
        return true;
    }).catch(() => {
        return false;
    });
}

async function selectRiding(queryString) {
    return await withOracleDB(async (connection) => {

        // let attributes = "";
        // let attributesArr = queryAttributes.split(',');

        // for(const subString of attributesArr) {
        //     if(subString === 'ID') {
        //         attributes += "ID, ";
        //     } else if(subString === 'Population') {
        //         attributes += "Population, ";
        //     } else if(subString === 'Name') {
        //         attributes += "Name, ";
        //     } else if(subString === "Province_Name") {
        //         attributes += "Province_Name, "
        //     }
        // }

        // if(attributes === "") {
        //     attributes = "*";
        // } else {
        //     attributes = attributes.substring(0, attributes.length - 2);
        // }
        
        let finalQuery = "";
        let queryArr = queryString.split(" ");
        const finalQueryObject = new Object();
        let identNum = 0;

        let skips = 0;
        for(let i = 0; i < queryArr.length; i++) {
            if(skips > 0) {
                skips--;
                continue;
            }

            let subString = queryArr[i];

            if(subString === 'ID') {
                finalQuery += "ID";
            } else if(subString === 'Population') {
                finalQuery += "Population";
            } else if(subString === 'Name') {
                finalQuery += "Name";
            } else if(subString === "Province_Name") {
                finalQuery += "Province_Name";
            } else {
                // Error: not a valid string
                return false;
            }

            if(i+1 >= queryArr.length) {
                return false;
            }
            
            const operator = queryArr[i+1];
            if(operator === '=') {
                finalQuery += ' = ';
            } else if(operator === '<>') {
                finalQuery += ' <> ';
            } else if(operator === '!=') {
                finalQuery += ' != ';
            } else if(operator === '>') {
                finalQuery += ' > ';
            } else if(operator === '>=') {
                finalQuery += ' >= ';
            } else if(operator === '<') {
                finalQuery += ' < ';
            } else if(operator === '<>') {
                finalQuery += ' <= ';
            } else {
                // Error
                return false;
            }

            skips++;

            if(i+2 >= queryArr.length) {
                return false;
            }

            let searchSubstring = "";
            if(queryArr[i+2].substring(0,1) == "'" || queryArr[i+2].substring(0,1) == '"' || queryArr[i+2].substring(0,1) == "`") {
                const endingChar = queryArr[i+2].substring(0,1);
                
                let successfullyFound = false;

                for(let j = 2; i+j < queryArr.length; j++) {
                    let currString = queryArr[i+j];

                    searchSubstring += currString + " ";
                    skips++;

                    if(currString.substring(currString.length - 1, currString.length) === endingChar) {
                        successfullyFound = true;
                        break;
                    }
                }

                if(!successfullyFound) {
                    // Bad User String
                    return false;
                }

                searchSubstring = searchSubstring.substring(1, searchSubstring.length - 2);
                
            } else {
                searchSubstring += queryArr[i+2];
                skips++;
            }

            if(subString === 'ID') {
                finalQuery += ":id" + identNum;
                finalQueryObject['id' + identNum] = searchSubstring;
            } else if(subString === 'Population') {
                finalQuery += ":population" + identNum;
                finalQueryObject['population' + identNum] = searchSubstring;
            } else if(subString === 'Name') {
                finalQuery += ":name" + identNum;
                finalQueryObject['name' + identNum] = searchSubstring;
            } else if(subString === "Province_Name") {
                finalQuery += ":province_name" + identNum;
                finalQueryObject['province_name' + identNum] = searchSubstring;
            }

            identNum++;

            if(i + skips + 1 < queryArr.length) {
                const conjunctive = queryArr[i + skips + 1];

                if(conjunctive == "AND") {
                    finalQuery += " AND ";
                    skips++;
                } else if(conjunctive == "OR") {
                    finalQuery += "OR";
                    skips++;
                } else {
                    // Error: if more exists, it needs to be one of these two.
                    return false;
                }
            }
        }
    
        let where = "";
        if(finalQuery !== "") {
            where = " WHERE ";
        }

        const result = await connection.execute(`SELECT * FROM Riding` + where + finalQuery, finalQueryObject);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getVoters() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Voter');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getParty(queryString) {
    return await withOracleDB(async (connection) => {

        let projectionParams = "";
        const projectionParamsArr = queryString.split(',');

        for(let substring of projectionParamsArr) {
            if(substring === "PartyName") {
                projectionParams += "PartyName, ";
            } else if(substring === "FoundingYear") {
                projectionParams += "FoundingYear, ";
            } else if(substring === "Incumbent") {
                projectionParams += "Incumbent, ";
            } else {
                // Bad entry
                return false;
            }
        }

        if(projectionParams === "") {
            projectionParams = "*";
        } else {
            projectionParams = projectionParams.substring(0 , projectionParams.length - 2);
        }

        const result = await connection.execute(`SELECT ` + projectionParams + ` FROM Party`);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getCandidatesInRiding(pollingStationgName) {
    return await withOracleDB(async (connection) => {
        
        const result = await connection.execute(`SELECT Voter.FullName, Voter.SIN FROM Voter, Candidate, PollingStation WHERE Voter.SIN = Candidate.SIN AND Candidate.Riding_ID = PollingStation.Riding_ID AND PollingStation.Name = :polling_station_name`, {polling_station_name: pollingStationgName});

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function groupBy() {
    console.log("in groupBy");
    return await withOracleDB(async (connection) => {
        
        const result = await connection.execute(`SELECT Riding.Name, SUM(Votes) FROM Riding, Candidate WHERE Riding.ID = Candidate.Riding_ID GROUP BY Riding.Name`);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function having() {
    console.log("service");
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Voter.Party_PartyName, Count(Voter.SIN) FROM Voter, Candidate, Parliament WHERE Voter.SIN = Candidate.SIN AND (Candidate.Parliament_Country IS NOT NULL) GROUP BY Voter.Party_PartyName HAVING COUNT(*) > 12`);
        console.log(result);
        return result.rows;
    }).catch(() => {
        return false;
    });
}

// TODO
async function nestedGroupBy() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Riding r WHERE r.Population > (SELECT AVG(r2.Population)FROM Riding r2 WHERE r2.Province_Name = r.Province_Name GROUP BY r2.Province_Name)`);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function division() {
    console.log("dividing");
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Policy P WHERE NOT EXISTS ((SELECT Pa.PartyName FROM Party Pa) MINUS (SELECT Po.Party_PartyName FROM Policy Po WHERE P.PolicyName = Po.PolicyName))`);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getPolicies() {
    return await withOracleDB(async (connection) => {
    
        const result = await connection.execute(`SELECT * FROM Policy`);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function castVote(voterSIN, candidateSIN, pollingStationName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Voted FROM Voter WHERE SIN = :voter_SIN`, {voter_SIN: voterSIN});
        let candidateName = await connection.execute(`SELECT FullName FROM Voter WHERE SIN = :candidate_SIN`, {candidate_SIN: candidateSIN});
        candidateName = candidateName.rows[0][0];

        const result2 = await connection.execute(`SELECT SIN FROM PollingStation, Candidate WHERE PollingStation.Name = :polling_station_name AND Candidate.Riding_ID = PollingStation.Riding_ID AND Candidate.SIN = :sin`, {polling_station_name: pollingStationName, sin: candidateSIN});

        try {
            if(result.rows[0][0] != 0) {
                // Already voted, can't vote again
                return false;
            }
        } catch (error) {
            return false;
        }
        

        try {
            if(result2.rows[0][0] != candidateSIN) {
                return false;
            }
        } catch (error) {
            return false;
        }

        await connection.execute(`UPDATE Voter SET Voted = 1 WHERE SIN = :voter_SIN`, {voter_SIN: voterSIN});
        await connection.execute(`UPDATE Candidate SET Votes = Votes + 1 WHERE SIN = :candidate_SIN`, {candidate_SIN: candidateSIN});
        await connection.execute(`INSERT INTO Ballot (ID, Choice, Voter_SIN, PollingStation_Name) VALUES (NULL, :candidate_name, :voter_SIN, :polling_station_name)`, {candidate_name: candidateName, voter_SIN: voterSIN, polling_station_name: pollingStationName});
        await connection.commit();

        return true;
    }).catch(() => {
        return false;
    });
}

async function templateFunction() {
    return await withOracleDB(async (connection) => {
        
    }).catch(() => {
        return false;
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    // Start of project entries
    resetProject,
    voterInsert,
    getPollingStationNames,
    getPolicyNames,
    updateVoter,
    deleteParty,
    selectRiding,
    getVoters,
    getParty,
    getCandidatesInRiding,
    groupBy,
    having,
    nestedGroupBy,
    division,
    getPolicies,
    getRidings,
    castVote
};