$( document ).ready(()=> {
    
        $('.house-btn').on("click", function(e){
            alert("hey")
                navigator.geolocation.getCurrentPosition(function(position) {
                          console.log(position)
                        var pos = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };
                        
                        var houses=$('.recommendedhouses').data('value');
                        var info={
                
                             currentloc:pos
                        }
                     $.ajax({
                              url: '/locate_house',
                              type: 'GET',
                              contentType: 'application/json',
                              dataType: 'json',
                              data: JSON.stringify(info),
                              complete: function() {
                                    console.log('Process completed!');
                              },
                              success: function(response) {
                             
                                     
                              },
                              error: function() {
                              
                                    console.log('Failed');
                              }
                        });

                });
          
        });
             
 
   
    $( ".like-btn,.btn btn-primary btn-sm" ).each(function(index) {
        $(this).on("click", function(e){
              var target = $(e.target);
            if($(this).attr("class")===('like-btn')){
                $(this).removeClass('like-btn');
                $(this).addClass('btn btn-primary btn-sm');
              // var num= $(this).child('.likes-num').html;
              // alert(num)
               //console.log(num);
                 var info={
                    houseid:$(this).attr('data'),
                    liked:false
                 }
            }
            else {
                 $(this).removeClass('btn btn-primary btn-sm');
                 $(this).addClass('like-btn');
                  var info={
                    houseid:$(this).attr('data'),
                    liked:true
                 }
            }
           console.log('Like house of id '+ $(this).attr('data') );
              
                        
                        console.log(info)
                        $.ajax({
                              url: '/house_like',
                              type: 'POST',
                              contentType: 'application/json',
                              dataType: 'json',
                              data: JSON.stringify(info),
                              complete: function() {
                                    console.log('Process completed!');
                              },
                              success: function() {
                                    ;
                              },
                              error: function() {
                                    console.log('Failed');
                              }
                        });
        });
    });
    
     $(".comment-div").each(function(index) {
       //  var comment1=  $("this.comment-cont").val();
         var m;
            $(this).children('.comment-cont').on('keyup',function(e) {
                 m=$(this).val()
                console.log(m);
            })
        $(this).children('.comment-btn').on('click',function(e) {
                   console.log("clicked")
                    //var comment=$(".comment-cont").val();   
                       // console.log("The comment is " + m)
                    var comment={
                         houseid:$(this).data('value'),
                         text:m
                    }
                       console.log(comment)
                        $.ajax({
                              url: '/house_comment',
                              type: 'POST',
                              contentType: 'application/json',
                              dataType: 'json',
                              data: JSON.stringify(comment),
                              complete: function() {
                                    console.log('Process completed!');
                              },
                              success: function() {
                                    ;
                              },
                              error: function() {
                                    console.log('Failed');
                              }
                        });
             
                    
        });
    });
    
    //Rating system
    $('#stars li').on('click', function(){
        var onStar = parseInt($(this).data('value'), 10); // The star currently selected
        var stars = $(this).parent().children('li.star');
        
       console.log(stars.length);
    
  });
  
      $("select").on('change',function(){
       
          var selectedlocation = $('select').children("option:selected").val();
          console.log(selectedlocation)
          var i= selectedlocation.split(" ",1)
          console.log(i[0]);
           $('.house').hide();
           $('.loader').show();
           setTimeout(function() {
               if(selectedlocation=='all'){
              $('.house').show();
              $('.loader').hide();
         }else{
               $(".house").each(function(index) {
                   var loc= $(this).data('value');
                 // console.log(loc)
                   if(loc==i){
                       $(this).show()
                       $('.loader').hide();
                      //console.log("yes")
                   }
               
           })
         }
           },2000)
         
          
      })
    
});

    

  