const functions = require('firebase-functions');
const clustering = require('density-clustering');
//See https://www.npmjs.com/package/density-clustering if want to try clustering

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const afar = require('afar')
var radius = 0.5; //In kilometres

//Create a user
function User(id, role, start_location) {
    this.ID = id;
    this.Role = role;
    this.StartLocation = start_location;
}

function Location(lat, long) {
    this.latitude = lat;
    this.longitude = long;
}

var DifferentRoles = function(result_list) {
    const random_role_name = "random"
    for(i = 0; i < result_list.length - 1; i++) {
        for(j = i + 1; j < result_list.length; j++) {
            if(result_list[i].role !== random_role_name &&
                result_list[i].role === result_list[j].role) {
                return false;
            }
        }
    }
    return true;
}

var MakePositionsList = function(user_list) {
    var list = [];
    for(i = 0; i < user_list.length; ++i) {
        var location = [];
        location.push(user_list[i].latitude);
        location.push(user_list[i].longitude);
        list.push(location);
    }
    return list;
}

//Returns a set of users that match
var MatchUsers = function(user_list) {
    for(i = 0; i < user_list.length - 2; ++i) {
        var user_matches = [user_list[i]]
        for(j = i + 1; j < user_list.length; ++j) {
            var location1 = user_list[i].location;
            var location2 = user_list[j].location;
            var distance = afar(location1.latitude, location1.longitude,
                                location2.latitude, location2.longitude);
            if(distance < 2 * radius) {
                    user_matches.push(user_list[j])
            }
        }
        var different_roles = DifferentRoles(user_matches)
        //console.log(DifferentRoles(user_matches))
        if((user_matches.length >= 3) && different_roles) {
            return user_matches
        }
    }
    //No suitable users found 
    return []
}

//Overall matchmaking, which uses match users
var Matchmaking = function(user_list) {
    if(user_list.length < 3) {
        console.log("not enough users to build a team at the moment");
        return []
    }

    var matched_users = MatchUsers(user_list)
    if(matched_users.length === 0) {
        console.log("No suitable team found")
        return []
    }

    console.log("Resulting users are ", matched_users)
    return matched_users;
}

exports.Matchmaking = Matchmaking;

firestore_matchmaking = '/matchmaking'

//Note, perhaps this should be on on write
// exports.PlaceLocations = 
// functions.firestore.document(firestore_matchmaking).onCreate(
//     (event) => {
//         users = event.data.data()
//         Matchmaking(users)
//     }
// )