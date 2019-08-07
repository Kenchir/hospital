$( document ).ready(()=> {
    //alert('hey');
 
    
    //Rating system
    $('#stars li').on('click', function(){
    var onStar = parseInt($(this).data('value'), 10); // The star currently selected
    var stars = $(this).parent().children('li.star');
    var id= $(this).parent().data('value');
   var info={
      
       house_id:id,
       rating:onStar
   }
   console.log(info);
      $.ajax({
                              url: '/rating',
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
   
    //responseMessage(msg);
    
  });
     $('#btn-review').on('click', function(){
    var reviewetxt = $('#review-cont').val();
    var  house=$(this).data('value');
    var fname=$(this).data('fname');
   var lname= $(this).data('lname');
        console.log(fname)
        var info={
            msg:reviewetxt,
            house_id:house
        }
       	
    
var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;
        $('#all-reviews').last().append('<tr><td><h6>'+fname+' '+ lname+'<span class="pull-right" >'+'  '+dateTime+'</span></h6>'+reviewetxt+'</td></tr>');
        console.log(info)
        if(reviewetxt){
              $.ajax({
                              url: '/review_house',
                              type: 'POST',
                              contentType: 'application/json',
                              dataType: 'json',
                              data: JSON.stringify(info),
                              complete: function() {
                                    console.log('Process completed!');
                              },
                              success: function(response) {
                                    console.log(response)
                              },
                              error: function() {
                                    console.log('Failed');
                              }
                        });
        }

 $('#review-cont').val("");
   console.log(info);
    
  });
    
});

    

  