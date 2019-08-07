$(document).ready(()=>{
        $('#input-housename').on("keyup", function(e){
           console.log("hahah")
            var h_name=$(this).val();
            if(h_name==''){
                alert("error")
            }else{
                 $(this).parent().addClass('.has-success')
            }
           
    });
    
});
	
  