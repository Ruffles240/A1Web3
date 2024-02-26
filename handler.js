const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://igofqolavpbljmdfaoer.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2Zxb2xhdnBibGptZGZhb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg3NTYxNTYsImV4cCI6MjAyNDMzMjE1Nn0.3MAMTt9Wy0UULKTxyYN1cSPYJ1QGhQfX4L5S3L0-T8w';

const supabase = supa.createClient(supaUrl, supaAnonKey);


// Listens for incoming requests on port 8080 and logs the server status.
app.listen(8080, () => {
    console.log('listening on glitch');
    console.log('http://localhost:8080/f1/status');
});

app.get('*', async (req, res) => {
     res.status(404).json({message: 'Please use the format outlined in the read me'});
});

// Fetches and returns all seasons; returns an error if none are found.
app.get('/api/seasons', async (req, res) => {
    const {data, error} = await supabase.from('seasons').select();
    data.length ? res.json(data) : res.status(404).json({message: 'No seasons available'});
});

// Fetches and returns all circuits; returns an error if none are found.
app.get('/api/circuits', async (req, res) => {
    const {data, error} = await supabase.from('circuits').select();
    data.length ? res.json(data) : res.status(404).json({message: 'No circuits available'});
});

// Fetches and returns a specific circuit by reference; returns an error if not found.
app.get('/api/circuits/:ref', async (req, res) => {
    const {data, error} = await supabase.from('circuits').select().eq('circuitRef', req.params.ref);
    data.length ? res.json(data) : res.status(404).json({message: 'Circuit not found'});
});

// Fetches circuits involved in races for a specific season; returns an error if none are found.
app.get('/api/circuits/season/:year', async (req, res) => {

    if(isNaN(req.params.year)){

        res.status(404).json({message: 'Invalid input'});
    }
    const {data:raceData, error:searchError} = await supabase.from('races').select('circuitId').eq('year', req.params.year).order('round', {ascending:true});
    const circuitIds = raceData.map(race => race.circuitId);
    const {data:circuitData, error:circuitErrorerror} = await supabase.from('circuits').select().in('circuitId', circuitIds);
    circuitData.length ? res.json(circuitData) : res.status(404).json({message: 'No circuits available for this season'});
});

// Fetches and returns all constructors; returns an error if none are found.
app.get('/api/constructors', async (req, res) => {
    const {data, error} = await supabase.from('constructors').select();
    data.length ? res.json(data) : res.status(404).json({message: 'No Constructors available'});
});

// Fetches and returns a specific constructor by reference; returns an error if not found.
app.get('/api/constructors/:ref', async (req, res) => {
    const {data, error} = await supabase.from('constructors').select().eq('constructorRef', req.params.ref);
    data.length ? res.json(data) : res.status(404).json({message: 'Constructor not found'});
});

// Fetches and returns all drivers; returns an error if none are found.
app.get('/api/drivers', async (req, res) => {
    const {data, error} = await supabase.from('drivers').select();
    data.length ? res.json(data) : res.status(404).json({message: 'No drivers available'});
});

// Fetches and returns a specific driver by reference, case-insensitively; returns an error if not found.
app.get('/api/drivers/:ref', async (req, res) => {
    const {data, error} = await supabase.from('drivers').select().ilike('driverRef', req.params.ref);
    data.length ? res.json(data) : res.status(404).json({message: 'Driver not found'});
});

// Fetches and returns drivers based on a search term in their surname, case-insensitively; returns an error if not found.
app.get('/api/drivers/search/:ref', async (req, res) => {
    const {data, error} = await supabase.from('drivers').select().ilike('surname',`${req.params.ref.toLowerCase()}%`);
    data.length ? res.json(data) : res.status(404).json({message: 'Driver not found with that surname'});
});

// Fetches and returns drivers participating in a specific race; returns an error if none are found.
app.get('/api/drivers/race/:ref', async (req, res) => {
    if(isNaN(req.params.ref)){
        res.status(404).json({message: 'Invalid race ID'});
    }
    const { data:race, error:raceError } = await supabase.from('results').select('driverId').eq('raceId', req.params.ref);
    const driverIds = race.map(driver => driver.driverId);
    const {data, error}= await supabase.from('drivers').select().in('driverId', driverIds);
    data.length ? res.json(data) : res.status(404).json({message: 'No drivers found for that race'});
});

// Fetches and returns details of a specific race by race ID; returns an error if not found.
app.get('/api/races/:raceID', async (req, res) => {
    const {data, error} = await supabase.from('races').select('raceId, year, round, circuits!inner(name, location, country), name, date, time, url, fp1_date, fp1_time, fp2_date, fp2_time, fp3_date, fp3_time, quali_date, quali_time, sprint_date, sprint_time').eq('raceId', req.params.raceID);
    data.length ? res.json(data) : res.status(404).json({message: 'Race not found'});
});
// Fetches detailed results for a specific driver by their reference ID
app.get('/api/results/driver/:ref', async (req, res) => {
    const { data: driverData, error: circuitError } = await supabase
    .from('drivers')
    .select('driverId')
    .eq('driverRef', req.params.ref).single(); 
    if(driverData==null){
      res.status(404).json({message: 'No results found for that driver'
    });}
    else{
    const { data , error} = await supabase
      .from('results')
      .select('resultId, number, grid, position, positionText, positionOrder, points, laps, time, milliseconds, fastestLap, rank, fastestLapTime, fastestLapSpeed, statusId, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)')
      .eq('driverId', driverData.driverId);
      data.length ? res.json(data): res.status(404).json({message: 'No results found for that driver'});}
    });
 
 // Retrieves a driver's results filtered by a specified season range
 app.get('/api/results/driver/:ref/seasons/:start/:end', async (req, res) => {
    if(parseInt(req.params.start) > parseInt(req.params.end) || isNaN(req.params.end)||isNaN(req.params.start)){
       return res.status(400).json({ message: "Please enter a valid start and end time, both must be numbers and start must be earlier than end" });
    }
    const{data:raceData, error:searchError} =  await supabase
       .from('races')
       .select('raceId')
       .gte('year', req.params.start)
       .lte('year', req.params.end);
   if(raceData==null){
      res.status(404).json({message: 'No races found for that circuit'});
      
    }
    const raceIds = raceData.map(race => race.raceId);
    const { data: driverData, error: circuitError } = await supabase
    .from('drivers')
    .select('driverId')
    .eq('driverRef', req.params.ref).single(); 
    if(driverData==null){
      res.status(404).json({message: 'No driver found'});
      
    }
    const { data , error} = await supabase
      .from('results')
      .select('resultId, number, grid, position, positionText, positionOrder, points, laps, time, milliseconds, fastestLap, rank, fastestLapTime, fastestLapSpeed, statusId, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)')
      .eq('driverId', driverData.driverId).in('raceId', raceIds);
      data.length ? res.json(data): res.status(404).json({message: 'No results found between those years'});
    });
 
 // Returns qualifying results for a specific race by race ID
 app.get('/api/qualifying/:raceId', async (req, res) => {
    if(isNaN(req.params.raceId)){
       res.status(404).json({message: 'invalid input'})
       
     }
    const {data, error} = await supabase
    .from('qualifying')
    .select('qualifyId, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality), number, position, q1, q2, q3').eq('raceId', req.params.raceId).order('position', {ascending:true});
    data.length ? res.json(data): res.status(404).json({message: 'No results found for that race'});
   }); 
 
 // Retrieves driver standings for a specific race by race ID
 app.get('/api/standings/:raceId/drivers', async (req, res) => {
     if(isNaN(req.params.raceId)){
       res.status(404).json({message: 'invalid input'})
       
     }
    const {data, error} = await supabase
    .from('driverStandings')
    .select('driverStandingsId, drivers(driverRef, code, forename, surname), races(name, round, year, date), points, position, positionText, wins').eq('raceId', req.params.raceId).order('position', {ascending:true});
    data.length ? res.json(data): res.status(404).json({message: 'No results found for that race'});
   }); 
 
 // Provides constructor standings for a specific race by race ID
 app.get('/api/standings/:raceId/constructors', async (req, res) => {
     if(isNaN(req.params.raceId)){
       res.status(404).json({message: 'invalid input'})
       
     }
    const {data, error} = await supabase
    .from('constructorStandings')
    .select('constructorStandingsId, constructors(name, constructorRef, nationality), races(name, round, year, date), points, position, positionText, wins').eq('raceId', req.params.raceId).order('position', {ascending:true});
    data.length ? res.json(data): res.status(404).json({message: 'No results found for that race'});
 }); 
 