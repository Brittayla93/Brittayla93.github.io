// Angular js app and controller for Notes
angular.module('notesApp',[]).
  controller('notesController', function($scope){
  
  // retrieving our data and converting it back into an array if it exist
  var data = localStorage.getItem("notesAppData");
  if (data !== null){
    $scope.notes = JSON.parse(data);
  } else {
    $scope.notes = [];
  }
  
  //function to add notes
  $scope.addNote = function(){
    $scope.notes.push({'text':$scope.newNote,'selected':false});
    $scope.newNote = "";
  };
  //function to remove a note
  $scope.removeNote = function(index){
    console.log(index);
    $scope.notes.splice(index, 1);
  };
  //function to remove selected notes
  $scope.removeSelectedNote = function(){
    $scope.notes = $scope.notes.filter(function(arr){
      return !arr.selected;
    });
  };
  
  // storing our data/array as a string in browser storage
  $scope.saveNotes = function(){
    //check if browser support localstorage
    if (typeof(Storage) !== "undefined") {
       localStorage.setItem("notesAppData", angular.toJson($scope.notes));
    } else {
       alert("Sorry! No Web Storage support..");
    }
  };
  
});
