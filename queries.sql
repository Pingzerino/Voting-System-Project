-- Insert

-- Update
/*UPDATE Voter
SET PostalCode = 'V5H0H3', StreetAddress = '4670 Assembly Wy'
WHERE SIN = 123456789;
*/

UPDATE Voter
SET Voted? = True;
WHERE SIN = 123456789;

-- Delete
CREATE PROCEDURE SomeName(@UserStart ID) 
AS BEGIN

DELETE FROM Riding WHERE ID = @UserStart

-- Selection 
SELECT PartyName
FROM Party

-- Projection
SELECT PartyName, Incumbent?
FROM Party

-- Join
SELECT Voter.FullName, Riding.Name FROM Voter, Candidate, Riding WHERE Voter.SIN = Candidate.SIN AND Candidate.Riding_ID = Riding.ID AND Riding.ID = ${given Value};

SELECT Voter.FullName FROM Voter, Candidate WHERE Voter.SIN = Candidate.SIN and Candidate.Riding_ID = 59001;

SELECT Voter.FullName FROM Voter, Candidate, Riding WHERE Voter.SIN = Candidate.SIN AND Candidate.Riding_ID = Riding.ID AND Riding.Name = ${given Value};

-- Group By: Show candidates with the max votes in each riding -> This turns out to not be a group-by aggregation

SELECT Riding.Name, Voter.FullName, c1.votes FROM Voter, Candidate c1, Riding WHERE Voter.SIN = c1.SIN AND c1.Riding_ID = Riding.ID AND c1.Votes = ( SELECT MAX(Votes) FROM Candidate WHERE Candidate.Riding_ID = c1.Riding_ID);

-- Group By 2.0: Show Total number of cast votes for each riding

SELECT Riding.Name, SUM(Votes) FROM Riding, Candidate WHERE Riding.ID = Candidate.Riding_ID GROUP BY Riding.Name;

-- Having

SELECT Voter.Party_PartyName, Count(Voter.SIN) FROM Voter, Candidate, Parliament WHERE Voter.SIN = Candidate.SIN AND Candidate.Parliament_Country <> NULL GROUP BY Voter.Party_PartyName HAVING COUNT(*) > 12

-- Division: Policies that all the parties have in common

SELECT * FROM Policy P WHERE NOT EXISTS ((SELECT Pa.PartyName FROM Party Pa) MINUS (SELECT Po.Party_PartyName FROM Policy Po WHERE P.PolicyName = Po.PolicyName))