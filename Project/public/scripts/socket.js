
 var socket = io();

socket.on('connect', ()=>{
       
     
  
     /*Upload form*/
     
   
       
             
         
              
               
                if(window.location.pathname.search('/view_house')>-1){
                    var pathArray = window.location.pathname.split('/');
                      console.log("Hellooo");
                  socket.emit('fetch-house-location',pathArray,function(data){
                  // console.log(data)
                 // Initialize and add the map
                 
                     initMap = function () {
                      // The location of Uluru
                      console.log(data)
                    var markerArray = [];
                      var uluru = {lat: parseFloat(data.lat), lng: parseFloat(data.long)};
                       var infowindow = new google.maps.InfoWindow();
                      // The map, centered at Uluru
                     // var directionsService = new google.maps.DirectionsService;
                      var map = new google.maps.Map(
                          document.getElementById('map'), {zoom: 15, center: uluru});
                    //   // The marker, positioned at Uluru
                    //   var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
                    //   var stepDisplay = new google.maps.InfoWindow;
                       
                
                        // Display the route between the initial start and end selections.
                        //( directionsDisplay, directionsService, markerArray, stepDisplay, map);
                        // Listen to change events from the start and end lists.
                        // var onChangeHandler = function() {
                        //   calculateAndDisplayRoute(
                        //       directionsDisplay, directionsService, markerArray, stepDisplay, map);
                        // };
                               var marker = new google.maps.Marker({
                        position: uluru, map: map,
                        icon:{
                                      path: google.maps.SymbolPath.CIRCLE,
                                      scale: 6.5,
                                      //fillColor: data.color,
                                      fillOpacity: 0.8,
                                      strokeWeight: 0.9
                                  }
                      });
                        
                                  infowindow.setContent('Location of  '+ data.housename);
                                  infowindow.open(map, marker);
                             
                    }
                    initMap();
                    var stars= $('#stars').parent().children('li.star');
                       for (var i = 0; i < data.rating; i++) {
                      $(stars[i]).addClass('selected');
                    }
                   
                   
                  });
                  
                }
                
                
                if(window.location.pathname.search('/index')>-1){
                    console.log('Meee')
                    if(navigator){
                        console.log('works');
                    }else{
                        console.log('dont')
                    }
                      navigator.geolocation.getCurrentPosition(function(position) {
                          console.log('I am in',position)
                        var pos = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };
                      $('.placeh').val(JSON.stringify(pos));
                        console.log('Am', $('.placeh').value);
                         socket.emit('my-location',pos,(data)=>{
                               $('.lds-ring').hide();
                           $('.mycurrent-location').html('You are in '+data.location);
                             $('.locatm').val(JSON.stringify(pos));
                           console.log('Am', $('.locatm').val());
                          })
                       
                      });
                    //var pathArray = window.location.pathname.split('/');
                   
                }
                
          
            
})
socket.on('disconnect', ()=>{
                console.log('Disconnected from server');
});
