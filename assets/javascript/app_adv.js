var config = {
  apiKey: "AIzaSyDTz5XIyuo9nULZHqpuPchQL4TVNsXS32o",
  authDomain: "myrcbclass.firebaseapp.com",
  databaseURL: "https://myrcbclass.firebaseio.com",
  projectId: "myrcbclass",
  storageBucket: "myrcbclass.appspot.com",
  messagingSenderId: "229680771388"
};
firebase.initializeApp(config);

var dataRef = firebase.database();

var tmr;
var ctd_intrvl;
var timeleft;
var ctd_timer;

//display of data
fn_datadisplay();

//timeleft=60;
//start timer for countdown
fn_countdown();

//pushing new train details to database
$(document).on("click", ".btn", function() {
  dataRef.ref("/train_details").push({
      train_name: $("#train_name").val(),
      destination: $("#destination").val(),
      first_train_time: $("#first_train_time").val(),
      frequency: $("#frequency").val(),
      dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

  //empties the form data
  $("#train_name").val("");
  $("#destination").val("");
  $("#first_train_time").val("");
  $("#frequency").val("");

  //starts the countdown again, empties the table body and load fresh data to it
  clearInterval(ctd_timer);
  fn_countdown();
  $("#test").empty();
  fn_datadisplay();
}
);



//defining the function to get the data from db on child added
function fn_datadisplay(){

  dataRef.ref("/train_details").on("child_added",
          function(childSnapshot) {
              console.log("Inside child added");
              //To form the table from database
              tb = $("tbody");
              tb.attr("id","test");
              // Create and save a reference to new empty table row
              var tr = $("<tr>");
              // Create and save references to td elements 

              var tdtrName = $("<td>");
              tdtrName.text(childSnapshot.val().train_name);

              var tdDestination = $("<td>");
              tdDestination.text(childSnapshot.val().destination);

              var tdfrequency = $("<td>");
              tdfrequency.text(childSnapshot.val().frequency);

              ////Getting values of next arrival and Minutes away 


              // Assumptions
              var tFrequency = childSnapshot.val().frequency;

              // Time is 3:30 AM
              var firstTime = childSnapshot.val().first_train_time;

              // First Time (pushed back 1 year to make sure it comes before current time)

              var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
      //        console.log("CONVERTED TIME: " + firstTimeConverted.format("HH:mm"));

              // Current Time
              var currentTime = moment();
      //        console.log("CURRENT TIME: " + currentTime.format("HH:mm"));

              // Difference between the times
              var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
      //        console.log("DIFFERENCE IN TIME: " + diffTime);

              // Time apart (remainder)
              var tRemainder = diffTime % tFrequency;
    //          console.log(tRemainder);

              // Minute Until Train
              var tMinutesTillTrain = tFrequency - tRemainder;
      //        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

              // Next Train
              var nextTrain = moment().add(tMinutesTillTrain, "minutes");
     //         console.log("ARRIVAL TIME: " + moment(nextTrain).format("HH:mm"));

              var tdNxtArrival = $("<td>");
              tdNxtArrival.text(moment(nextTrain).format("HH:mm"));

              var tdminsTillTrain = $("<td>");
              tdminsTillTrain.text(tMinutesTillTrain);

              var tdDel = $("<button>");
              //tdDel.text("X");
              tdDel.html("<i class='fa fa-trash' aria-hidden='true'></i> Delete")
              tdDel.addClass("to_del");
              //setting train name to button attr value which is coming from snapshot val (from database)
              tdDel.attr("tr_nm",childSnapshot.val().train_name);

              ////

             
              // Append the table row data to the table row 
              tr.append(tdtrName, tdDestination, tdfrequency, tdNxtArrival, tdminsTillTrain, tdDel);
              // Append the table row to the tbody element
              tb.append(tr);
              // Handle the errors
          },
          function(errorObject) {
              console.log("Errors handled: " + errorObject.code);
          })

}

//this function is a countdown function, each time when the time left is 0, call the same function recursively 
//, empties the table body and gets the latest data from db 
function fn_countdown(){
  timeleft=60;
  $("#ctd").text(timeleft);
  ctd_timer = setInterval(function(){
      timeleft--;
      $("#ctd").text(timeleft);
      if (timeleft ==0){
        clearInterval(ctd_timer);
        fn_countdown();
        $("#test").empty();
        fn_datadisplay();
      }
    },1000); 
}


$(document.body).on("click", ".to_del",del);

function del(){
 console.log("You clicked on: "+$(this).attr("tr_nm"));
 //getting the handle of the node train details
          var train_details_Ref = dataRef.ref('train_details');
//getting that particular node where train name = name of the train in that node (getting from the button attr value)
          var query = train_details_Ref.orderByChild('train_name').equalTo($(this).attr("tr_nm"));
          query.on('child_added', function(snapshot) {
              snapshot.ref.remove();
          });
          $("#test").empty();
          clearInterval(ctd_timer);
          fn_countdown();
          fn_datadisplay();
          $("#train_name").val("");
          $("#destination").val("");
          $("#first_train_time").val("");
          $("#frequency").val("");

};

